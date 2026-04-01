"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./BlogTableOfContents.module.css";

type TocItem = {
  id: string;
  title: string;
};

type BlogTableOfContentsProps = {
  items: TocItem[];
};

export default function BlogTableOfContents({ items }: BlogTableOfContentsProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    const updateActiveSection = () => {
      const offset = 160;
      let currentId = sectionIds[0] ?? "";

      sectionIds.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;

        const top = section.getBoundingClientRect().top + window.scrollY;
        if (window.scrollY + offset >= top) {
          currentId = id;
        }
      });

      setActiveId(currentId);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sectionIds]);

  if (!items.length) {
    return null;
  }

  return (
    <div className={styles.tocCard}>
      <div className={styles.windowBar}>
        <div className={styles.windowDots} aria-hidden="true">
          <span className={`${styles.windowDot} ${styles.windowDotOrange}`} />
          <span className={`${styles.windowDot} ${styles.windowDotAmber}`} />
          <span className={`${styles.windowDot} ${styles.windowDotGreen}`} />
        </div>
        <span className={styles.windowFile}>table_of_contents.md</span>
      </div>

      <nav aria-label="Table of contents">
        <ol className={styles.tocList}>
          {items.map((item) => {
            const active = item.id === activeId;

            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={active ? styles.tocLinkActive : styles.tocLink}
                  aria-current={active ? "true" : undefined}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

