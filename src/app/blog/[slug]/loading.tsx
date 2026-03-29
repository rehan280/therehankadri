import styles from "../blog.module.css";

export default function BlogPostLoading() {
  return (
    <main className={styles.page}>
      <section className={`${styles.hero} ${styles.postHero}`}>
        <div className={styles.loadingHeaderPlaceholder} />
        <div className={`${styles.heroInner} ${styles.loadingHeroInner}`}>
          <span className={`${styles.loadingBlock} ${styles.loadingBackLink}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingPill}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeadlineLarge}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeadlineMedium}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingTextWide}`} />
          <div className={styles.loadingAuthorRow}>
            <span className={`${styles.loadingBlock} ${styles.loadingAvatar}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingAuthorText}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingMetaInline}`} />
          </div>
        </div>
      </section>

      <section className={styles.postSection}>
        <div className={styles.postShell}>
          <div className={styles.postGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.skeletonSidebarTall}>
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarTitle}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
              </div>
            </aside>

            <div className={styles.skeletonArticle}>
              {Array.from({ length: 7 }).map((_, index) => (
                <span
                  key={index}
                  className={`${styles.loadingBlock} ${
                    index % 3 === 1 ? styles.loadingCardTextNarrow : styles.loadingCardTextWide
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
