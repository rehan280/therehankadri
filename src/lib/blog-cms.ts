import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import {
  defaultBlogAuthor,
  blogPosts as legacyBlogPosts,
  type BlogFaqEntry,
  type BlogPost,
} from "@/lib/blog";
import { buildRichTextBodyFromMarkup } from "@/lib/blog-rich-text";
import { getBlogCategory } from "@/lib/blog-taxonomy";

type BlogAdminState = {
  hiddenSlugs: string[];
};

export type ManagedBlogPostSource = "legacy" | "cms";

export type ManagedBlogPost = BlogPost & {
  source: ManagedBlogPostSource;
  isHidden: boolean;
  filePath?: string;
  updatedAt?: string;
};

export type CreateCmsBlogPostInput = {
  title: string;
  metaTitle?: string;
  slug: string;
  categorySlug: string;
  subcategories: string[];
  keywords: string[];
  excerpt: string;
  cardBlurb: string;
  heroDescription: string;
  seoDescription: string;
  publishedAt: string;
  coverImage?: string;
  hero?: BlogPost["hero"];
  jsxSource: string;
  originalFileName?: string;
  isUpdate?: boolean;
};

const cmsRootDir = path.join(process.cwd(), "src", "content");
const cmsPostsDir = path.join(cmsRootDir, "blog-posts");
const cmsUploadsDir = path.join(cmsRootDir, "blog-jsx");
const adminStateFile = path.join(cmsRootDir, "blog-admin-state.json");

const defaultAdminState: BlogAdminState = {
  hiddenSlugs: [],
};

function comparePostsByDate(firstPost: BlogPost, secondPost: BlogPost) {
  const dateCompare = secondPost.publishedAt.localeCompare(firstPost.publishedAt);

  if (dateCompare !== 0) {
    return dateCompare;
  }

  return firstPost.title.localeCompare(secondPost.title);
}

function uniqueStringList(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return uniqueStringList(value.filter((item): item is string => typeof item === "string"));
}

function normalizeBlogPostHero(value: unknown): BlogPost["hero"] {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }

  const heroValue = value as Record<string, unknown>;
  const image =
    typeof heroValue.image === "string" && heroValue.image.trim()
      ? heroValue.image.trim()
      : undefined;
  const imageAlt =
    typeof heroValue.imageAlt === "string" && heroValue.imageAlt.trim()
      ? heroValue.imageAlt.trim()
      : undefined;
  const background =
    typeof heroValue.background === "string" && heroValue.background.trim()
      ? heroValue.background.trim()
      : undefined;

  if (!image && !imageAlt && !background) {
    return undefined;
  }

  return {
    image,
    imageAlt,
    background,
  };
}

function normalizeFaqEntries(value: unknown): BlogFaqEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null) {
      return [];
    }

    const question =
      typeof entry.question === "string" && entry.question.trim()
        ? entry.question.trim()
        : "";
    const answer =
      typeof entry.answer === "string" && entry.answer.trim()
        ? entry.answer.trim()
        : "";

    if (!question || !answer) {
      return [];
    }

    return [{ question, answer }];
  });
}

function normalizeBlogPost(rawPost: Record<string, unknown>): BlogPost {
  const slug = typeof rawPost.slug === "string" ? rawPost.slug : "";
  const title = typeof rawPost.title === "string" ? rawPost.title : slug;
  const excerpt = typeof rawPost.excerpt === "string" ? rawPost.excerpt : "";
  const seoDescription =
    typeof rawPost.seoDescription === "string" && rawPost.seoDescription.trim()
      ? rawPost.seoDescription
      : excerpt;
  const heroDescription =
    typeof rawPost.heroDescription === "string" && rawPost.heroDescription.trim()
      ? rawPost.heroDescription
      : excerpt;
  const cardBlurb =
    typeof rawPost.cardBlurb === "string" && rawPost.cardBlurb.trim()
      ? rawPost.cardBlurb
      : excerpt;

  const categoryValue = rawPost.category;
  const categorySlug =
    typeof categoryValue === "string"
      ? categoryValue
      : typeof categoryValue === "object" && categoryValue !== null && "slug" in categoryValue
        ? String(categoryValue.slug ?? "")
        : "seo";

  return {
    slug,
    title,
    metaTitle:
      typeof rawPost.metaTitle === "string" && rawPost.metaTitle.trim()
        ? rawPost.metaTitle
        : undefined,
    category: getBlogCategory(categorySlug),
    subcategories: normalizeStringArray(rawPost.subcategories),
    keywords: normalizeStringArray(rawPost.keywords),
    coverImage:
      typeof rawPost.coverImage === "string" && rawPost.coverImage.trim()
        ? rawPost.coverImage
        : undefined,
    hero: normalizeBlogPostHero(rawPost.hero),
    excerpt,
    cardBlurb,
    heroDescription,
    seoDescription,
    publishedAt:
      typeof rawPost.publishedAt === "string" && rawPost.publishedAt.trim()
        ? rawPost.publishedAt
        : new Date().toISOString().slice(0, 10),
    modifiedAt:
      typeof rawPost.modifiedAt === "string" && rawPost.modifiedAt.trim()
        ? rawPost.modifiedAt
        : undefined,
    readTime: typeof rawPost.readTime === "string" ? rawPost.readTime : "",
    author:
      typeof rawPost.author === "object" && rawPost.author !== null
        ? {
            ...defaultBlogAuthor,
            ...rawPost.author,
          }
        : defaultBlogAuthor,
    body:
      typeof rawPost.body === "object" && rawPost.body !== null
        ? (rawPost.body as BlogPost["body"])
        : null,
    faqEntries: normalizeFaqEntries(rawPost.faqEntries),
    summaryPoints: normalizeStringArray(rawPost.summaryPoints),
    intro: normalizeStringArray(rawPost.intro),
    sections: Array.isArray(rawPost.sections)
      ? (rawPost.sections as BlogPost["sections"])
      : [],
  };
}

async function ensureCmsStorageForWrites() {
  await fs.mkdir(cmsPostsDir, { recursive: true });
  await fs.mkdir(cmsUploadsDir, { recursive: true });

  try {
    await fs.access(adminStateFile);
  } catch {
    await fs.writeFile(
      adminStateFile,
      `${JSON.stringify(defaultAdminState, null, 2)}\n`,
      "utf8"
    );
  }
}

async function readJsonFile<T>(filePath: string) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return null;
    }

    throw error;
  }
}

async function writeJsonFile(filePath: string, value: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readAdminState(): Promise<BlogAdminState> {
  const storedState = await readJsonFile<Partial<BlogAdminState>>(adminStateFile);

  return {
    hiddenSlugs: normalizeStringArray(storedState?.hiddenSlugs),
  };
}

async function writeAdminState(state: BlogAdminState) {
  await ensureCmsStorageForWrites();
  await writeJsonFile(adminStateFile, {
    hiddenSlugs: uniqueStringList(state.hiddenSlugs),
  });
}

async function loadCmsPostsFromDisk() {
  const directoryEntries = await fs
    .readdir(cmsPostsDir, { withFileTypes: true })
    .catch((error: unknown) => {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return null;
      }

      throw error;
    });

  if (!directoryEntries) {
    return [];
  }

  const jsonFiles = directoryEntries.filter(
    (entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".json")
  );

  const posts = await Promise.all(
    jsonFiles.map(async (entry) => {
      const filePath = path.join(cmsPostsDir, entry.name);
      const rawPost = await readJsonFile<Record<string, unknown>>(filePath);

      if (!rawPost) {
        return null;
      }

      const stats = await fs.stat(filePath);

      return {
        ...normalizeBlogPost(rawPost),
        source: "cms" as const,
        isHidden: false,
        filePath,
        updatedAt: stats.mtime.toISOString(),
      } satisfies ManagedBlogPost;
    })
  );

  return posts.filter(Boolean) as ManagedBlogPost[];
}

export async function getAllManagedBlogPosts() {
  const [adminState, cmsPosts] = await Promise.all([
    readAdminState(),
    loadCmsPostsFromDisk(),
  ]);
  const hiddenSlugs = new Set(adminState.hiddenSlugs);

  const legacyPosts: ManagedBlogPost[] = legacyBlogPosts.map((post) => ({
    ...post,
    source: "legacy",
    isHidden: hiddenSlugs.has(post.slug),
  }));

  const combinedPosts = [...legacyPosts, ...cmsPosts.map((post) => ({
    ...post,
    isHidden: hiddenSlugs.has(post.slug),
  }))];

  const dedupedPosts = Array.from(
    new Map(combinedPosts.map((post) => [post.slug, post])).values()
  );

  return dedupedPosts.sort(comparePostsByDate);
}

export async function getVisibleManagedBlogPosts() {
  const posts = await getAllManagedBlogPosts();
  return posts.filter((post) => !post.isHidden);
}

export async function getVisibleBlogPostBySlug(slug: string) {
  const posts = await getVisibleManagedBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getVisibleBlogCategories() {
  const posts = await getVisibleManagedBlogPosts();
  const categoryMap = new Map<string, BlogPost["category"]>();

  posts.forEach((post) => {
    categoryMap.set(post.category.slug, post.category);
  });

  return Array.from(categoryMap.values());
}

export async function getVisibleRelatedBlogPosts(currentSlug: string) {
  const posts = await getVisibleManagedBlogPosts();
  return posts.filter((post) => post.slug !== currentSlug).slice(0, 3);
}

function assertValidSlug(slug: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug must use lowercase letters, numbers, and hyphens only.");
  }
}

function assertValidPublishedAt(publishedAt: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedAt)) {
    throw new Error("Publish date must use YYYY-MM-DD format.");
  }
}

function getUploadExtension(fileName?: string) {
  if (!fileName) {
    return ".jsx";
  }

  const extension = path.extname(fileName).toLowerCase();
  const allowedExtensions = new Set([".jsx", ".tsx", ".txt", ".html", ".mdx"]);

  return allowedExtensions.has(extension) ? extension : ".jsx";
}

function buildCmsPostFilePath(slug: string) {
  return path.join(cmsPostsDir, `${slug}.json`);
}

export async function createCmsBlogPost(input: CreateCmsBlogPostInput) {
  await ensureCmsStorageForWrites();

  const slug = input.slug.trim().toLowerCase();
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  let jsxSource = input.jsxSource.trim();
  const publishedAt = input.publishedAt.trim();

  if (!title) {
    throw new Error("Title is required.");
  }

  if (!excerpt) {
    throw new Error("Excerpt is required.");
  }

  if (!jsxSource) {
    throw new Error("Paste JSX content or upload a JSX file before publishing.");
  }
  
  if (jsxSource && (jsxSource.startsWith("#") || jsxSource.startsWith("|") || (!jsxSource.includes("<p>") && !jsxSource.includes("<div>")))) {
    const { marked } = await import("marked");
    jsxSource = await marked.parse(jsxSource);
  }

  assertValidSlug(slug);
  assertValidPublishedAt(publishedAt);

  const existingPost = (await getAllManagedBlogPosts()).find((post) => post.slug === slug);

  if (existingPost && !input.isUpdate) {
    throw new Error(`A post with the slug "${slug}" already exists.`);
  }

  const body = buildRichTextBodyFromMarkup(jsxSource);

  if (!body.root.children.length) {
    throw new Error("The uploaded JSX did not contain any publishable blog content.");
  }

  const post: BlogPost = {
    slug,
    title,
    metaTitle: input.metaTitle?.trim() || undefined,
    category: getBlogCategory(input.categorySlug),
    subcategories: uniqueStringList(input.subcategories),
    keywords: uniqueStringList(input.keywords),
    coverImage: input.coverImage?.trim() || undefined,
    hero: normalizeBlogPostHero(input.hero),
    excerpt,
    cardBlurb: input.cardBlurb.trim() || excerpt,
    heroDescription: input.heroDescription.trim() || excerpt,
    seoDescription: input.seoDescription.trim() || excerpt,
    publishedAt,
    modifiedAt: publishedAt,
    readTime: "",
    author: defaultBlogAuthor,
    body,
    faqEntries: [],
    summaryPoints: [],
    intro: [],
    sections: [],
  };

  const postFilePath = buildCmsPostFilePath(slug);
  const uploadFilePath = path.join(cmsUploadsDir, `${slug}${getUploadExtension(input.originalFileName)}`);

  await writeJsonFile(postFilePath, post);
  await fs.writeFile(uploadFilePath, input.jsxSource, "utf8");

  const adminState = await readAdminState();
  if (adminState.hiddenSlugs.includes(slug)) {
    await writeAdminState({
      hiddenSlugs: adminState.hiddenSlugs.filter((value) => value !== slug),
    });
  }

  return {
    ...post,
    source: "cms" as const,
    isHidden: false,
    filePath: postFilePath,
    updatedAt: new Date().toISOString(),
  } satisfies ManagedBlogPost;
}

async function deleteCmsUploadCopies(slug: string) {
  try {
    const entries = await fs.readdir(cmsUploadsDir, { withFileTypes: true });

    await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.startsWith(`${slug}.`))
        .map((entry) => fs.unlink(path.join(cmsUploadsDir, entry.name)))
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return;
    }

    throw error;
  }
}

export async function deleteManagedBlogPost(slug: string) {
  const post = (await getAllManagedBlogPosts()).find((entry) => entry.slug === slug);

  if (!post) {
    throw new Error("That post could not be found.");
  }

  if (post.source === "cms") {
    const postFilePath = buildCmsPostFilePath(slug);

    try {
      await fs.unlink(postFilePath);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !("code" in error) ||
        (error as NodeJS.ErrnoException).code !== "ENOENT"
      ) {
        throw error;
      }
    }

    await deleteCmsUploadCopies(slug);

    const adminState = await readAdminState();
    if (adminState.hiddenSlugs.includes(slug)) {
      await writeAdminState({
        hiddenSlugs: adminState.hiddenSlugs.filter((value) => value !== slug),
      });
    }

    return "cms" as const;
  }

  const adminState = await readAdminState();
  if (!adminState.hiddenSlugs.includes(slug)) {
    adminState.hiddenSlugs.push(slug);
    await writeAdminState(adminState);
  }

  return "legacy" as const;
}

export function getCmsStorageSummary() {
  return {
    postsDir: cmsPostsDir,
    uploadsDir: cmsUploadsDir,
  };
}



export function getCmsPostFilePath(slug: string) {
  return buildCmsPostFilePath(slug);
}

export function getCmsAdminStateFilePath() {
  return adminStateFile;
}

export async function getCmsUploadCopyFilePaths(slug: string) {
  try {
    const entries = await fs.readdir(cmsUploadsDir, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isFile() && entry.name.startsWith(`${slug}.`))
      .map((entry) => path.join(cmsUploadsDir, entry.name));
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      return [];
    }

    throw error;
  }
}

export async function getCmsPostJsxSource(slug: string): Promise<string> {
  const uploadPaths = await getCmsUploadCopyFilePaths(slug);
  if (uploadPaths.length > 0) {
    try {
      return await fs.readFile(uploadPaths[0], "utf8");
    } catch {
      return "";
    }
  }
  return "";
}












