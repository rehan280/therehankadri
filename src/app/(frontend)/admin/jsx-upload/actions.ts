"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createCmsBlogPost,
  deleteManagedBlogPost,
  getAllManagedBlogPosts,
  getCmsAdminStateFilePath,
  getCmsPostFilePath,
  getCmsUploadCopyFilePaths,
} from "@/lib/blog-cms";
import {
  getDefaultCmsEmail,
  hasSingleConfiguredCmsAdmin,
  isAuthorizedCmsEmail,
  requireCmsSessionUser,
} from "@/lib/cms-auth";
import {
  getGitHubPublishStatus,
  syncCmsFilesToGitHub,
} from "@/lib/github-publisher";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getVercelDeployStatus,
  triggerVercelDeploy,
} from "@/lib/vercel-deploy";

function buildAdminLocation(params?: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `/admin/jsx-upload?${query}` : "/admin/jsx-upload";
}

function parseCommaSeparatedValue(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getPublishOutcomeMessage() {
  const githubStatus = getGitHubPublishStatus();
  const vercelStatus = getVercelDeployStatus();

  const messages: string[] = [];

  if (githubStatus.enabled) {
    messages.push(`Synced to GitHub (${githubStatus.repo}@${githubStatus.branch}).`);
  } else {
    messages.push("Saved locally only because GitHub sync is not configured yet.");
  }

  if (vercelStatus.enabled) {
    messages.push(
      `Triggered a Vercel deploy${vercelStatus.projectName ? ` for ${vercelStatus.projectName}` : ""}.`
    );
  } else {
    messages.push(
      "If your GitHub repo is connected to Vercel, the GitHub commit should still redeploy automatically."
    );
  }

  return messages.join(" ");
}

async function getRequestOrigin() {
  const headerStore = await headers();
  const explicitOrigin = headerStore.get("origin");

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

export async function requestCmsMagicLink(formData: FormData) {
  let destination = buildAdminLocation({
    type: "error",
    message: "Supabase is not configured for CMS login yet.",
  });

  try {
    if (!isSupabaseConfigured()) {
      destination = buildAdminLocation({
        type: "error",
        message: "Supabase is not configured for CMS login yet.",
      });
    } else {
      const fallbackEmail = hasSingleConfiguredCmsAdmin() ? getDefaultCmsEmail() : "";
      const email = String(formData.get("email") ?? fallbackEmail).trim().toLowerCase();

      if (!email) {
        destination = buildAdminLocation({
          type: "error",
          message: "Enter your admin email first.",
        });
      } else if (!(await isAuthorizedCmsEmail(email))) {
        destination = buildAdminLocation({
          type: "error",
          message: "That email is not allowed to access this CMS.",
        });
      } else {
        const supabase = await createSupabaseServerClient();
        const callbackUrl = `${await getRequestOrigin()}/admin/jsx-upload/auth/callback?next=/admin/jsx-upload`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: callbackUrl,
            shouldCreateUser: false,
          },
        });

        destination = error
          ? buildAdminLocation({
              type: "error",
              message: error.message,
            })
          : buildAdminLocation({
              type: "success",
              message: "Magic link sent. Open it on this device to enter the CMS.",
            });
      }
    }
  } catch (error) {
    destination = buildAdminLocation({
      type: "error",
      message: error instanceof Error ? error.message : "We could not start the login flow.",
    });
  }

  redirect(destination);
}

export async function signOutCms() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(
    buildAdminLocation({
      type: "success",
      message: "You have been signed out of the CMS.",
    })
  );
}

export async function publishCmsPostAction(formData: FormData) {
  let destination = buildAdminLocation({
    type: "error",
    message: "We could not publish that post.",
  });

  try {
    await requireCmsSessionUser();

    const uploadedFile = formData.get("jsxFile");
    const pastedSource = String(formData.get("jsxSource") ?? "").trim();
    let jsxSource = pastedSource;
    let originalFileName: string | undefined;

    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      jsxSource = await uploadedFile.text();
      originalFileName = uploadedFile.name;
    }

    const post = await createCmsBlogPost({
      title: String(formData.get("title") ?? ""),
      metaTitle: String(formData.get("metaTitle") ?? ""),
      slug: String(formData.get("slug") ?? ""),
      categorySlug: String(formData.get("category") ?? "seo"),
      subcategories: parseCommaSeparatedValue(formData.get("subcategories")),
      keywords: parseCommaSeparatedValue(formData.get("keywords")),
      excerpt: String(formData.get("excerpt") ?? ""),
      cardBlurb: String(formData.get("cardBlurb") ?? ""),
      heroDescription: String(formData.get("heroDescription") ?? ""),
      seoDescription: String(formData.get("seoDescription") ?? ""),
      publishedAt:
        String(formData.get("publishedAt") ?? "").trim() ||
        new Date().toISOString().slice(0, 10),
      coverImage: String(formData.get("coverImage") ?? ""),
      jsxSource,
      originalFileName,
    });

    const localFilePaths = [
      post.filePath ?? getCmsPostFilePath(post.slug),
      ...(await getCmsUploadCopyFilePaths(post.slug)),
    ];

    try {
      await syncCmsFilesToGitHub({
        commitMessage: `Publish blog post: ${post.slug}`,
        upsertLocalFilePaths: localFilePaths,
      });
    } catch (error) {
      destination = buildAdminLocation({
        type: "error",
        message:
          error instanceof Error
            ? `Published locally, but GitHub sync failed: ${error.message}`
            : "Published locally, but GitHub sync failed.",
      });
      redirect(destination);
    }

    try {
      await triggerVercelDeploy();
    } catch (error) {
      destination = buildAdminLocation({
        type: "error",
        message:
          error instanceof Error
            ? `Published and synced to GitHub, but Vercel deploy trigger failed: ${error.message}`
            : "Published and synced to GitHub, but Vercel deploy trigger failed.",
      });
      redirect(destination);
    }

    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    revalidatePath("/admin/jsx-upload");

    destination = buildAdminLocation({
      type: "success",
      message: `Published ${post.title}. ${getPublishOutcomeMessage()}`,
    });
  } catch (error) {
    destination = buildAdminLocation({
      type: "error",
      message: error instanceof Error ? error.message : "We could not publish that post.",
    });
  }

  redirect(destination);
}

export async function deleteCmsPostAction(slug: string) {
  let destination = buildAdminLocation({
    type: "error",
    message: "We could not delete that post.",
  });

  try {
    await requireCmsSessionUser();

    const existingPost = (await getAllManagedBlogPosts()).find((entry) => entry.slug === slug);
    const cmsDeletePaths = existingPost?.source === "cms"
      ? [getCmsPostFilePath(slug), ...(await getCmsUploadCopyFilePaths(slug))]
      : [];

    const deletedSource = await deleteManagedBlogPost(slug);

    try {
      await syncCmsFilesToGitHub(
        deletedSource === "legacy"
          ? {
              commitMessage: `Hide legacy blog post: ${slug}`,
              upsertLocalFilePaths: [getCmsAdminStateFilePath()],
            }
          : {
              commitMessage: `Delete blog post: ${slug}`,
              deleteLocalFilePaths: cmsDeletePaths,
            }
      );
    } catch (error) {
      destination = buildAdminLocation({
        type: "error",
        message:
          error instanceof Error
            ? `Deleted locally, but GitHub sync failed: ${error.message}`
            : "Deleted locally, but GitHub sync failed.",
      });
      redirect(destination);
    }

    try {
      await triggerVercelDeploy();
    } catch (error) {
      destination = buildAdminLocation({
        type: "error",
        message:
          error instanceof Error
            ? `Deleted and synced to GitHub, but Vercel deploy trigger failed: ${error.message}`
            : "Deleted and synced to GitHub, but Vercel deploy trigger failed.",
      });
      redirect(destination);
    }

    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    revalidatePath("/admin/jsx-upload");

    destination = buildAdminLocation({
      type: "success",
      message:
        deletedSource === "legacy"
          ? `The legacy post was hidden. ${getPublishOutcomeMessage()}`
          : `The CMS post was deleted. ${getPublishOutcomeMessage()}`,
    });
  } catch (error) {
    destination = buildAdminLocation({
      type: "error",
      message: error instanceof Error ? error.message : "We could not delete that post.",
    });
  }

  redirect(destination);
}
