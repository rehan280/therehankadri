import Link from "next/link";
import { RayEditorField } from "@/components/cms/RayEditorField";
import { blogCategoryOptions } from "@/lib/blog-taxonomy";
import {
  getAllManagedBlogPosts,
  getCmsStorageSummary,
  getCmsPostJsxSource,
  type ManagedBlogPost,
} from "@/lib/blog-cms";
import { publishCmsPostAction } from "../actions";
import styles from "../admin.module.css";
import { getGitHubPublishStatus } from "@/lib/github-publisher";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function readSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string
) {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CreatePostPage({ searchParams }: AdminPageProps) {
  const query = await searchParams;
  const editSlug = readSearchParam(query, "edit");
  const managedPosts = (await getAllManagedBlogPosts()) as ManagedBlogPost[];
  const postToEdit = editSlug ? managedPosts.find((p) => p.slug === editSlug) : null;
  let jsxSourceToEdit = postToEdit ? await getCmsPostJsxSource(editSlug) : "";

  if (postToEdit && !jsxSourceToEdit) {
    // Generate HTML from legacy post
    let html = "";
    if (postToEdit.intro?.length) {
      html += postToEdit.intro.map((p) => `<p>${p}</p>`).join("");
    }
    if (postToEdit.sections?.length) {
      postToEdit.sections.forEach((section) => {
        html += `<h2>${section.title}</h2>`;
        section.blocks.forEach((block) => {
          if (block.type === "paragraph") html += `<p>${block.text}</p>`;
          else if (block.type === "list") html += `<ul>${block.items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
          else if (block.type === "callout") html += `<h3>${block.title}</h3><p>${block.body}</p>`;
          else if (block.type === "quote") html += `<blockquote><p>${block.text}</p>${block.author ? `<p>- ${block.author}</p>` : ""}</blockquote>`;
        });
      });
    }
    jsxSourceToEdit = html;
  } else if (jsxSourceToEdit && (jsxSourceToEdit.trim().startsWith("#") || jsxSourceToEdit.trim().startsWith("|") || (!jsxSourceToEdit.includes("<p>") && !jsxSourceToEdit.includes("<div>")))) {
    // Parse raw markdown
    const { marked } = await import("marked");
    jsxSourceToEdit = await marked.parse(jsxSourceToEdit);
  }
  const storageSummary = getCmsStorageSummary();
  const githubStatus = getGitHubPublishStatus();

  return (
    <>
      <h1 className={styles.pageTitle}>{postToEdit ? "Edit Post" : "Add New Post"}</h1>

      <div className={styles.wpPanel}>
        <form action={publishCmsPostAction}>
          {postToEdit ? <input type="hidden" name="isUpdate" value="true" /> : null}
          <div className={styles.metaGrid}>
            <div className={styles.field}>
              <label htmlFor="post-title">Title</label>
              <input id="post-title" name="title" className={styles.input} defaultValue={postToEdit?.title} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-meta-title">Meta title</label>
              <input id="post-meta-title" name="metaTitle" className={styles.input} defaultValue={postToEdit?.metaTitle} />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-slug">URL slug</label>
              <input
                id="post-slug"
                name="slug"
                className={styles.input}
                placeholder="your-blog-post-slug"
                defaultValue={postToEdit?.slug}
                required
                readOnly={!!postToEdit}
                style={postToEdit ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-date">Publish date</label>
              <input
                id="post-date"
                name="publishedAt"
                type="date"
                className={styles.input}
                defaultValue={postToEdit?.publishedAt || new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-category">Category</label>
              <select id="post-category" name="category" className={styles.select} defaultValue={postToEdit?.category?.slug || "seo"}>
                {blogCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="post-subcategories">Subcategories</label>
              <input
                id="post-subcategories"
                name="subcategories"
                className={styles.input}
                placeholder="Revenue SEO, Case Studies"
                defaultValue={postToEdit?.subcategories?.join(", ")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-keywords">Meta keywords</label>
              <input
                id="post-keywords"
                name="keywords"
                className={styles.input}
                placeholder="seo roadmap, b2b seo, qualified pipeline"
                defaultValue={postToEdit?.keywords?.join(", ")}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-cover">Cover image URL</label>
              <input
                id="post-cover"
                name="coverImage"
                className={styles.input}
                placeholder="/images/blog/cover.webp"
                defaultValue={postToEdit?.coverImage}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-hero-image">Custom hero image URL</label>
              <input
                id="post-hero-image"
                name="heroImage"
                className={styles.input}
                placeholder="/blog/your-post/hero.webp"
                defaultValue={postToEdit?.hero?.image}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-hero-image-alt">Custom hero image alt</label>
              <input
                id="post-hero-image-alt"
                name="heroImageAlt"
                className={styles.input}
                placeholder="Describe the hero artwork"
                defaultValue={postToEdit?.hero?.imageAlt}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-hero-background">Custom hero background</label>
              <input
                id="post-hero-background"
                name="heroBackground"
                className={styles.input}
                placeholder="linear-gradient(135deg, #ff4d45 0%, #ff2f2f 100%)"
                defaultValue={postToEdit?.hero?.background}
              />
            </div>
          </div>

          <div style={{ display: "grid", gap: "10px", marginTop: "15px" }}>
            <div className={styles.field}>
              <label htmlFor="post-excerpt">Excerpt</label>
              <textarea id="post-excerpt" name="excerpt" className={styles.textarea} defaultValue={postToEdit?.excerpt} required />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-card">Card blurb</label>
              <textarea id="post-card" name="cardBlurb" className={styles.textarea} defaultValue={postToEdit?.cardBlurb} />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-hero">Hero description</label>
              <textarea id="post-hero" name="heroDescription" className={styles.textarea} defaultValue={postToEdit?.heroDescription} />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-seo">SEO description</label>
              <textarea id="post-seo" name="seoDescription" className={styles.textarea} defaultValue={postToEdit?.seoDescription} />
            </div>
            <div className={styles.field}>
              <label htmlFor="post-file">Upload JSX file</label>
              <input
                id="post-file"
                name="jsxFile"
                type="file"
                accept=".jsx,.tsx,.txt,.html,.mdx"
                className={styles.fileInput}
              />
            </div>
            <div className={styles.field}>
              <label>Post body (Rich Editor)</label>
              <RayEditorField
                name="jsxSource"
                placeholder="Start typing your post… or use / for slash commands"
                initialValue={jsxSourceToEdit}
              />
            </div>
          </div>

          <div className={styles.ctaRow}>
            <button type="submit" className={styles.button}>
              {postToEdit ? "Update Post" : "Publish Post"}
            </button>
            {postToEdit ? (
              <Link href="/admin/manage-posts" className={styles.secondaryButton}>
                Cancel Edit
              </Link>
            ) : null}
          </div>
        </form>
      </div>

      <div className={styles.wpPanel} style={{ marginTop: 20 }}>
        <h3 className={styles.pageTitle} style={{ fontSize: 16 }}>Storage Information</h3>
        <p style={{ marginTop: 10, fontSize: 13, color: "#646970" }}>
          Local JSON posts are saved in <code>{storageSummary.postsDir}</code> and the
          original uploaded JSX copy is saved in <code>{storageSummary.uploadsDir}</code>.
        <br/><br/>
          {githubStatus.enabled
            ? `GitHub sync is active for ${githubStatus.repo}@${githubStatus.branch}. Publishing here will save locally and commit directly to GitHub.`
            : "GitHub sync is currently off, so this admin will save to local content files only until GitHub env vars are configured."}
        <br/><br/>
          Vercel should redeploy automatically from the GitHub integration after each successful GitHub commit.
        </p>
      </div>
    </>
  );
}
