"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminWPNav.module.css";
import React from "react";

type TopbarProps = {
  userEmail: string;
};

export function AdminTopbar({ userEmail }: TopbarProps) {
  return (
    <div className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <span className={styles.brand}>TRK CMS</span>
        <Link href="/blog" className={styles.topbarLink}>
          View Live Blog
        </Link>
      </div>
      <div className={styles.topbarRight}>
        <span className={styles.userText}>Howdy, {userEmail}</span>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { label: "Dashboard", href: "/admin", exact: true },
    { label: "Manage Posts", href: "/admin/manage-posts", exact: false },
    { label: "Create Post", href: "/admin/create-post", exact: false },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {links.map((link) => {
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
