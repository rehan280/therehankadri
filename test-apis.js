const fetch = require('node-fetch');

async function testEndpoints() {
  console.log("Testing YouTube Tools APIs...");
  const tests = [
    { name: "Tags", url: "http://localhost:3000/api/youtube-tags?keyword=gaming" },
    { name: "Metadata", url: "http://localhost:3000/api/youtube-metadata?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
    { name: "Playlist", url: "http://localhost:3000/api/youtube-playlist?url=https://www.youtube.com/playlist?list=PLoRwcdv6t_V2fN1d_F08X6jS9F7J1Yj3t" },
    { name: "Search", url: "http://localhost:3000/api/youtube-search?q=gaming" },
    { name: "Channel Keywords", url: "http://localhost:3000/api/yt-channel-keywords?target=@MrBeast" }
  ];

  for (const t of tests) {
    try {
      console.log(`\n--- Testing ${t.name} ---`);
      console.log(`GET ${t.url}`);
      const res = await fetch(t.url);
      const data = await res.json();
      console.log(`Status: ${res.status}`);
      if (!res.ok) {
        console.error("Error payload:", data);
      } else {
        console.log("Success! Keys in response:", Object.keys(data));
        // Print a small sample
        console.log("Sample:", JSON.stringify(data).substring(0, 150) + "...");
      }
    } catch (e) {
      console.error("Fetch failed:", e.message);
    }
  }
}

testEndpoints();
