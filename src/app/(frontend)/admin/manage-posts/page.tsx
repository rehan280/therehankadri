import Link from "next/link";
import { formatBlogDate } from "@/lib/blog";
import { getPostPath } from "@/lib/post-paths";
import { getAllManagedBlogPosts, type ManagedBlogPost } from "@/lib/blog-cms";
import { deleteCmsPostAction } from "../actions";
import styles from "../admin.module.css";

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

export default async function ManagePostsPage({ searchParams }: AdminPageProps) {
  const query = await searchParams;
  const managedPosts = (await getAllManagedBlogPosts()) as ManagedBlogPost[];
  
  const statusType = readSearchParam(query, "type");
  const statusMessage = readSearchParam(query, "message");
  
  const statusClassName =
    statusType === "success"
      ? styles.statusSuccess
      : statusType === "error"
        ? styles.statusError
        : styles.statusNeutral;

  const livePosts = managedPosts.filter((post) => !post.isHidden);
  const hiddenPosts = managedPosts.length - livePosts.length;
  const cmsPosts = managedPosts.filter((post) => post.source === "cms");

  return (
    <>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
        <h1 className={styles.pageTitle}>Posts</h1>
        <Link href="/admin/create-post" className={styles.secondaryButton} style={{ marginTop: "5px" }}>
          Add New
        </Link>
      </div>

      {statusMessage ? (
        <div className={`${styles.statusBanner} ${statusClassName}`}>
          <p style={{ margin: "10px 0" }}>{statusMessage}</p>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: "15px", fontSize: "13px", marginBottom: "10px" }}>
        <span>All <span style={{ color: "#646970" }}>({managedPosts.length})</span></span> | 
        <span>Live <span style={{ color: "#646970" }}>({livePosts.length})</span></span> | 
        <span>Hidden <span style={{ color: "#646970" }}>({hiddenPosts})</span></span> |
        <span>CMS Built <span style={{ color: "#646970" }}>({cmsPosts.length})</span></span>
      </div>

      <div className={styles.wpTableWrap}>
        <table className={styles.wpTable}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Source</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {managedPosts.map((post) => {
              const deleteAction = deleteCmsPostAction.bind(null, post.slug);

              return (
                <tr key={post.slug}>
                  <td style={{ minWidth: "16rem", verticalAlign: "top" }}>
                    <strong style={{ display: "block", marginBottom: "4px", fontSize: "14px", color: "#2271b1" }}>
                        {post.title}
                    </strong>
                    <div style={{ color: "#5d6c64", fontSize: "12px", marginBottom: "2px" }}>/{post.slug}</div>
                    <div style={{ color: "#5d6c64", fontSize: "12px" }}>{post.category.name}</div>
                    {/* Hover Actions Simulator */}
                    <div className={styles.ctaRow} style={{ marginTop: "5px", gap: "5px" }}>
                      {!post.isHidden ? (
                        <Link href={getPostPath(post.slug)} style={{ fontSize: "12px", color: "#2271b1", textDecoration: "none" }}>
                          View
                        </Link>
                      ) : null}
                      {!post.isHidden ? <span style={{ color: "#ddd" }}>|</span> : null}
                      <Link href={`/admin/create-post?edit=${post.slug}`} style={{ fontSize: "12px", color: "#2271b1", textDecoration: "none" }}>
                        Edit
                      </Link>
                      <span style={{ color: "#ddd" }}>|</span>
                      <form action={deleteAction} style={{ display: "inline" }}>
                        <button type="submit" style={{ fontSize: "12px", color: "#b32d2e", background: "none", border: "none", padding: 0, cursor: "pointer", textDecoration: "none" }}>
                          Trash
                        </button>
                      </form>
                    </div>
                  </td>
                  <td style={{ verticalAlign: "top", paddingTop: "12px" }}>
                    <span
                      className={`${styles.badge} ${
                        post.source === "cms" ? styles.badgeCms : styles.badgeLegacy
                      }`}
                    >
                      {post.source}
                    </span>
                  </td>
                  <td style={{ verticalAlign: "top", paddingTop: "12px" }}>
                    <span
                      className={`${styles.badge} ${
                        post.isHidden ? styles.badgeHidden : styles.badgeLive
                      }`}
                    >
                      {post.isHidden ? "Hidden" : "Published"}
                    </span>
                  </td>
                  <td style={{ verticalAlign: "top", paddingTop: "12px" }}>{formatBlogDate(post.publishedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "15px", fontSize: "13px", color: "#646970" }}>
        Legacy posts come from the original hardcoded blog dataset. CMS posts are new locally generated files inside <code>src/content/blog-posts</code>.
      </p>
    </>
  );
}
