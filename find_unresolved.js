const fetch = require('node-fetch');

async function run() {
  const html = await (await fetch('https://en.wikipedia.org/wiki/List_of_most-subscribed_YouTube_channels')).text();
  const tableMatch = html.match(/<table class="sortable wikitable[^>]*>([\s\S]*?)<\/table>/);
  const rows = tableMatch[1].split('<tr').slice(1);
  const unresolved = [];
  
  for (const row of rows) {
    const cols = row.split(/<td[^>]*>/).slice(1);
    if (cols.length < 2) continue;
    
    let name = cols[0].replace(/<\/?[^>]+(>|$)/g, '').trim();
    const linkMatch = cols[1].match(/href="([^"]+)"/);
    if (!linkMatch) continue;
    
    const link = linkMatch[1];
    if (link.includes('youtube.com') && !link.includes('/channel/UC') && !link.includes('/@') && !link.includes('/user/')) {
        unresolved.push({name, link});
    }
  }
  
  console.log('Unresolved custom URLs:', unresolved);
}
run();
