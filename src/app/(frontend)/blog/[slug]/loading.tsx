import styles from "../blog.module.css";

const articleLines = Array.from({ length: 8 });
const relatedCards = Array.from({ length: 2 });

export default function BlogPostLoading() {
  return (
    <main className={`${styles.page} ${styles.loadingScreen}`}>
      <section className={`${styles.hero} ${styles.postHero}`}>

        <div className={`${styles.heroInner} ${styles.postHeroInner} ${styles.loadingHeroInner}`}>
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

      <section className={`${styles.postSection} ${styles.loadingSection}`} aria-hidden="true">
        <div className={styles.postShell}>
          <div className={styles.postGrid}>
            <aside className={styles.sidebar}>
              <div className={`${styles.skeletonSidebarTall} ${styles.loadingSidebarPanel}`}>
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarTitle}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarLine}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingSidebarButton}`} />
              </div>
            </aside>

            <div className={`${styles.skeletonArticle} ${styles.loadingArticlePanel}`}>
              <span className={`${styles.loadingBlock} ${styles.loadingArticleLead}`} />
              <span className={`${styles.loadingBlock} ${styles.loadingArticleLeadShort}`} />
              {articleLines.map((_, index) => (
                <span
                  key={`line-${index}`}
                  className={`${styles.loadingBlock} ${index % 3 === 1 ? styles.loadingCardTextNarrow : styles.loadingCardTextWide}`}
                />
              ))}
              <div className={styles.loadingQuotePanel}>
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextNarrow}`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.relatedSection} ${styles.loadingSection}`} aria-hidden="true">
        <div className={styles.relatedShell}>
          <div className={styles.loadingRelatedHeader}>
            <span className={`${styles.loadingBlock} ${styles.loadingMiniLabel}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingSectionTitle}`} />
          </div>
          <div className={styles.articleGrid}>
            {relatedCards.map((_, index) => (
              <article key={`related-${index}`} className={`${styles.skeletonCard} ${styles.loadingRelatedCard}`}>
                <span className={`${styles.loadingBlock} ${styles.loadingMiniLabel}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleNarrow}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextNarrow}`} />
                <div className={styles.loadingMetaRow}>
                  <span className={`${styles.loadingBlock} ${styles.loadingMetaPill}`} />
                  <span className={`${styles.loadingBlock} ${styles.loadingMetaPillShort}`} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

