import type { ReactNode } from "react";
import styles from "./TldrBox.module.css";

type TldrBoxProps = {
  children: ReactNode;
};

export default function TldrBox({ children }: TldrBoxProps) {
  return (
    <aside className={styles.tldrBox} aria-label="TL;DR Summary">
      <h2 className={styles.heading}>TL;DR</h2>
      <p className={styles.content}>{children}</p>
    </aside>
  );
}
