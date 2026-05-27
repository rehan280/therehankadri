"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { submitToolRating } from "@/app/actions/submitRating";
import styles from "./RateMyTool.module.css";

type Props = {
  slug: string;
  initialAverage: number;
  initialCount: number;
};

export default function RateMyTool({ slug, initialAverage, initialCount }: Props) {
  const router = useRouter();
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentCount, setCurrentCount] = useState(initialCount);
  const [currentAverage, setCurrentAverage] = useState(initialAverage);

  useEffect(() => {
    // Check if user has already rated this tool in localStorage
    const rated = localStorage.getItem(`rated_tool_${slug}`);
    if (rated) {
      setHasRated(true);
    }
  }, [slug]);

  useEffect(() => {
    // Sync with server if other users rate or if router.refresh() fetches new data
    setCurrentCount(initialCount);
    setCurrentAverage(initialAverage);
  }, [initialCount, initialAverage]);

  const handleRate = async (stars: number) => {
    if (hasRated || isSubmitting) return;
    
    setIsSubmitting(true);
    
    // Optimistic UI update
    const newCount = currentCount + 1;
    const newTotal = (currentAverage * currentCount) + stars;
    setCurrentAverage(Math.round((newTotal / newCount) * 10) / 10);
    setCurrentCount(newCount);
    setHasRated(true);
    localStorage.setItem(`rated_tool_${slug}`, "true");

    const result = await submitToolRating(slug, stars);
    
    if (result.success) {
      // Force Next.js to re-fetch Server Components (updates Testimonials header and Schema!)
      router.refresh();
    } else {
      // Revert if failed (though normally we'd show an error)
      console.error("Failed to submit rating");
    }
    
    setIsSubmitting(false);
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
              onMouseEnter={() => !hasRated && setHoveredStar(star)}
              onClick={() => handleRate(star)}
              disabled={hasRated || isSubmitting}
              aria-label={`Rate ${star} stars`}
            >
              <Star 
                className={`${styles.starIcon} ${
                  (hoveredStar >= star || (hasRated && Math.round(currentAverage) >= star))
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
