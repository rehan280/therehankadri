"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";

export default function YouTubeCommentPickerClient() {
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetchProgress, setFetchProgress] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterDuplicates, setFilterDuplicates] = useState(true);
  const [hashtagFilter, setHashtagFilter] = useState("");

  const [winner, setWinner] = useState<any | null>(null);
  const [isPicking, setIsPicking] = useState(false);

  const extractVideoId = (link: string) => {
    const match = link.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    return match ? match[1] : null;
  };

  const fetchAllComments = async () => {
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError("Please enter a valid YouTube video or Shorts URL.");
      return;
    }

    setIsFetching(true);
    setError(null);
    setComments([]);
    setWinner(null);
    setFetchProgress(0);

    let allComments: any[] = [];
    let nextPageToken: string | null = null;
    let pagesFetched = 0;

    try {
      do {
        const queryParams = new URLSearchParams({ videoId });
        if (nextPageToken) queryParams.append("pageToken", nextPageToken);

        const res = await fetch(`/api/youtube-comments?${queryParams.toString()}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch comments");
        }

        allComments = [...allComments, ...data.comments];
        setFetchProgress(allComments.length);
        nextPageToken = data.nextPageToken;
        pagesFetched++;

        // Hard cap at 50 pages (5000 comments) to protect quota
        if (pagesFetched >= 50) {
          break;
        }
      } while (nextPageToken);

      setComments(allComments);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  };

  const pickWinner = () => {
    if (comments.length === 0) return;

    setIsPicking(true);
    setWinner(null);

    // Apply filters
    let eligibleComments = [...comments];

    if (filterDuplicates) {
      const seenUsers = new Set();
      eligibleComments = eligibleComments.filter(c => {
        if (seenUsers.has(c.authorChannelId)) return false;
        seenUsers.add(c.authorChannelId);
        return true;
      });
    }

    if (hashtagFilter.trim() !== "") {
      const term = hashtagFilter.toLowerCase().trim();
      eligibleComments = eligibleComments.filter(c =>
        c.textOriginal.toLowerCase().includes(term)
      );
    }

    if (eligibleComments.length === 0) {
      setError("No comments match your filter criteria.");
      setIsPicking(false);
      return;
    }

    setError(null);

    // Roulette Animation
    let iterations = 0;
    const maxIterations = 20;
    const intervalTime = 100;

    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * eligibleComments.length);
      setWinner(eligibleComments[randomIdx]);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, intervalTime);
  };

  return (
    <div className={styles.toolArea}>
      <div className={styles.generatorForm}>
        <div className={styles.searchRow}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Paste YouTube Video URL (e.g. https://youtube.com/watch?v=...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && url) fetchAllComments();
            }}
            disabled={isFetching || isPicking}
          />
          <button
            className={styles.generateButton}
            onClick={fetchAllComments}
            disabled={isFetching || isPicking || !url}
          >
            {isFetching ? "Fetching..." : "Load Comments"}
          </button>
        </div>

        {error && <div className={styles.errorText}>{error}</div>}

        {(comments.length > 0 || isFetching) && (
          <div className={styles.filtersCard}>
            <h3 className={styles.filtersTitle}>Picker Options</h3>
            <div className={styles.filterGroup}>
              <input
                type="checkbox"
                id="filterDuplicates"
                className={styles.filterCheckbox}
                checked={filterDuplicates}
                onChange={(e) => setFilterDuplicates(e.target.checked)}
                disabled={isFetching || isPicking}
              />
              <label htmlFor="filterDuplicates" className={styles.filterLabel}>
                Filter Duplicate Users (1 entry per user)
              </label>
            </div>
            <div className={styles.filterGroup}>
              <label htmlFor="hashtagFilter" className={styles.filterLabel} style={{ minWidth: "220px" }}>
                Must Include Text/Hashtag:
              </label>
              <input
                type="text"
                id="hashtagFilter"
                className={styles.filterInput}
                placeholder="e.g. #giveaway or awesome"
                value={hashtagFilter}
                onChange={(e) => setHashtagFilter(e.target.value)}
                disabled={isFetching || isPicking}
              />
            </div>
          </div>
        )}

        {isFetching && (
          <div className={styles.progressContainer}>
            <div className={styles.progressSpinner}></div>
            <div className={styles.progressText}>Loading comments...</div>
            <div className={styles.progressSubText}>Fetched {fetchProgress} comments so far</div>
          </div>
        )}

        {comments.length > 0 && !isFetching && !winner && !isPicking && (
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{comments.length}</span>
              <span className={styles.statLabel}>Total Loaded</span>
            </div>
          </div>
        )}

        {comments.length > 0 && !isFetching && (
          <div className={styles.actionButtons}>
            <button
              className={styles.generateButton}
              onClick={pickWinner}
              disabled={isPicking}
              style={{ padding: "0 40px", fontSize: "1.1rem" }}
            >
              {isPicking ? "Picking..." : "Pick Random Winner"}
            </button>
          </div>
        )}

        {winner && (
          <div className={`${styles.winnerBox} ${isPicking ? styles.pickingActive : ""}`}>
            {!isPicking && <div className={styles.winnerText}>🏆 We have a winner! 🏆</div>}
            <div className={styles.winnerProfile}>
              <img src={winner.authorProfileImageUrl} alt={winner.authorDisplayName} className={styles.winnerAvatar} />
              <h4 className={styles.winnerName}>{winner.authorDisplayName}</h4>
            </div>
            <div className={styles.winnerComment}>
              "{winner.textOriginal}"
            </div>
          </div>
        )}
      </div>
      {/* LEAD CAPTURE BOTTOM - PREMIUM BOX */}
      <div style={{ padding: "3rem 2rem", background: "linear-gradient(145deg, rgba(20,20,20,0.9), rgba(10,10,10,1))", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)", position: "relative", overflow: "hidden" }}>
        {/* Subtle orange glow at the top */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, transparent, var(--brand-orange), transparent)", opacity: 0.6 }}></div>
        {/* Subtle orange ambient glow in background */}
        <div style={{ position: "absolute", top: "-50px", left: "50%", transform: "translateX(-50%)", width: "200px", height: "100px", background: "var(--brand-orange)", filter: "blur(80px)", opacity: 0.15, pointerEvents: "none" }}></div>
        
        <h3 style={{ margin: "0 0 0.75rem", fontSize: "1.6rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", position: "relative", zIndex: 1 }}>Need help growing your channel?</h3>
        <p style={{ margin: "0 0 2rem", color: "rgba(255,255,255,0.7)", fontSize: "1.05rem", maxWidth: "450px", lineHeight: 1.6, position: "relative", zIndex: 1 }}>We help creators and brands scale with proven content strategy, SEO, and audience retention tactics.</p>
        
        <Link href="/contact" style={{ position: "relative", zIndex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "1rem 2rem", background: "var(--brand-orange)", color: "#fff", fontWeight: 700, borderRadius: "8px", textDecoration: "none", fontSize: "1.05rem", transition: "all 0.2s ease-in-out", boxShadow: "0 4px 15px rgba(255,90,54,0.4)", width: "100%", maxWidth: "320px" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,90,54,0.5)"; e.currentTarget.style.background = "#ff6a45"; }} onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,90,54,0.4)"; e.currentTarget.style.background = "var(--brand-orange)"; }}>Book Free Strategy Call</Link>
      </div>
    </div>
  );
}
