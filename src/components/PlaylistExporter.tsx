"use client";

import { useState } from "react";
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

export function PlaylistExporter() {
  const [url, setUrl] = useState("");
  const [videos, setVideos] = useState<PlaylistVideoFrontend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const allColumns = [
    { id: "title", label: "Title" },
    { id: "url", label: "Video url" },
    { id: "tags", label: "Tags" },
    { id: "tags_desc", label: "Tags (in description)" },
    { id: "emails", label: "Emails (in description)" },
    { id: "links", label: "Links (in description)" },
    { id: "description", label: "Description" },
    { id: "thumbnail", label: "Thumbnail" },
    { id: "channelName", label: "Channel name" },
    { id: "views", label: "Views" },
    { id: "likes", label: "Likes" },
    { id: "comments", label: "Comments" },
    { id: "duration", label: "Duration" },
    { id: "duration_sec", label: "Duration (Seconds)" },
    { id: "duration_min", label: "Duration (Minutes)" },
    { id: "uploadedAt", label: "Uploaded time" },
  ];

  const exportFormats = ["CSV", "JSON", "Markdown", "XML", "HTML", "YAML", "SQLite", "Text", "Bookmark HTML"];

  const [selectedCols, setSelectedCols] = useState<string[]>(allColumns.map(c => c.id));
  const [sortBy, setSortBy] = useState<string>("default");

  const toggleColumn = (id: string) => {
    if (selectedCols.includes(id)) {
      setSelectedCols(selectedCols.filter(c => c !== id));
    } else {
      setSelectedCols([...selectedCols, id]);
    }
  };

  const clearOrSelectAll = () => {
    if (selectedCols.length === allColumns.length) {
      setSelectedCols([]);
    } else {
      setSelectedCols(allColumns.map(c => c.id));
    }
  };

  // Helper to extract data
  const extractTags = (desc: string) => (desc.match(/#[\w-]+/g) || []).join(", ");
  const extractEmails = (desc: string) => (desc.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+/g) || []).join(", ");
  const extractLinks = (desc: string) => (desc.match(/https?:\/\/[^\s]+/g) || []).join(", ");

  const getProcessedData = (sourceVideos: PlaylistVideoFrontend[] = videos) => {
    let sorted = [...sourceVideos];
    if (sortBy === "views_desc") sorted.sort((a, b) => b.views - a.views);
    if (sortBy === "views_asc") sorted.sort((a, b) => a.views - b.views);
    if (sortBy === "likes_desc") sorted.sort((a, b) => b.likes - a.likes);
    if (sortBy === "date_desc") sorted.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    if (sortBy === "duration_desc") sorted.sort((a, b) => b.durationSeconds - a.durationSeconds);

    return sorted.map((vid, idx) => {
      const row: Record<string, string | number> = {};
      
      if (selectedCols.includes("title")) row.Title = vid.title;
      if (selectedCols.includes("url")) row.URL = vid.url;
      if (selectedCols.includes("tags")) row.Tags = vid.tags.join(", ");
      if (selectedCols.includes("tags_desc")) row["Tags (in description)"] = extractTags(vid.description);
      if (selectedCols.includes("emails")) row["Emails (in description)"] = extractEmails(vid.description);
      if (selectedCols.includes("links")) row["Links (in description)"] = extractLinks(vid.description);
      if (selectedCols.includes("description")) row.Description = vid.description.replace(/\n/g, " ");
      if (selectedCols.includes("thumbnail")) row.Thumbnail = vid.thumbnailUrl;
      if (selectedCols.includes("channelName")) row["Channel name"] = vid.channelName;
      if (selectedCols.includes("views")) row.Views = vid.views;
      if (selectedCols.includes("likes")) row.Likes = vid.likes;
      if (selectedCols.includes("comments")) row.Comments = vid.comments;
      if (selectedCols.includes("duration")) row.Duration = formatDuration(vid.durationSeconds);
      if (selectedCols.includes("duration_sec")) row["Duration (Seconds)"] = vid.durationSeconds;
      if (selectedCols.includes("duration_min")) row["Duration (Minutes)"] = (vid.durationSeconds / 60).toFixed(2);
      if (selectedCols.includes("uploadedAt")) row["Uploaded time"] = vid.uploadedAt;

      return row;
    });
  };

  const handleExport = async (format: string) => {
    if (!url.trim()) return alert("Please enter a playlist URL first.");
    
    setIsLoading(true);
    setError("");
    let currentVideos = videos;

    if (videos.length === 0) {
      try {
        const res = await fetch(`/api/youtube-playlist?url=${encodeURIComponent(url.trim())}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch playlist data.");
        currentVideos = data.items;
        setVideos(currentVideos);
      } catch (err: any) {
        setError(err.message || "An error occurred");
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(false);

    const data = getProcessedData(currentVideos);
    if (data.length === 0) return alert("No data or columns selected.");

    let content = "";
    let mimeType = "text/plain";
    let ext = ".txt";

    if (format === "JSON") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      ext = ".json";
    } else if (format === "CSV") {
      const headers = Object.keys(data[0]);
      content = headers.join(",") + "\n" + data.map(row => headers.map(h => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")).join("\n");
      mimeType = "text/csv";
      ext = ".csv";
    } else if (format === "Markdown") {
      const headers = Object.keys(data[0]);
      content = `| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n`;
      content += data.map(row => `| ${headers.map(h => String(row[h]).replace(/\|/g, "\\|")).join(" | ")} |`).join("\n");
      mimeType = "text/markdown";
      ext = ".md";
    } else if (format === "XML") {
      content = `<?xml version="1.0" encoding="UTF-8"?>\n<playlist>\n` + data.map(row => `  <video>\n` + Object.keys(row).map(h => `    <${h.replace(/\s|\(|\)/g, "_")}>${String(row[h]).replace(/</g, "&lt;").replace(/>/g, "&gt;")}</${h.replace(/\s|\(|\)/g, "_")}>`).join("\n") + `\n  </video>`).join("\n") + `\n</playlist>`;
      mimeType = "application/xml";
      ext = ".xml";
    } else if (format === "HTML") {
      const escapeHtml = (s: string) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      content = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Exported Playlist</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8f9fa; margin: 0; padding: 2rem; color: #333; }
  .header { display: flex; flex-direction: column; align-items: center; margin-bottom: 2rem; }
  .header h1 { margin: 0 0 1rem 0; font-size: 2rem; color: #111; }
  .controls { display: flex; gap: 1rem; width: 100%; max-width: 800px; }
  .search-input, .sort-select { padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; outline: none; }
  .search-input { flex-grow: 1; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; max-width: 1200px; margin: 0 auto; }
  .card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); text-decoration: none; color: inherit; display: flex; flex-direction: column; transition: transform 0.2s; }
  .card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
  .thumb-wrap { position: relative; width: 100%; padding-top: 56.25%; background: #000; }
  .thumb { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
  .duration { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
  .info { padding: 1rem; display: flex; flex-direction: column; flex-grow: 1; }
  .title { font-weight: 600; font-size: 1.1rem; margin: 0 0 0.5rem 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .channel { color: #666; font-size: 0.9rem; margin: 0 0 0.25rem 0; }
  .date { color: #888; font-size: 0.85rem; margin: 0 0 1rem 0; }
  .stats { display: flex; gap: 1rem; font-size: 0.85rem; color: #666; margin-top: auto; padding-top: 1rem; border-top: 1px solid #eee; }
</style>
</head>
<body>
<div class="header">
  <h1>Playlist Export</h1>
  <div class="controls">
    <input type="text" id="searchInput" class="search-input" placeholder="Search by title or channel...">
    <select id="sortSelect" class="sort-select">
      <option value="default">Default Order</option>
      <option value="views">Views (High to Low)</option>
      <option value="likes">Likes (High to Low)</option>
      <option value="recent">Newest First</option>
    </select>
  </div>
</div>
<div id="grid" class="grid"></div>
<script>
const videos = ${JSON.stringify(currentVideos)};
const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

function render() {
  const query = searchInput.value.toLowerCase();
  let filtered = videos.filter(v => v.title.toLowerCase().includes(query) || v.channelName.toLowerCase().includes(query));
  
  const sort = sortSelect.value;
  if (sort === 'views') filtered.sort((a,b) => b.views - a.views);
  else if (sort === 'likes') filtered.sort((a,b) => b.likes - a.likes);
  else if (sort === 'recent') filtered.sort((a,b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  
  grid.innerHTML = filtered.map(v => \`
    <a href="\${v.url}" target="_blank" class="card">
      <div class="thumb-wrap">
        <img src="\${v.thumbnailUrl}" class="thumb" loading="lazy" />
        <div class="duration">\${v.durationSeconds >= 3600 ? Math.floor(v.durationSeconds/3600) + 'h ' : ''}\${Math.floor((v.durationSeconds%3600)/60)}m \${v.durationSeconds%60}s</div>
      </div>
      <div class="info">
        <h3 class="title">\${v.title}</h3>
        <p class="channel">\${v.channelName}</p>
        <p class="date">\${new Date(v.uploadedAt).toLocaleDateString()}</p>
        <div class="stats">
          <span>👁️ \${Number(v.views).toLocaleString()}</span>
          <span>👍 \${Number(v.likes).toLocaleString()}</span>
          <span>💬 \${Number(v.comments).toLocaleString()}</span>
        </div>
      </div>
    </a>
  \`).join('');
}

searchInput.addEventListener('input', render);
sortSelect.addEventListener('change', render);
render();
</script>
</body>
</html>`;
      mimeType = "text/html";
      ext = ".html";
    } else if (format === "YAML") {
      content = data.map(row => `- ` + Object.keys(row).map((h, i) => `${i === 0 ? "" : "  "}${h}: "${String(row[h]).replace(/"/g, '\\"')}"`).join("\n")).join("\n");
      mimeType = "application/x-yaml";
      ext = ".yaml";
    } else if (format === "Text") {
      content = data.map(row => Object.keys(row).map(h => `${h}: ${row[h]}`).join("\n")).join("\n\n---\n\n");
      mimeType = "text/plain";
      ext = ".txt";
    } else if (format === "Bookmark HTML") {
      content = `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n`;
      content += videos.map(v => `    <DT><A HREF="${v.url}">${v.title}</A>\n`).join("");
      content += `</DL><p>`;
      mimeType = "text/html";
      ext = ".html";
    } else if (format === "SQLite") {
      const headers = Object.keys(data[0]);
      content = `CREATE TABLE playlist (${headers.map(h => `"${h}" TEXT`).join(", ")});\n`;
      content += data.map(row => `INSERT INTO playlist VALUES (${headers.map(h => `'${String(row[h]).replace(/'/g, "''")}'`).join(", ")});`).join("\n");
      mimeType = "application/sql";
      ext = ".sql";
    }

    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `youtube_playlist_export${ext}`;
    a.click();
    URL.revokeObjectURL(objectUrl);
  };

  const [exportFormat, setExportFormat] = useState<string>("CSV");

  return (
    <div className={styles.calcCard} style={{ padding: "2rem" }}>
      
      {/* URL Input */}
      <div style={{ marginBottom: "2rem" }}>
        <label className={styles.calcLabel} style={{ marginBottom: "0.5rem", display: "block" }}>Url</label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
           <input 
             type="text" 
             value={url}
             onChange={(e) => setUrl(e.target.value)}
             placeholder="https://www.youtube.com/watch?v=..."
             className={styles.calcInput}
             style={{ flexGrow: 1 }}
           />
           {videos.length > 0 && <span style={{ color: "#4ade80", fontSize: "1.5rem", alignSelf: "center" }}>✓</span>}
        </div>
        {error && <p style={{ color: "#f87171", marginTop: "0.5rem", fontSize: "0.9rem" }}>{error}</p>}
      </div>

      {/* Settings Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
        
        {/* Columns */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span className={styles.calcLabel} style={{ margin: 0 }}>Select items to be exported</span>
            <button onClick={clearOrSelectAll} style={{ background: "none", border: "none", color: "#ff5a36", cursor: "pointer", fontSize: "0.85rem", textDecoration: "underline" }}>
              {selectedCols.length === allColumns.length ? "CLEAR ALL" : "SELECT ALL"}
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", border: "1px solid rgba(255,90,54,0.1)" }}>
            {allColumns.map(col => (
              <label key={col.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem", color: "#ccc" }}>
                <input 
                  type="checkbox" 
                  checked={selectedCols.includes(col.id)} 
                  onChange={() => toggleColumn(col.id)}
                  style={{ accentColor: "#ff5a36", width: "16px", height: "16px", cursor: "pointer" }}
                />
                {col.label}
              </label>
            ))}
          </div>
        </div>

        {/* Sorting & Formats */}
        <div>
          <div style={{ marginBottom: "1.5rem" }}>
            <span className={styles.calcLabel} style={{ marginBottom: "0.5rem", display: "block" }}>Sort the file based on:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.calcInput}
              style={{ cursor: "pointer", backgroundColor: "#111", color: "#fff" }}
            >
              <option value="default">Default (Playlist Order)</option>
              <option value="views_desc">Views (High to Low)</option>
              <option value="views_asc">Views (Low to High)</option>
              <option value="likes_desc">Likes (High to Low)</option>
              <option value="date_desc">Newest First</option>
              <option value="duration_desc">Duration (Longest First)</option>
            </select>
          </div>

          <div>
            <span className={styles.calcLabel} style={{ marginBottom: "0.5rem", display: "block" }}>Export Format</span>
            <select 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              className={styles.calcInput}
              style={{ cursor: "pointer", backgroundColor: "#111", color: "#fff", marginBottom: "1rem" }}
            >
              {exportFormats.map(fmt => (
                <option key={fmt} value={fmt}>{fmt}</option>
              ))}
            </select>
            
            <button 
              onClick={() => handleExport(exportFormat)}
              disabled={isLoading}
              className={`${styles.generateButton}`}
              style={{ width: "100%", marginTop: "0.5rem", opacity: isLoading ? 0.7 : 1 }}
            >
              {isLoading ? "Fetching Playlist..." : "Export"}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
