const fetch = require('node-fetch');
async function run() {
  const res = await fetch('https://en.wikipedia.org/wiki/List_of_most-subscribed_YouTube_channels');
  const html = await res.text();
  const tableMatch = html.match(/<table class="sortable wikitable[^>]*>([\s\S]*?)<\/table>/);
  const rows = tableMatch[1].split('<tr').slice(1);
  let uc=0, at=0, user=0, other=0, c=0;
  for (const row of rows) {
    const cols = row.split(/<td[^>]*>/).slice(1);
    if(cols.length < 2) continue;
    const linkMatch = cols[1].match(/href="([^"]+)"/);
    if(!linkMatch) continue;
    const link = linkMatch[1];
    if(link.includes('/channel/UC')) uc++;
    else if(link.includes('/@')) at++;
    else if(link.includes('/user/')) user++;
    else if(link.includes('/c/')) c++;
    else { other++; console.log('Other:', link); }
  }
  console.log('UC:', uc, 'AT:', at, 'USER:', user, 'C:', c, 'OTHER:', other);
}
run();
