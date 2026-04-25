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
import { SITE_URL } from "@/lib/seo";

const DEFAULT_CMS_SITE_URL = SITE_URL;

function humanizeSupabaseError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "We could not start the login flow.";
  }
  // Supabase returns plain-text "Project paused" when the free-tier project is
  // inactive. supabase-js tries to JSON.parse it, which throws this message.
  if (
    error.message.includes("is not valid JSON") ||
    error.message.toLowerCase().includes("project paused") ||
    error.message.toLowerCase().includes("fetch failed")
  ) {
    return "Your Supabase project appears to be paused. Resume it at supabase.com/dashboard and try again.";
  }
  return error.message;
}

function buildAdminLocation(path: string, params?: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function parseCommaSeparatedValue(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getPublishOutcomeMessage() {
  const githubStatus = getGitHubPublishStatus();

  if (githubStatus.enabled) {
    return `Synced to GitHub (${githubStatus.repo}@${githubStatus.branch}). Vercel should redeploy automatically through the Git integration.`;
  }

  return "Saved locally only because GitHub sync is not configured yet.";
}

async function getRequestOrigin() {
  const configuredOrigin = normalizeOrigin(
    process.env.CMS_SITE_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      process.env.APP_URL ??
      process.env.VERCEL_PROJECT_PRODUCTION_URL ??
      process.env.VERCEL_URL ??
      DEFAULT_CMS_SITE_URL
  );

  if (configuredOrigin) {
    return configuredOrigin;
  }

  const headerStore = await headers();
  const explicitOrigin = normalizeOrigin(headerStore.get("origin") ?? "");

  if (explicitOrigin) {
    return explicitOrigin;
  }

  const refererOrigin = normalizeOrigin(headerStore.get("referer") ?? "");

  if (refererOrigin) {
    return refererOrigin;
  }

  const forwardedOrigin = getOriginFromForwardedHeader(headerStore.get("forwarded") ?? "");

  if (forwardedOrigin) {
    return forwardedOrigin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";
  const derivedOrigin = normalizeOrigin(host ? `${protocol}://${host}` : "");

  if (derivedOrigin) {
    return derivedOrigin;
  }

  return DEFAULT_CMS_SITE_URL;
}

function normalizeOrigin(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return "";
  }

  if (trimmedValue.startsWith("http://") || trimmedValue.startsWith("https://")) {
    return trimmedValue.replace(/\/$/, "");
  }

  return `https://${trimmedValue.replace(/\/$/, "")}`;
}

function getOriginFromForwardedHeader(value: string) {
  const forwardedEntry = value
    .split(",")
    .map((entry) => entry.trim())
    .find(Boolean);

  if (!forwardedEntry) {
    return "";
  }

  const protocolMatch = forwardedEntry.match(/proto=([^;]+)/i);
  const hostMatch = forwardedEntry.match(/host=([^;]+)/i);
  const protocol = protocolMatch?.[1]?.replace(/^"|"$/g, "");
  const host = hostMatch?.[1]?.replace(/^"|"$/g, "");

  return normalizeOrigin(protocol && host ? `${protocol}://${host}` : "");
}

export async function requestCmsMagicLink(formData: FormData) {
  let destination = buildAdminLocation("/admin/login", {
    type: "error",
    message: "Supabase is not configured for CMS login yet.",
  });

  try {
    if (!isSupabaseConfigured()) {
      destination = buildAdminLocation("/admin/login", {
        type: "error",
        message: "Supabase is not configured for CMS login yet.",
      });
    } else {
      const fallbackEmail = hasSingleConfiguredCmsAdmin() ? getDefaultCmsEmail() : "";
      const email = String(formData.get("email") ?? fallbackEmail).trim().toLowerCase();

      if (!email) {
        destination = buildAdminLocation("/admin/login", {
          type: "error",
          message: "Enter your admin email first.",
        });
      } else if (!(await isAuthorizedCmsEmail(email))) {
        destination = buildAdminLocation("/admin/login", {
          type: "error",
          message: "That email is not allowed to access this CMS.",
        });
      } else {
        const supabase = await createSupabaseServerClient();
        const callbackUrl = `${await getRequestOrigin()}/admin/auth/callback?next=/admin/manage-posts`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: callbackUrl,
            shouldCreateUser: false,
          },
        });

        destination = error
          ? buildAdminLocation("/admin/login", {
              type: "error",
              message: error.message,
            })
          : buildAdminLocation("/admin/login", {
              type: "success",
              message: "Magic link sent. Open it on this device to enter the CMS.",
            });
      }
    }
  } catch (error) {
    destination = buildAdminLocation("/admin/login", {
      type: "error",
      message: humanizeSupabaseError(error),
    });
  }

  redirect(destination);
}

export async function signOutCms() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect(
    buildAdminLocation("/admin/login", {
      type: "success",
      message: "You have been signed out of the CMS.",
    })
  );
}

export async function publishCmsPostAction(formData: FormData) {
  let destination = buildAdminLocation("/admin/manage-posts", {
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

    const isUpdate = formData.get("isUpdate") === "true";
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
      hero: {
        image: String(formData.get("heroImage") ?? ""),
        imageAlt: String(formData.get("heroImageAlt") ?? ""),
        background: String(formData.get("heroBackground") ?? ""),
      },
      jsxSource,
      originalFileName,
      isUpdate,
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
      destination = buildAdminLocation("/admin/manage-posts", {
        type: "error",
        message:
          error instanceof Error
            ? `Published locally, but GitHub sync failed: ${error.message}`
            : "Published locally, but GitHub sync failed.",
      });
      redirect(destination);
    }

    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    revalidatePath("/admin/manage-posts");

    destination = buildAdminLocation("/admin/manage-posts", {
      type: "success",
      message: `${isUpdate ? "Updated" : "Published"} ${post.title}. ${getPublishOutcomeMessage()}`,
    });
  } catch (error) {
    destination = buildAdminLocation("/admin/manage-posts", {
      type: "error",
      message: humanizeSupabaseError(error),
    });
  }

  redirect(destination);
}

export async function deleteCmsPostAction(slug: string) {
  let destination = buildAdminLocation("/admin/manage-posts", {
    type: "error",
    message: "We could not delete that post.",
  });

  try {
    await requireCmsSessionUser();

    const existingPost = (await getAllManagedBlogPosts()).find((entry) => entry.slug === slug);
    const cmsDeletePaths =
      existingPost?.source === "cms"
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
      destination = buildAdminLocation("/admin/manage-posts", {
        type: "error",
        message:
          error instanceof Error
            ? `Deleted locally, but GitHub sync failed: ${error.message}`
            : "Deleted locally, but GitHub sync failed.",
      });
      redirect(destination);
    }

    revalidatePath("/blog");
    revalidatePath("/blog/[slug]", "page");
    revalidatePath("/admin/manage-posts");

    destination = buildAdminLocation("/admin/manage-posts", {
      type: "success",
      message:
        deletedSource === "legacy"
          ? `The legacy post was hidden. ${getPublishOutcomeMessage()}`
          : `The CMS post was deleted. ${getPublishOutcomeMessage()}`,
    });
  } catch (error) {
    destination = buildAdminLocation("/admin/manage-posts", {
      type: "error",
      message: humanizeSupabaseError(error),
    });
  }

  redirect(destination);
}




