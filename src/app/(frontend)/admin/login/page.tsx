import { redirect } from "next/navigation";
import { getCmsSessionUser, hasSingleConfiguredCmsAdmin } from "@/lib/cms-auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requestCmsMagicLink } from "../actions";
import styles from "../admin.module.css";

export const dynamic = "force-dynamic";

type LoginPageProps = {
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

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [query, cmsUser] = await Promise.all([searchParams, getCmsSessionUser()]);

  if (cmsUser) {
    redirect("/admin/manage-posts");
  }

  const cmsConfigured = isSupabaseConfigured();
  const usesSingleConfiguredAdmin = hasSingleConfiguredCmsAdmin();
  const statusType = readSearchParam(query, "type") || (cmsConfigured ? "neutral" : "error");
  const statusMessage = readSearchParam(query, "message");
  
  const statusClassName =
    statusType === "success"
      ? styles.statusSuccess
      : statusType === "error"
        ? styles.statusError
        : styles.statusNeutral;

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      {statusMessage ? (
        <div className={`${styles.statusBanner} ${statusClassName}`}>{statusMessage}</div>
      ) : null}

      {!cmsConfigured ? (
        <div className={styles.wpPanel}>
          <h2 className={styles.pageTitle}>Supabase Setup Needed</h2>
          <p>
            Add your Supabase URL, anon key, and service role key before this CMS can
            sign in or publish posts.
          </p>
        </div>
      ) : (
        <div className={styles.wpPanel}>
          <h2 className={styles.pageTitle}>Login</h2>
          <p style={{ marginTop: 10, marginBottom: 20 }}>
            {usesSingleConfiguredAdmin
              ? "This workspace is locked to the configured admin account. Request a magic link and the server will send it without exposing the email in the page."
              : "Enter your approved admin email and Supabase will send a magic link for this dashboard."}
          </p>

          <form action={requestCmsMagicLink}>
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
                  Log In
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
