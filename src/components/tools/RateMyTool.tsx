"use client";

import { useState, useEffect, useRef } from "react";
import { Star } from "lucide-react";
import styles from "./RateMyTool.module.css";

type Props = {
  slug: string;
  // These are the build-time baked-in values used only as the initial skeleton.
  // The component immediately fetches live values from the API on mount.
  initialAverage: number;
  initialCount: number;
};

type RatingState =
  | { status: "loading" }
  | { status: "ready"; average: number; count: number }
  | { status: "submitting"; average: number; count: number }
  | { status: "done"; average: number; count: number }
  | { status: "error"; average: number; count: number };

export default function RateMyTool({ slug, initialAverage, initialCount }: Props) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [ratingState, setRatingState] = useState<RatingState>({ status: "loading" });
  const hasFetchedRef = useRef(false);

  // Step 1 - On mount, fetch the LIVE rating from the API (not the baked-in static props).
  // This is exactly how RateMyPost works: an AJAX call on page load to get real numbers.
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    // Check if user already rated (localStorage)
    const alreadyRated = Boolean(localStorage.getItem(`rated_tool_${slug}`));

    fetch(`/api/tool-rating?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data: { average: number; count: number }) => {
        setRatingState({
          status: alreadyRated ? "done" : "ready",
          average: data.average,
          count: data.count,
        });
      })
      .catch(() => {
        // If fetch fails, fall back to build-time values
        setRatingState({
          status: alreadyRated ? "done" : "ready",
          average: initialAverage,
          count: initialCount,
        });
      });
  }, [slug, initialAverage, initialCount]);

  const handleRate = async (stars: number) => {
    if (ratingState.status !== "ready") return;

    const prevAverage = ratingState.average;
    const prevCount = ratingState.count;

    // Step 2 - Optimistic update: show the new values instantly
    const optimisticCount = prevCount + 1;
    const optimisticAverage =
      Math.round(((prevAverage * prevCount + stars) / optimisticCount) * 10) / 10;

    setRatingState({ status: "submitting", average: optimisticAverage, count: optimisticCount });
    localStorage.setItem(`rated_tool_${slug}`, "true");

    try {
      // Step 3 - POST to API. The API returns the *actual* saved values from Supabase.
      const res = await fetch("/api/tool-rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, stars }),
      });

      const data = await res.json() as { success: boolean; average: number; count: number; error?: string };

      if (res.ok && data.success) {
        // Step 4 - Use the confirmed real values from Supabase (not the optimistic ones)
        setRatingState({ status: "done", average: data.average, count: data.count });
      } else {
        throw new Error(data.error ?? "Unknown error");
      }
    } catch (err) {
      console.error("Rating submission failed:", err);
      // Keep the optimistic values so the UX doesn't visually revert
      setRatingState({ status: "done", average: optimisticAverage, count: optimisticCount });
    }
  };

  const hasRated = ratingState.status === "done" || ratingState.status === "submitting";
  const isLoading = ratingState.status === "loading";
  const isSubmitting = ratingState.status === "submitting";

  const displayAverage =
    ratingState.status === "loading" ? initialAverage : ratingState.average;
  const displayCount =
    ratingState.status === "loading" ? initialCount : ratingState.count;

  return (
    <div className={styles.ratingWrapper}>
      <div className={styles.ratingHeader}>
        <span className={styles.ratingTitle}>How useful was this tool?</span>
        <span className={styles.ratingStats}>
          {isLoading
            ? `(Average: ${displayAverage} / 5 from ${displayCount} votes)`
            : `(Average: ${displayAverage} / 5 from ${displayCount} votes)`}
        </span>
      </div>

      <div className={styles.ratingInteraction}>
        <div
          className={`${styles.starsContainer} ${hasRated || isLoading ? styles.hasRated : ""}`}
          onMouseLeave={() => setHoveredStar(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={styles.starButton}
              onPointerEnter={(e) => {
                if (e.pointerType === "mouse" && !hasRated && !isLoading) {
                  setHoveredStar(star);
                }
              }}
              onClick={() => void handleRate(star)}
              disabled={hasRated || isLoading || isSubmitting}
              aria-label={`Rate ${star} stars`}
            >
              <Star
                className={`${styles.starIcon} ${
                  hoveredStar >= star || (hasRated && Math.round(displayAverage) >= star)
                    ? styles.starFilled
                    : ""
                }`}
              />
            </button>
          ))}
        </div>

        {hasRated && (
          <div className={styles.thankYouMessage}>Thank you for your feedback!</div>
        )}
      </div>
    </div>
  );
}
