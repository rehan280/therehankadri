import Link from "next/link";

import styles from "./not-found-experience.module.css";

const quickDestinations = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/stats", label: "Stats" },
  { href: "/contact", label: "Contact" },
];

const recoverySignals = [
  "Return to the homepage and explore core services.",
  "Jump into the stats hub for high-intent research content.",
  "Use the contact page if you were trying to reach the team directly.",
];

export default function NotFoundExperience() {
  return (
    <main className={styles.page}>
      <section className="container">
        <div className={styles.shell}>
          <div className={styles.panel}>
            <div className={styles.eyebrowRow}>
              <span className={styles.eyebrow}>Premium Error Experience</span>
              <span className={styles.statusPill}>
                <span className={styles.statusDot} aria-hidden="true" />
                Route Missing
              </span>
            </div>

            <span className={styles.code}>404</span>
            <h1 className={styles.title}>
              This page drifted <span className={styles.titleAccent}>off the map.</span>
            </h1>
            <p className={styles.description}>
              The URL you requested does not exist, may have moved, or was never part of this site. The fastest way
              back is to head home, browse the stats hub, or book a strategy conversation from the links below.
            </p>

            <div className={styles.actions}>
              <Link href="/" className={styles.primaryAction}>
                Return Home
              </Link>
              <Link href="/contact" className={styles.secondaryAction}>
                Book A Strategy Call
              </Link>
            </div>

            <div className={styles.quickLinks} aria-label="Quick links">
              {quickDestinations.map((destination) => (
                <Link key={destination.href} href={destination.href} className={styles.quickLink}>
                  {destination.label}
                </Link>
              ))}
            </div>

            <div className={styles.metrics} aria-label="Recovery shortcuts">
              <div className={styles.metric}>
                <span className={styles.metricValue}>01</span>
                <span className={styles.metricLabel}>Go back to homepage</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>02</span>
                <span className={styles.metricLabel}>Explore stats hub</span>
              </div>
              <div className={styles.metric}>
                <span className={styles.metricValue}>03</span>
                <span className={styles.metricLabel}>Reach out directly</span>
              </div>
            </div>
          </div>

          <aside className={styles.signalCard} aria-label="Error recovery panel">
            <div className={styles.signalHeader}>
              <div>
                <span className={styles.signalKicker}>Navigation Signal</span>
                <h2 className={styles.signalTitle}>Find the highest-intent path back into the site.</h2>
              </div>
              <span className={styles.signalBadge} aria-hidden="true">
                TRK
              </span>
            </div>

            <div className={styles.signalPanel} aria-hidden="true">
              <div className={styles.gridGlow} />
              <div className={styles.signalPath} />
            </div>

            <div className={styles.signalCopy}>
              <p className={styles.signalText}>
                We kept the recovery flow simple: a clear way home, a route into proof-driven content, and a direct
                line to contact if this URL came from outreach or a saved bookmark.
              </p>

              <div className={styles.signalList}>
                {recoverySignals.map((item) => (
                  <div key={item} className={styles.signalItem}>
                    <span className={styles.signalItemMark} aria-hidden="true">
                      +
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
