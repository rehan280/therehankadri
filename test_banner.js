const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const key = envConfig.YOUTUBE_DATA_API_KEY;

async function run() {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=brandingSettings&forHandle=@MonkeyxMagic&key=${key}`);
  const data = await res.json();
  console.log(data.items?.[0]?.brandingSettings?.image);
}
run();
