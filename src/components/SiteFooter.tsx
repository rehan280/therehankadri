import Link from "next/link";
import styles from "./site-footer.module.css";

const socialLinks = [
  {
    type: "linkedin" as const,
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/rehan-kadri-27b5b8231",
  },
  {
    type: "youtube" as const,
    name: "YouTube",
    href: "https://youtube.com/@rehanous?si=FDWGeBZ6MtP6oUcK",
  },
  {
    type: "x" as const,
    name: "X",
    href: "https://x.com/rehanous",
  },
];

function renderSocialIcon(type: "linkedin" | "youtube" | "x") {
  switch (type) {
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6.94 8.5H4.12V19h2.82V8.5ZM5.53 4C4.6 4 4 4.62 4 5.43c0 .8.59 1.42 1.5 1.42h.02c.94 0 1.52-.62 1.52-1.42C7.02 4.62 6.46 4 5.53 4ZM20 12.56c0-3.16-1.69-4.63-3.94-4.63-1.82 0-2.63 1-3.08 1.7V8.5h-2.82c.04.74 0 10.5 0 10.5h2.82v-5.87c0-.31.02-.62.11-.84.25-.61.82-1.24 1.78-1.24 1.25 0 1.75.94 1.75 2.33V19H20v-6.44Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21.58 7.19a2.96 2.96 0 0 0-2.08-2.1C17.67 4.6 12 4.6 12 4.6s-5.67 0-7.5.49a2.96 2.96 0 0 0-2.08 2.1C1.93 9.03 1.93 12 1.93 12s0 2.97.49 4.81a2.96 2.96 0 0 0 2.08 2.1c1.83.49 7.5.49 7.5.49s5.67 0 7.5-.49a2.96 2.96 0 0 0 2.08-2.1c.49-1.84.49-4.81.49-4.81s0-2.97-.49-4.81ZM10.18 14.98V9.02L15.41 12l-5.23 2.98Z" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18.9 3H21l-4.6 5.26L21.8 21h-4.94l-3.87-5.07L8.56 21H6.45l4.92-5.63L2.2 3h5.06l3.5 4.59L14.87 3Zm-.73 16.75h1.16L6.63 4.17H5.39l12.78 15.58Z" />
        </svg>
      );
  }
}

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.shell}>
        <div className={styles.top}>
          <div className={styles.brandBlock}>
            <span className={styles.kicker}>Revenue-first growth systems</span>
            <div className={styles.brandName}>
              <span className={styles.brandThe}>The</span>
              <span className={styles.brandRehan}>Rehan</span>
              <span className={styles.brandKadri}>Kadri</span>
            </div>
            <p className={styles.tagline}>
              Growth systems designed to turn attention into qualified pipeline.
            </p>
          </div>

          <div className={styles.ctaBlock}>
            <span className={styles.ctaLabel}>Have a project in mind?</span>
            <Link href="/contact" className={styles.ctaButton}>
              Book a strategy call ↗
            </Link>
            <div className={styles.socialInline}>
              <span className={styles.socialLabel}>Follow me</span>
              <div className={styles.socialRow}>
                {socialLinks.map(({ type, name, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialChip}
                    aria-label={name}
                    title={name}
                  >
                    <span className={styles.socialIcon}>{renderSocialIcon(type)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© 2026 The Rehan Kadri. All rights reserved.</p>
          <div className={styles.links}>
            <Link href="/">Home</Link>
            <Link href="/#results">Results</Link>
            <Link href="/#systems">Systems</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
