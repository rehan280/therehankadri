"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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

  const listRef = useRef<HTMLOListElement>(null);
  const sectionIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (firstEntry, secondEntry) =>
              firstEntry.boundingClientRect.top - secondEntry.boundingClientRect.top
          );

        const nextActiveId = visibleEntries[0]?.target.id;
        if (!nextActiveId) {
          return;
        }

        setActiveId((current) => (current === nextActiveId ? current : nextActiveId));
      },
      {
        rootMargin: "-18% 0px -62% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const activeElement = listRef.current.querySelector<HTMLAnchorElement>(`a[href="#${activeId}"]`);
    if (!activeElement) return;

    const listElement = listRef.current;
    const listRect = listElement.getBoundingClientRect();
    const activeRect = activeElement.getBoundingClientRect();
    const viewportPadding = Math.min(48, listRect.height * 0.22);

    const isAboveViewport = activeRect.top < listRect.top + viewportPadding;
    const isBelowViewport = activeRect.bottom > listRect.bottom - viewportPadding;

    if (!isAboveViewport && !isBelowViewport) {
      return;
    }

    const centeredOffset =
      activeElement.offsetTop - listElement.clientHeight / 2 + activeElement.clientHeight / 2;
    const nextScrollTop = Math.max(
      0,
      Math.min(centeredOffset, listElement.scrollHeight - listElement.clientHeight)
    );

    listElement.scrollTo({
      top: nextScrollTop,
      behavior: "smooth",
    });
  }, [activeId]);

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

      <nav aria-label="Table of contents" data-lenis-prevent>
        <ol className={styles.tocList} ref={listRef}>
          {items.map((item, index) => {
            const active = item.id === activeId;

            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={active ? styles.tocLinkActive : styles.tocLink}
                  aria-current={active ? "true" : undefined}
                >
                  <span className={styles.tocNumber}>{index + 1}.</span>
                  <span className={styles.tocText}>{item.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
