import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./PremiumFaq.module.css";

export type PremiumFaqItem = {
  answer: ReactNode;
  question: ReactNode;
};

type PremiumFaqProps = {
  className?: string;
  defaultOpenFirst?: boolean;
  eyebrow?: string;
  id?: string;
  intro?: ReactNode;
  items: PremiumFaqItem[];
  title: ReactNode;
};

function renderContent(content: ReactNode) {
  if (typeof content === "string") {
    return <p>{content}</p>;
  }

  return <div>{content}</div>;
}

export default function PremiumFaq({
  className,
  defaultOpenFirst = true,
  eyebrow = "FAQ",
  id,
  intro,
  items,
  title,
}: PremiumFaqProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section
      id={id}
      className={[styles.section, className].filter(Boolean).join(" ")}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className={styles.header}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h2 className={styles.title} id={id ? `${id}-title` : undefined}>
          {title}
        </h2>
        {intro ? <div className={styles.intro}>{renderContent(intro)}</div> : null}
      </div>

      <div className={styles.stack}>
        {items.map((item, index) => (
          <details
            key={`${typeof item.question === "string" ? item.question : index}`}
            className={styles.item}
            open={defaultOpenFirst && index === 0}
          >
            <summary className={styles.summary}>
              <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.question}>{item.question}</span>
              <span className={styles.iconWrap} aria-hidden="true">
                <ChevronDown size={18} strokeWidth={2.1} className={styles.icon} />
              </span>
            </summary>

            <div className={styles.answerWrap}>
              <div className={styles.answer}>{renderContent(item.answer)}</div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
