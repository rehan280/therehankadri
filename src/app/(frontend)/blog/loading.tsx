import BlogHeader from "@/components/blog/BlogHeader";
import styles from "./blog.module.css";

const latestCards = Array.from({ length: 4 });
const topicCards = Array.from({ length: 2 });

export default function BlogLoading() {
  return (
    <main className={`${styles.page} ${styles.loadingScreen}`}>
      <section className={`${styles.hero} ${styles.blogIndexHero}`}>
        <BlogHeader />

        <div className={`${styles.heroInner} ${styles.blogIndexHeroInner}`}>
          <span className={`${styles.loadingBlock} ${styles.loadingPill}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeroTitle}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeroTitleShort}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeroCopyWide}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingHeroCopyNarrow}`} />
          <div className={styles.loadingChipRow}>
            <span className={`${styles.loadingBlock} ${styles.loadingChip}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingChip}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingChip}`} />
          </div>
        </div>
      </section>

      <section className={`${styles.latestSection} ${styles.loadingSection}`} aria-hidden="true">
        <div className={styles.latestShell}>
          <div className={`${styles.latestGrid} ${styles.loadingLatestGrid}`}>
            {latestCards.map((_, index) => (
              <article
                key={`latest-${index}`}
                className={`${styles.skeletonCard} ${styles.loadingLatestCard}${index > 1 ? ` ${styles.latestCardBordered}` : ""}`}
              >
                <span className={`${styles.loadingBlock} ${styles.loadingMiniLabel}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleNarrow}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextWide}`} />
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

      <section className={styles.loadingTopicSection} aria-hidden="true">
        <div className={styles.loadingTopicShell}>
          <div className={styles.loadingTopicHeader}>
            <span className={`${styles.loadingBlock} ${styles.loadingMiniLabel}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingSectionTitle}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingHeroCopyWide}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingHeroCopyNarrow}`} />
          </div>

          <div className={styles.loadingTopicGrid}>
            {topicCards.map((_, index) => (
              <article key={`topic-${index}`} className={`${styles.skeletonCard} ${styles.loadingTopicCard}`}>
                <span className={`${styles.loadingBlock} ${styles.loadingMiniLabel}`} />
                <div className={`${styles.loadingBlock} ${styles.loadingTopicImage}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleWide}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTitleNarrow}`} />
                <span className={`${styles.loadingBlock} ${styles.loadingCardTextWide}`} />
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
