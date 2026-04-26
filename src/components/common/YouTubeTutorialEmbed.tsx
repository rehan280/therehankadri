"use client";

import { useState } from "react";
import styles from "./YouTubeTutorialEmbed.module.css";

type YouTubeTutorialEmbedProps = {
  title: string;
  videoId: string;
  copy: string;
  eyebrow?: string;
  footerHref?: string;
  footerLabel?: string;
};

const thumbnailPatterns = [
  "https://i.ytimg.com/vi_webp/{id}/maxresdefault.webp",
  "https://i.ytimg.com/vi/{id}/maxresdefault.jpg",
  "https://i.ytimg.com/vi_webp/{id}/hqdefault.webp",
  "https://i.ytimg.com/vi/{id}/hqdefault.jpg",
];

function getThumbnailUrl(videoId: string, index: number) {
  return thumbnailPatterns[index].replace("{id}", videoId);
}

export default function YouTubeTutorialEmbed({
  title,
  videoId,
  copy,
  eyebrow = "Video Tutorial",
  footerHref,
  footerLabel,
}: YouTubeTutorialEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <p className={styles.copy}>{copy}</p>
      </div>

      <div className={styles.frame}>
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.posterButton}
            onClick={() => setIsPlaying(true)}
            aria-label={`Play ${title}`}
          >
            <img
              src={getThumbnailUrl(videoId, thumbnailIndex)}
              alt={title}
              className={styles.posterImage}
              loading="lazy"
              decoding="async"
              onError={() => {
                setThumbnailIndex((currentIndex) =>
                  currentIndex < thumbnailPatterns.length - 1 ? currentIndex + 1 : currentIndex
                );
              }}
            />
            <span className={styles.posterOverlay} aria-hidden="true">
              <span className={styles.posterChip}>Guided video</span>
              <span className={styles.posterCta}>
                <span className={styles.posterPlay}>
                  <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                    <path d="M9 7.2v9.6l7.5-4.8z" fill="currentColor" />
                  </svg>
                </span>
                <span className={styles.posterText}>
                  <span className={styles.posterKicker}>Watch tutorial</span>
                  <span className={styles.posterTitle}>{title}</span>
                </span>
              </span>
            </span>
          </button>
        )}
      </div>

      {footerHref && footerLabel ? (
        <p className={styles.footer}>
          <a
            href={footerHref}
            target="_blank"
            rel="noreferrer"
            className={styles.footerLink}
          >
            {footerLabel}
          </a>
        </p>
      ) : null}
    </section>
  );
}
