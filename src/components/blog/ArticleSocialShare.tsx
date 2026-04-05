import {
  getArticleShareLinks,
  getVerifiedShareSnapshot,
  type ShareNetwork,
} from "@/lib/social-share";
import styles from "./ArticleSocialShare.module.css";

type ArticleSocialShareProps = {
  slug: string;
  title: string;
  url: string;
};

const networkMarks: Record<ShareNetwork, string> = {
  facebook: "f",
  linkedin: "in",
  reddit: "r/",
  x: "X",
};

const networkClassNames: Record<ShareNetwork, string> = {
  facebook: styles.networkFacebook,
  linkedin: styles.networkLinkedin,
  reddit: styles.networkReddit,
  x: styles.networkX,
};

function formatShareCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export default async function ArticleSocialShare({
  slug,
  title,
  url,
}: ArticleSocialShareProps) {
  const shareLinks = getArticleShareLinks(title, url);
  const snapshot = await getVerifiedShareSnapshot(slug);
  const totalLabel =
    snapshot.status === "verified" && snapshot.total !== null
      ? formatShareCount(snapshot.total)
      : null;
  const hasCount = totalLabel !== null;

  return (
    <aside
      className={`${styles.shareCard}${hasCount ? "" : ` ${styles.shareCardIconOnly}`}`}
      aria-label="Share this article"
    >
      {hasCount ? (
        <div className={styles.metricPanel}>
          <strong className={styles.metricValue}>{totalLabel}</strong>
          <span className={styles.metricLabel}>shares</span>
        </div>
      ) : null}

      <div className={styles.shareStack}>
        {shareLinks.map((link) => (
          <a
            key={link.network}
            href={link.href}
            target="_blank"
            rel="noreferrer noopener"
            className={`${styles.shareButton} ${networkClassNames[link.network]}`}
            aria-label={link.label}
            title={link.label}
          >
            <span className={styles.buttonWordmark} aria-hidden="true">
              {networkMarks[link.network]}
            </span>
          </a>
        ))}
      </div>
    </aside>
  );
}
