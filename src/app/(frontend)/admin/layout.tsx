import type { Metadata } from "next";
import { createNoIndexRobots } from "@/lib/seo";
import { getCmsSessionUser } from "@/lib/cms-auth";
import { AdminSidebar, AdminTopbar } from "@/components/cms/AdminWPNav";
import styles from "./admin.module.css";
import "@rohanyeole/ray-editor/css";

export const metadata: Metadata = {
  title: "Dashboard ‹ TRK CMS",
  description: "Internal admin tools for publishing and managing site content.",
  robots: createNoIndexRobots(),
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cmsUser = await getCmsSessionUser();

  if (!cmsUser) {
    return (
      <div className={styles.loginLayout}>
        {children}
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <AdminTopbar userEmail={cmsUser.email} />
      <AdminSidebar />
      <main className={styles.adminMain}>
        {children}
      </main>
    </div>
  );
}
