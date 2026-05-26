const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const key = envConfig.YOUTUBE_DATA_API_KEY;

async function run() {
  const custom = ['PewDiePie', 'taylorswift', 'edsheeran', 'billieeilish', 'arianagrande', 'starplus'];
  for (const c of custom) {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@${c}&key=${key}`);
    const data = await res.json();
    console.log(c, data.items?.[0]?.id || data.error?.message);
  }
}
run();
