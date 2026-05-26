async function test() {
  const res = await fetch("https://en.wikipedia.org/wiki/List_of_most-subscribed_YouTube_channels");
  const html = await res.text();
  
  // Find the wikitable containing the channels
  // Usually it's the first or second wikitable.
  const tableMatch = html.match(/<table class="sortable wikitable[^>]*>(.*?)<\/table>/s);
  if (!tableMatch) return console.log("No table found");
  
  const tbody = tableMatch[1];
  const rows = tbody.split("<tr").slice(1);
  
  const channels = [];
  
  for (const row of rows) {
    const cols = row.split(/<td[^>]*>/).slice(1);
    if (cols.length < 2) continue;
    
    // col[0] contains name inside links or just text
    let name = cols[0].replace(/<\/?[^>]+(>|$)/g, "").trim();
    
    // col[1] contains the link
    const linkMatch = cols[1].match(/href="([^"]+)"/);
    if (!linkMatch) continue;
    const link = linkMatch[1];
    
    // If it's a valid youtube link
    if (link.includes("youtube.com")) {
      channels.push({ name, link });
    }
  }
  
  console.log("Extracted channels:", channels.length);
  console.log(channels.slice(0, 10));
}

test();
