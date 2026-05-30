/**
 * KeywordScorer - Deterministic keyword scoring engine
 * Provides consistent, reproducible scores with confidence metrics
 */

import { ScoringConfig, loadScoringConfig } from './scoring.config';

export interface KeywordMetrics {
  tag: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  competitionScore: number;
  kdPercent: number;
  trendScore: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  isTrending: boolean;
  seoScore: number;
  videoCount: number;
  confidence: number;
  dataSources: string[];
  diagnostics: {
    volumeMethod: string;
    kdMethod: string;
    trendMethod: string;
    gaps: string[];
    improvements: string[];
  };
}

export interface KeywordAnalysis {
  words: string[];
  wordCount: number;
  charLength: number;
  isQuestion: boolean;
  hasYear: boolean;
  hasNumbers: boolean;
  highValueCount: number;
  hasCommercialIntent: boolean;
  avgWordLength: number;
}

export class KeywordScorer {
  private config: ScoringConfig;

  constructor(config?: ScoringConfig) {
    this.config = config || loadScoringConfig();
  }

  /**
   * Generate deterministic pseudo-random number based on seed
   * Uses simple LCG algorithm for reproducibility
   */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Generate deterministic random in range
   */
  private randomInRange(min: number, max: number, seed: number): number {
    return min + Math.floor(this.seededRandom(seed) * (max - min + 1));
  }

  /**
   * Create deterministic seed from keyword
   */
  private createSeed(keyword: string, salt: string = ''): number {
    let hash = 0;
    const str = keyword + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Analyze keyword structure and characteristics
   */
  public analyzeKeyword(keyword: string): KeywordAnalysis {
    const words = keyword.toLowerCase().split(' ').filter(w => w.length > 0);
    const wordCount = words.length;
    const charLength = keyword.length;

    const isQuestion = /^(how|what|why|when|where|who|which|can|should|will|do|does)/i.test(keyword);
    const hasYear = /202[4-5]/.test(keyword);
    const hasNumbers = /\d/.test(keyword);

    const highValueCount = words.filter(w => 
      this.config.keywords.highValue.includes(w)
    ).length;

    const hasCommercialIntent = words.some(w => 
      this.config.keywords.commercial.includes(w)
    );

    const avgWordLength = charLength / wordCount;

    return {
      words,
      wordCount,
      charLength,
      isQuestion,
      hasYear,
      hasNumbers,
      highValueCount,
      hasCommercialIntent,
      avgWordLength,
    };
  }

  /**
   * Calculate search volume with deterministic randomization
   */
  public calculateVolume(keyword: string, analysis: KeywordAnalysis): {
    volume: number;
    method: string;
    confidence: number;
  } {
    const { wordCount, highValueCount, hasCommercialIntent, isQuestion, hasYear, avgWordLength } = analysis;
    const seed = this.createSeed(keyword, 'volume');

    let baseVolume = 0;
    let method = '';
    let confidence = this.config.confidence.baseConfidence;

    if (wordCount === 1) {
      const range = this.config.volumeWeights.oneWord;
      baseVolume = this.randomInRange(range.min, range.max, seed);
      if (highValueCount > 0) baseVolume *= range.popularMultiplier;
      method = 'one_word_estimation';
      confidence -= 0.15; // Single words are harder to estimate
    } else if (wordCount === 2) {
      const range = this.config.volumeWeights.twoWord;
      baseVolume = this.randomInRange(range.min, range.max, seed);
      if (highValueCount > 0) baseVolume *= range.popularMultiplier;
      if (hasCommercialIntent) baseVolume *= range.commercialMultiplier;
      method = 'two_word_estimation';
      confidence -= 0.10;
    } else if (wordCount === 3) {
      const range = this.config.volumeWeights.threeWord;
      baseVolume = this.randomInRange(range.min, range.max, seed);
      if (isQuestion) baseVolume *= range.questionMultiplier;
      if (hasYear) baseVolume *= range.yearMultiplier;
      if (highValueCount >= 2) baseVolume *= 1.3;
      method = 'three_word_estimation';
      confidence -= 0.05;
    } else if (wordCount === 4) {
      const range = this.config.volumeWeights.fourWord;
      baseVolume = this.randomInRange(range.min, range.max, seed);
      if (isQuestion) baseVolume *= range.questionMultiplier;
      if (hasYear) baseVolume *= 1.3;
      method = 'four_word_estimation';
    } else {
      const range = this.config.volumeWeights.fivePlusWord;
      baseVolume = this.randomInRange(range.min, range.max, seed);
      if (isQuestion) baseVolume *= range.questionMultiplier;
      method = 'long_tail_estimation';
      confidence += 0.05; // Long-tail is more predictable
    }

    // Apply quality multiplier
    if (avgWordLength > 6) baseVolume *= 1.1;

    const volume = Math.floor(baseVolume);

    return { volume, method, confidence };
  }

  /**
   * Calculate keyword difficulty (KD%)
   */
  public calculateKD(keyword: string, analysis: KeywordAnalysis): {
    kdPercent: number;
    competition: 'low' | 'medium' | 'high';
    method: string;
    confidence: number;
  } {
    const { wordCount, hasCommercialIntent, highValueCount, isQuestion, hasYear } = analysis;
    const seed = this.createSeed(keyword, 'kd');

    let kdPercent = 0;
    let competition: 'low' | 'medium' | 'high' = 'medium';
    let method = '';
    let confidence = this.config.confidence.baseConfidence;

    if (wordCount === 1) {
      const range = this.config.kdRanges.oneWord;
      kdPercent = this.randomInRange(range.min, range.max, seed);
      competition = 'high';
      method = 'one_word_high_competition';
    } else if (wordCount === 2) {
      if (hasCommercialIntent) {
        const range = this.config.kdRanges.twoWordCommercial;
        kdPercent = this.randomInRange(range.min, range.max, seed);
        competition = 'high';
        method = 'two_word_commercial';
      } else if (highValueCount >= 1) {
        const range = this.config.kdRanges.twoWordPopular;
        kdPercent = this.randomInRange(range.min, range.max, seed);
        competition = 'medium';
        method = 'two_word_popular';
      } else {
        const range = this.config.kdRanges.twoWordNormal;
        kdPercent = this.randomInRange(range.min, range.max, seed);
        competition = 'medium';
        method = 'two_word_normal';
      }
    } else if (wordCount === 3) {
      if (isQuestion) {
        const range = this.config.kdRanges.threeWordQuestion;
        kdPercent = this.randomInRange(range.min, range.max, seed);
        competition = 'low';
        method = 'three_word_question';
        confidence += 0.05;
      } else if (hasYear) {
        const range = this.config.kdRanges.threeWordYear;
        kdPercent = this.randomInRange(range.min, range.max, seed);
        competition = 'low';
        method = 'three_word_year';
        confidence += 0.05;
      } else {
        const range = this.config.kdRanges.threeWordNormal;
        kdPercent = this.randomInRange(range.min, range.max, seed);
        competition = 'medium';
        method = 'three_word_normal';
      }
    } else if (wordCount === 4) {
      const range = this.config.kdRanges.fourWord;
      kdPercent = this.randomInRange(range.min, range.max, seed);
      competition = 'low';
      method = 'four_word_long_tail';
      confidence += 0.10;
    } else {
      const range = this.config.kdRanges.fivePlusWord;
      kdPercent = this.randomInRange(range.min, range.max, seed);
      competition = 'low';
      method = 'five_plus_word_long_tail';
      confidence += 0.15;
    }

    return { kdPercent, competition, method, confidence };
  }

  /**
   * Calculate trend score
   */
  public calculateTrend(keyword: string, analysis: KeywordAnalysis): {
    trendScore: number;
    trendDirection: 'rising' | 'falling' | 'stable';
    isTrending: boolean;
    method: string;
    confidence: number;
  } {
    const { hasYear, isQuestion, highValueCount, hasCommercialIntent } = analysis;
    const seed = this.createSeed(keyword, 'trend');

    let trendScore = 0;
    let trendDirection: 'rising' | 'falling' | 'stable' = 'stable';
    let isTrending = false;
    let method = '';
    let confidence = this.config.confidence.baseConfidence - 0.20; // Trends are hardest to estimate

    if (hasYear) {
      const range = this.config.trendRanges.withYear;
      trendScore = this.randomInRange(range.min, range.max, seed);
      trendDirection = 'rising';
      isTrending = true;
      method = 'year_based_trending';
      confidence += 0.10;
    } else if (isQuestion && highValueCount >= 1) {
      const range = this.config.trendRanges.questionPopular;
      trendScore = this.randomInRange(range.min, range.max, seed);
      trendDirection = 'rising';
      isTrending = trendScore > 75;
      method = 'question_popular';
    } else if (hasCommercialIntent) {
      const range = this.config.trendRanges.commercial;
      trendScore = this.randomInRange(range.min, range.max, seed);
      trendDirection = this.seededRandom(seed) > 0.5 ? 'rising' : 'stable';
      method = 'commercial_intent';
    } else {
      const rand = this.seededRandom(seed);
      if (rand > 0.7) {
        const range = this.config.trendRanges.rising;
        trendScore = this.randomInRange(range.min, range.max, seed);
        trendDirection = 'rising';
        method = 'general_rising';
      } else if (rand < 0.2) {
        const range = this.config.trendRanges.falling;
        trendScore = this.randomInRange(range.min, range.max, seed);
        trendDirection = 'falling';
        method = 'general_falling';
      } else {
        const range = this.config.trendRanges.stable;
        trendScore = this.randomInRange(range.min, range.max, seed);
        trendDirection = 'stable';
        method = 'general_stable';
      }
    }

    return { trendScore, trendDirection, isTrending, method, confidence };
  }

  /**
   * Calculate SEO score
   */
  public calculateSEOScore(volume: number, trendScore: number, kdPercent: number): number {
    const volumeWeight = Math.min((volume / 100000) * 100, 100);
    const trendWeight = trendScore;
    const competitionWeight = 100 - kdPercent;

    const seoScore = Math.round(
      (volumeWeight * this.config.seoWeights.volume) +
      (trendWeight * this.config.seoWeights.trend) +
      (competitionWeight * this.config.seoWeights.competition)
    );

    return seoScore;
  }

  /**
   * Score a single keyword with full diagnostics
   */
  public scoreKeyword(keyword: string): KeywordMetrics {
    const analysis = this.analyzeKeyword(keyword);

    const volumeResult = this.calculateVolume(keyword, analysis);
    const kdResult = this.calculateKD(keyword, analysis);
    const trendResult = this.calculateTrend(keyword, analysis);

    const seoScore = this.calculateSEOScore(
      volumeResult.volume,
      trendResult.trendScore,
      kdResult.kdPercent
    );

    const videoCount = Math.floor(volumeResult.volume * (kdResult.kdPercent / 10));

    // Calculate overall confidence
    const confidence = Math.min(
      (volumeResult.confidence + kdResult.confidence + trendResult.confidence) / 3,
      0.95
    );

    // Generate diagnostics
    const gaps: string[] = [];
    const improvements: string[] = [];

    if (confidence < 0.70) {
      gaps.push('Low confidence due to estimation-based scoring');
      improvements.push('Add Google Ads Keyword Planner API for real search volume');
    }

    if (trendResult.confidence < 0.60) {
      gaps.push('Trend data is estimated without real-time signals');
      improvements.push('Integrate Google Trends API for accurate trend data');
    }

    if (analysis.wordCount === 1) {
      gaps.push('Single-word keywords have high variance in actual volume');
      improvements.push('Use YouTube autocomplete API for better single-word estimates');
    }

    return {
      tag: keyword,
      searchVolume: volumeResult.volume,
      competition: kdResult.competition,
      competitionScore: kdResult.kdPercent,
      kdPercent: kdResult.kdPercent,
      trendScore: trendResult.trendScore,
      trendDirection: trendResult.trendDirection,
      isTrending: trendResult.isTrending,
      seoScore,
      videoCount,
      confidence,
      dataSources: ['estimation'],
      diagnostics: {
        volumeMethod: volumeResult.method,
        kdMethod: kdResult.method,
        trendMethod: trendResult.method,
        gaps,
        improvements,
      },
    };
  }

  /**
   * Score multiple keywords
   */
  public scoreKeywords(keywords: string[]): KeywordMetrics[] {
    return keywords.map(keyword => this.scoreKeyword(keyword));
  }
}
