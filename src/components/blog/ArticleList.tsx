import type { ReactNode } from "react";
import styles from "./ArticleList.module.css";

type ArticleListProps = {
  items: ReactNode[];
  ordered?: boolean;
};

export default function ArticleList({ items, ordered = false }: ArticleListProps) {
  if (ordered) {
    return (
      <ol className={styles.stepList}>
        {items.map((item, index) => (
          <li key={index} className={styles.stepItem}>
            <div className={styles.stepBody}>{item}</div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className={styles.unorderedList}>
      {items.map((item, index) => (
        <li key={index} className={styles.unorderedItem}>
          {item}
        </li>
      ))}
    </ul>
  );
}
