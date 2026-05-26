const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from .env.local
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
for (const k in envConfig) {
  process.env[k] = envConfig[k];
}

const keys = [
  process.env.YOUTUBE_DATA_API_KEY,
  process.env.YOUTUBE_DATA_API_KEY_2,
  process.env.YOUTUBE_DATA_API_KEY_3,
  process.env.YOUTUBE_DATA_API_KEY_4,
].filter(Boolean);

console.log("Keys loaded:", keys.length);

async function testSearch(name) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(name)}&maxResults=1&key=${keys[0]}`;
  console.log("Fetching:", url.replace(keys[0], '***'));
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    console.error("API ERROR:", data.error.message);
  } else {
    console.log("Found:", data.items?.[0]?.snippet?.title, "ID:", data.items?.[0]?.snippet?.channelId);
  }
}

testSearch("MrBeast");
