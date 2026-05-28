"use client";

import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import { submitToolRating } from "@/app/actions/submitRating";
import styles from "./RateMyTool.module.css";

type Props = {
  slug: string;
  initialAverage: number;
  initialCount: number;
};

export default function RateMyTool({ slug, initialAverage, initialCount }: Props) {
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentCount, setCurrentCount] = useState(initialCount);
  const [currentAverage, setCurrentAverage] = useState(initialAverage);
  // Once the user rates, we lock the displayed values so a router refresh
  // (or parent re-render) can't overwrite the optimistic state.
  const lockedRef = useRef(false);

  useEffect(() => {
    const rated = localStorage.getItem(`rated_tool_${slug}`);
    if (rated) {
      setHasRated(true);
    }
  }, [slug]);

  useEffect(() => {
    // Only sync props → state when the user hasn't just rated.
    // If locked, we keep the optimistic values the user already saw.
    if (!lockedRef.current) {
      setCurrentCount(initialCount);
      setCurrentAverage(initialAverage);
    }
  }, [initialCount, initialAverage]);

  const handleRate = async (stars: number) => {
    if (hasRated || isSubmitting) return;

    setIsSubmitting(true);

    // Compute and display optimistic values immediately.
    const newCount = currentCount + 1;
    const newAverage = Math.round(((currentAverage * currentCount) + stars) / newCount * 10) / 10;

    // Lock BEFORE updating state so the useEffect sync can never overwrite us.
    lockedRef.current = true;
    setCurrentAverage(newAverage);
    setCurrentCount(newCount);
    setHasRated(true);
    localStorage.setItem(`rated_tool_${slug}`, "true");

    try {
      await submitToolRating(slug, stars);
      // No router.refresh() — it would trigger a re-render that passes stale
      // initialProps back in, causing the displayed rating to jump back.
    } catch {
      console.error("Failed to submit rating");
      // Rating is already locked in localStorage so UX stays consistent.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.ratingWrapper}>
      <div className={styles.ratingHeader}>
        <span className={styles.ratingTitle}>How useful was this tool?</span>
        <span className={styles.ratingStats}>
          (Average: {currentAverage} / 5 from {currentCount} votes)
        </span>
      </div>

      <div className={styles.ratingInteraction}>
        <div
          className={`${styles.starsContainer} ${hasRated ? styles.hasRated : ""}`}
          onMouseLeave={() => setHoveredStar(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={styles.starButton}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse" && !hasRated) {
                  setHoveredStar(star);
                }
              }}
              onClick={() => void handleRate(star)}
              disabled={hasRated || isSubmitting}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`${styles.starIcon} ${
                  hoveredStar >= star || (hasRated && Math.round(currentAverage) >= star)
                    ? styles.starFilled
                    : ""
                }`}
              />
            </button>
          ))}
        </div>

        {hasRated && (
          <div className={styles.thankYouMessage}>
            Thank you for your feedback!
          </div>
        )}
      </div>
    </div>
  );
}
