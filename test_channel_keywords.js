const fetch = require('node-fetch');

async function run() {
  const res = await fetch('https://www.youtube.com/@MonkeyxMagic');
  const html = await res.text();
  const match = html.match(/<meta name="keywords" content="([^"]+)">/i);
  console.log('Keywords:', match ? match[1] : 'None');
}
run();
