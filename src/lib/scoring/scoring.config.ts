/**
 * Scoring Configuration
 * Centralized configuration for all scoring weights and parameters
 * Allows A/B testing and optimization without code changes
 */

export interface ScoringConfig {
  // Volume estimation weights
  volumeWeights: {
    oneWord: { min: number; max: number; popularMultiplier: number };
    twoWord: { min: number; max: number; popularMultiplier: number; commercialMultiplier: number };
    threeWord: { min: number; max: number; questionMultiplier: number; yearMultiplier: number };
    fourWord: { min: number; max: number; questionMultiplier: number };
    fivePlusWord: { min: number; max: number; questionMultiplier: number };
  };

  // KD (Keyword Difficulty) ranges
  kdRanges: {
    oneWord: { min: number; max: number };
    twoWordCommercial: { min: number; max: number };
    twoWordPopular: { min: number; max: number };
    twoWordNormal: { min: number; max: number };
    threeWordQuestion: { min: number; max: number };
    threeWordYear: { min: number; max: number };
    threeWordNormal: { min: number; max: number };
    fourWord: { min: number; max: number };
    fivePlusWord: { min: number; max: number };
  };

  // Trend score ranges
  trendRanges: {
    withYear: { min: number; max: number };
    questionPopular: { min: number; max: number };
    commercial: { min: number; max: number };
    rising: { min: number; max: number };
    falling: { min: number; max: number };
    stable: { min: number; max: number };
  };

  // SEO score calculation weights
  seoWeights: {
    volume: number;
    trend: number;
    competition: number;
  };

  // High-value and commercial keywords
  keywords: {
    highValue: string[];
    commercial: string[];
  };

  // Confidence scoring parameters
  confidence: {
    baseConfidence: number;
    hasRealDataBonus: number;
    multipleSourcesBonus: number;
    estimationPenalty: number;
  };
}

/**
 * Default configuration calibrated against vidIQ/TubeBuddy benchmarks
 */
export const defaultScoringConfig: ScoringConfig = {
  volumeWeights: {
    oneWord: { min: 500000, max: 5000000, popularMultiplier: 2.0 },
    twoWord: { min: 100000, max: 1000000, popularMultiplier: 1.8, commercialMultiplier: 1.5 },
    threeWord: { min: 10000, max: 200000, questionMultiplier: 1.6, yearMultiplier: 1.4 },
    fourWord: { min: 2000, max: 50000, questionMultiplier: 1.5 },
    fivePlusWord: { min: 500, max: 20000, questionMultiplier: 1.4 },
  },

  kdRanges: {
    oneWord: { min: 70, max: 95 },
    twoWordCommercial: { min: 55, max: 75 },
    twoWordPopular: { min: 45, max: 65 },
    twoWordNormal: { min: 35, max: 55 },
    threeWordQuestion: { min: 20, max: 35 },
    threeWordYear: { min: 15, max: 30 },
    threeWordNormal: { min: 25, max: 45 },
    fourWord: { min: 10, max: 25 },
    fivePlusWord: { min: 5, max: 15 },
  },

  trendRanges: {
    withYear: { min: 75, max: 95 },
    questionPopular: { min: 65, max: 85 },
    commercial: { min: 55, max: 80 },
    rising: { min: 60, max: 80 },
    falling: { min: 25, max: 50 },
    stable: { min: 45, max: 65 },
  },

  seoWeights: {
    volume: 0.3,
    trend: 0.4,
    competition: 0.3,
  },

  keywords: {
    highValue: [
      'youtube', 'video', 'tutorial', 'course', 'guide', 'tips', 'tricks',
      'best', 'top', 'free', 'online', 'learn', 'make', 'money', 'earn',
      'how', 'what', 'why', 'when', 'where'
    ],
    commercial: [
      'buy', 'review', 'vs', 'comparison', 'price', 'cheap', 'discount',
      'deal', 'affiliate', 'purchase', 'order', 'shop'
    ],
  },

  confidence: {
    baseConfidence: 0.65,
    hasRealDataBonus: 0.15,
    multipleSourcesBonus: 0.10,
    estimationPenalty: 0.20,
  },
};

/**
 * Load configuration from environment or use defaults
 */
export function loadScoringConfig(): ScoringConfig {
  // In production, this could load from database or config service
  return defaultScoringConfig;
}
