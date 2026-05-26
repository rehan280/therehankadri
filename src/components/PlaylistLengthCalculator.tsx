import React, { useState, useMemo } from "react";
import styles from "@/app/(frontend)/(tools)/youtube-tags-generator/page.module.css";
import { PlaylistVideoFrontend } from "@/app/(frontend)/(tools)/_generic/GenericToolClient";

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, "0"))
    .filter((v, i) => v !== "00" || i > 0)
    .join(":");
}

export function PlaylistLengthCalculator() {
  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState<PlaylistVideoFrontend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [startRange, setStartRange] = useState(1);
  const [endRange, setEndRange] = useState(0);
  const [customSpeed, setCustomSpeed] = useState<number>(1);

  const handleFetch = async () => {
    if (!url.trim()) return alert("Please enter a playlist URL first.");
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/youtube-playlist?url=${encodeURIComponent(url.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch playlist data.");
      setVideos(data.items);
      setStartRange(1);
      setEndRange(data.items.length);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Constrain range
  const validStart = Math.max(1, Math.min(startRange, videos.length || 1));
  const validEnd = Math.max(validStart, Math.min(endRange || videos.length || 1, videos.length || 1));

  // Calculate total seconds for the selected range
  const totalSeconds = useMemo(() => {
    if (!videos.length) return 0;
    return videos.slice(validStart - 1, validEnd).reduce((acc, vid) => acc + vid.durationSeconds, 0);
  }, [videos, validStart, validEnd]);

  const speeds = [
    { label: "1.25×", value: formatDuration(totalSeconds / 1.25) },
    { label: "1.5×",  value: formatDuration(totalSeconds / 1.5)  },
    { label: "1.75×", value: formatDuration(totalSeconds / 1.75) },
    { label: "2×",    value: formatDuration(totalSeconds / 2)    },
  ];
  if (customSpeed !== 1 && ![1.25, 1.5, 1.75, 2].includes(customSpeed)) {
     speeds.push({ label: `${customSpeed}×`, value: formatDuration(totalSeconds / customSpeed) });
  }

  return (
    <div className={styles.toolArea}>
      <div className={styles.calcCard} style={{ padding: "2rem" }}>
        
        {/* URL Input */}
        <div style={{ marginBottom: "2rem", textAlign: "left" }}>
          <label className={styles.calcLabel} style={{ marginBottom: "0.5rem", display: "block" }}>Playlist URL</label>
          <div style={{ display: "flex", gap: "0.5rem" }}>
             <input 
               type="text" 
               value={url}
               onChange={(e) => setUrl(e.target.value)}
               placeholder="https://www.youtube.com/playlist?list=..."
               className={styles.calcInput}
               style={{ flexGrow: 1 }}
             />
             {videos.length > 0 && <span style={{ color: "#4ade80", fontSize: "1.5rem", alignSelf: "center" }}>✓</span>}
          </div>
          {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.9rem" }}>{error}</p>}
        </div>

        <button 
          onClick={handleFetch}
          disabled={isLoading || !url.trim()}
          className={styles.generateButton}
          style={{ width: "100%", marginTop: "0.5rem", opacity: (isLoading || !url.trim()) ? 0.7 : 1 }}
        >
          {isLoading ? "Fetching Playlist..." : "Calculate Length"}
        </button>

        {videos.length > 0 && (
          <div className={styles.calcContainer} style={{ marginTop: "3rem" }}>
            <div className={styles.calcTop} style={{ flexDirection: "column", gap: "1.5rem" }}>
              
              <div className={styles.calcControl}>
                <div className={styles.calcHeader}>
                  <span className={styles.calcLabel}>Video Range</span>
                  <span className={styles.calcVal}>{validStart} - {validEnd}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
                   <input
                      type="number"
                      min="1"
                      max={videos.length}
                      value={startRange}
                      onChange={(e) => setStartRange(Number(e.target.value))}
                      className={styles.calcInput}
                      placeholder="Start video (e.g. 1)"
                   />
                   <input
                      type="number"
                      min="1"
                      max={videos.length}
                      value={endRange}
                      onChange={(e) => setEndRange(Number(e.target.value))}
                      className={styles.calcInput}
                      placeholder={`End video (e.g. ${videos.length})`}
                   />
                </div>
                <p className={styles.calcLimits} style={{ marginTop: "0.5rem", justifyContent: "center" }}>Total Videos Available: {videos.length}</p>
              </div>

              <div className={styles.calcControl}>
                <div className={styles.calcHeader}>
                  <span className={styles.calcLabel}>Custom Playback Speed</span>
                  <span className={styles.calcVal}>{customSpeed}×</span>
                </div>
                <select
                   value={customSpeed}
                   onChange={(e) => setCustomSpeed(Number(e.target.value))}
                   className={styles.calcInput}
                   style={{ marginTop: "0.5rem", width: "100%", backgroundColor: "#111", color: "#fff" }}
                >
                   <option value={1}>1.0×</option>
                   <option value={1.25}>1.25×</option>
                   <option value={1.5}>1.5×</option>
                   <option value={1.75}>1.75×</option>
                   <option value={2}>2.0×</option>
                   <option value={2.5}>2.5×</option>
                   <option value={3}>3.0×</option>
                   <option value={4}>4.0×</option>
                </select>
              </div>
            </div>

            <div className={styles.playlistStack} style={{ marginTop: "2rem" }}>
              <div className={styles.playlistHero}>
                <span className={styles.playlistHeroLabel}>Total Watch Time ({validStart} - {validEnd})</span>
                <span className={styles.playlistHeroValue}>{formatDuration(totalSeconds)}</span>
              </div>
              
              {customSpeed !== 1 && (
                <div className={styles.playlistHero} style={{ marginTop: "1rem", background: "rgba(255, 90, 54, 0.15)", border: "1px solid rgba(255, 90, 54, 0.4)" }}>
                  <span className={styles.playlistHeroLabel}>Watch Time at {customSpeed}× Speed</span>
                  <span className={styles.playlistHeroValue} style={{ color: "#fff" }}>{formatDuration(totalSeconds / customSpeed)}</span>
                </div>
              )}
              
              <div className={styles.playlistSpeedGrid} style={{ marginTop: "2rem" }}>
                {speeds.filter(s => parseFloat(s.label) !== customSpeed).map(({ label, value }) => (
                  <div key={label} className={styles.playlistSpeedCard}>
                    <span className={styles.playlistSpeedLabel}>{label}</span>
                    <span className={styles.playlistSpeedValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
