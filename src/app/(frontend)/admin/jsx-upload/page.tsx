import Link from "next/link";
import { formatBlogDate } from "@/lib/blog";
import { blogCategoryOptions } from "@/lib/blog-taxonomy";
import {
  getAllManagedBlogPosts,
  getCmsStorageSummary,
  type ManagedBlogPost,
} from "@/lib/blog-cms";
import {
  getCmsSessionUser,
  hasSingleConfiguredCmsAdmin,
} from "@/lib/cms-auth";
import { getGitHubPublishStatus } from "@/lib/github-publisher";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  deleteCmsPostAction,
  publishCmsPostAction,
  requestCmsMagicLink,
  signOutCms,
} from "./actions";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function readSearchParam(
  params: { [key: string]: string | string[] | undefined },
  key: string
) {
  const value = params[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function BlogJsxUploadPage({ searchParams }: AdminPageProps) {
  const [query, cmsUser] = await Promise.all([searchParams, getCmsSessionUser()]);
  const managedPosts: ManagedBlogPost[] = cmsUser
    ? ((await getAllManagedBlogPosts()) as ManagedBlogPost[])
    : [];
  const cmsConfigured = isSupabaseConfigured();
  const usesSingleConfiguredAdmin = hasSingleConfiguredCmsAdmin();
  const statusType = readSearchParam(query, "type") || (cmsConfigured ? "neutral" : "error");
  const statusMessage = readSearchParam(query, "message");
  const storageSummary = getCmsStorageSummary();
  const githubStatus = getGitHubPublishStatus();
  const livePosts = managedPosts.filter((post) => !post.isHidden);
  const hiddenPosts = managedPosts.length - livePosts.length;
  const cmsPosts = managedPosts.filter((post) => post.source === "cms");
  const statusClassName =
    statusType === "success"
      ? styles.statusSuccess
      : statusType === "error"
        ? styles.statusError
        : styles.statusNeutral;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>

        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Blog CMS Workspace</span>
          <h1 className={styles.title}>Publish JSX Posts Without Touching The Code By Hand</h1>
          <p className={styles.intro}>
            Use this private dashboard to sign in with Supabase, upload or paste JSX,
            generate a local post file automatically, and manage what appears on the live
            blog.
          </p>
        </div>
      </section>

      {statusMessage ? (
        <div className={`${styles.statusBanner} ${statusClassName}`}>{statusMessage}</div>
      ) : null}

      {!cmsConfigured ? (
        <div className={styles.authWrap}>
          <section className={styles.authCard}>
            <h2>Supabase setup needed</h2>
            <p>
              Add your Supabase URL, anon key, and service role key before this CMS can
              sign in or publish posts.
            </p>
          </section>
        </div>
      ) : !cmsUser ? (
        <div className={styles.authWrap}>
          <section className={styles.authCard}>
            <h2>Sign In To The Blog CMS</h2>
            <p>
              {usesSingleConfiguredAdmin
                ? "This workspace is locked to the configured admin account. Request a magic link and the server will send it without exposing the email in the page."
                : "Enter your approved admin email and Supabase will send a magic link for this dashboard."}
            </p>

            <form action={requestCmsMagicLink} className={styles.authForm}>
              <div className={styles.fieldGrid}>
                {!usesSingleConfiguredAdmin ? (
                  <div className={styles.field}>
                    <label htmlFor="cms-email">Admin email</label>
                    <input
                      id="cms-email"
                      name="email"
                      type="email"
                      className={styles.input}
                      placeholder="Enter your admin email"
                      autoComplete="email"
                      required
                    />
                  </div>
                ) : null}

                <div className={styles.ctaRow}>
                  <button type="submit" className={styles.button}>
                    Send Magic Link
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>
      ) : (
        <div className={styles.shell}>
          <div className={styles.topbar}>
            <div>
              <div className={styles.userChip}>Signed in as {cmsUser.email}</div>
            </div>
            <div className={styles.topbarActions}>
              <Link href="/blog" className={styles.linkButton}>
                View Live Blog
              </Link>
              <form action={signOutCms} className={styles.signOutForm}>
                <button type="submit" className={styles.secondaryButton}>
                  Sign Out
                </button>
              </form>
            </div>
          </div>

          <div className={styles.summaryStrip}>
            <div className={styles.summaryCard}>
              <strong>{livePosts.length}</strong>
              <span className={styles.muted}>Live posts</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>{cmsPosts.length}</strong>
              <span className={styles.muted}>CMS-created posts</span>
            </div>
            <div className={styles.summaryCard}>
              <strong>{hiddenPosts}</strong>
              <span className={styles.muted}>Hidden or deleted</span>
            </div>
          </div>

          <div className={styles.grid}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Create A Post</h2>
                  <p>
                    Fill in the SEO metadata, then upload or paste the JSX body. Publishing
                    creates a local content file and makes the post available at
                    <code> /blog/your-slug</code>.
                  </p>
                </div>
              </div>

              <form action={publishCmsPostAction}>
                <div className={styles.metaGrid}>
                  <div className={styles.field}>
                    <label htmlFor="post-title">Title</label>
                    <input id="post-title" name="title" className={styles.input} required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-meta-title">Meta title</label>
                    <input id="post-meta-title" name="metaTitle" className={styles.input} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-slug">URL slug</label>
                    <input
                      id="post-slug"
                      name="slug"
                      className={styles.input}
                      placeholder="your-blog-post-slug"
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-date">Publish date</label>
                    <input
                      id="post-date"
                      name="publishedAt"
                      type="date"
                      className={styles.input}
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-category">Category</label>
                    <select id="post-category" name="category" className={styles.select} defaultValue="seo">
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
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-keywords">Meta keywords</label>
                    <input
                      id="post-keywords"
                      name="keywords"
                      className={styles.input}
                      placeholder="seo roadmap, b2b seo, qualified pipeline"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-cover">Cover image URL</label>
                    <input
                      id="post-cover"
                      name="coverImage"
                      className={styles.input}
                      placeholder="/images/blog/cover.webp"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-hero-image">Custom hero image URL</label>
                    <input
                      id="post-hero-image"
                      name="heroImage"
                      className={styles.input}
                      placeholder="/blog/your-post/hero.webp"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-hero-image-alt">Custom hero image alt</label>
                    <input
                      id="post-hero-image-alt"
                      name="heroImageAlt"
                      className={styles.input}
                      placeholder="Describe the hero artwork"
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-hero-background">Custom hero background</label>
                    <input
                      id="post-hero-background"
                      name="heroBackground"
                      className={styles.input}
                      placeholder="linear-gradient(135deg, #ff4d45 0%, #ff2f2f 100%)"
                    />
                  </div>
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.field}>
                    <label htmlFor="post-excerpt">Excerpt</label>
                    <textarea id="post-excerpt" name="excerpt" className={styles.textarea} required />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-card">Card blurb</label>
                    <textarea id="post-card" name="cardBlurb" className={styles.textarea} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-hero">Hero description</label>
                    <textarea id="post-hero" name="heroDescription" className={styles.textarea} />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-seo">SEO description</label>
                    <textarea id="post-seo" name="seoDescription" className={styles.textarea} />
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
                    <span className={styles.fieldHint}>
                      Upload a JSX file, or leave this empty and paste the JSX below.
                    </span>
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="post-source">Paste JSX or HTML body</label>
                    <textarea
                      id="post-source"
                      name="jsxSource"
                      className={`${styles.textarea} ${styles.textareaLarge}`}
                      placeholder="<section><h2>Your heading</h2><p>Your paragraph...</p></section>"
                    />
                    <span className={styles.fieldHint}>
                      Supported blocks: <code>&lt;h1&gt;</code>, <code>&lt;h2&gt;</code>,
                      <code>&lt;h3&gt;</code>, <code>&lt;p&gt;</code>, <code>&lt;ul&gt;</code>,
                      <code>&lt;ol&gt;</code>, and <code>&lt;blockquote&gt;</code>.
                    </span>
                  </div>
                </div>

                <div className={styles.ctaRow}>
                  <button type="submit" className={styles.button}>
                    Publish Post
                  </button>
                </div>
              </form>

              <p className={styles.storageMeta}>
                Local JSON posts are saved in <code>{storageSummary.postsDir}</code> and the
                original uploaded JSX copy is saved in <code>{storageSummary.uploadsDir}</code>.
              </p>
              <p className={styles.storageMeta}>
                {githubStatus.enabled
                  ? `GitHub sync is active for ${githubStatus.repo}@${githubStatus.branch}. Publishing here will save locally and commit directly to GitHub.`
                  : "GitHub sync is currently off, so this admin will save to local content files only until GitHub env vars are configured."}
              </p>
              <p className={styles.storageMeta}>
                Vercel should redeploy automatically from the GitHub integration after each successful GitHub commit.
              </p>
            </section>

            <aside className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <h2>Manage Posts</h2>
                  <p>
                    All current posts appear here. Deleting a CMS post removes its generated
                    file. Deleting a legacy post hides it from the public blog.
                  </p>
                </div>
              </div>

              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Post</th>
                      <th>Source</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managedPosts.map((post) => {
                      const deleteAction = deleteCmsPostAction.bind(null, post.slug);

                      return (
                        <tr key={post.slug}>
                          <td className={styles.titleCell}>
                            <strong>{post.title}</strong>
                            <div className={styles.tableCellMeta}>{post.slug}</div>
                            <div className={styles.tableCellMeta}>{post.category.name}</div>
                          </td>
                          <td>
                            <span
                              className={`${styles.badge} ${
                                post.source === "cms" ? styles.badgeCms : styles.badgeLegacy
                              }`}
                            >
                              {post.source}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`${styles.badge} ${
                                post.isHidden ? styles.badgeHidden : styles.badgeLive
                              }`}
                            >
                              {post.isHidden ? "Hidden" : "Live"}
                            </span>
                          </td>
                          <td>{formatBlogDate(post.publishedAt)}</td>
                          <td>
                            <div className={styles.rowActions}>
                              {!post.isHidden ? (
                                <Link href={`/blog/${post.slug}`} className={styles.linkButton}>
                                  Open
                                </Link>
                              ) : null}
                              <form action={deleteAction} className={styles.inlineForm}>
                                <button type="submit" className={styles.deleteButton}>
                                  Delete
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className={styles.sourceNote}>
                Legacy posts come from the original hardcoded blog dataset. CMS posts are new
                locally generated files inside <code>src/content/blog-posts</code>.
              </p>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}


