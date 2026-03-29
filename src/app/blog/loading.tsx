import styles from "./blog.module.css";

export default function BlogLoading() {
  return (
    <main className={styles.page}>
      <section className={`${styles.hero} ${styles.loadingHero}`}>
        <div className={styles.loadingHeaderPlaceholder} />
        <div className={`${styles.heroInner} ${styles.loadingHeroInner}`}>
          <span className={`${styles.loadingBlock} ${styles.loadingPill}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeadlineLarge}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeadlineMedium}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingTextWide}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingTextMedium}`} />
          <div className={styles.loadingChipRow}>
            <span className={`${styles.loadingBlock} ${styles.loadingChip}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingChip}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingChip}`} />
          </div>
        </div>
      </section>

      <section className={styles.indexSection}>
        <div className={styles.indexShell}>
          <div className={styles.articleGrid}>
            {Array.from({ length: 4 }).map((_, index) => (
              <article key={index} className={styles.skeletonCard}>
                <span className={`${styles.loadingBlock} ${styles.loadingMiniLabel}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleNarrow}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextNarrow}`} />
              </article>
            ))}
          </div>

          <aside className={styles.skeletonSidebar}>
            <span className={`${styles.loadingBlock} ${styles.loadingSidebarTitle}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingSidebarButton}`} />
          </aside>
        </div>
      </section>
    </main>
  );
}
