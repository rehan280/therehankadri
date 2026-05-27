const fetch = require('node-fetch');

async function testPlaylist() {
  console.log("Testing YouTube Playlist...");
  const url = "http://localhost:3000/api/youtube-playlist?url=https://www.youtube.com/playlist?list=PLBCF2DAC6FFB574DE";
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    if (!res.ok) {
      console.error("Error payload:", data);
    } else {
      console.log("Success! Keys in response:", Object.keys(data));
      console.log("First item sample:", JSON.stringify(data.items[0]).substring(0, 150));
    }
  } catch (e) {
    console.error("Fetch failed:", e.message);
  }
}

testPlaylist();
