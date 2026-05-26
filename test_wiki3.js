const jsdom = require("jsdom");
const { JSDOM } = jsdom;

async function test() {
  const res = await fetch("https://en.wikipedia.org/wiki/List_of_most-subscribed_YouTube_channels");
  const html = await res.text();
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const tables = document.querySelectorAll("table.wikitable");
  const mainTable = tables[0];
  
  const rows = mainTable.querySelectorAll("tbody tr");
  const channels = [];
  
  rows.forEach((row, i) => {
    if (i === 0) return; // Header
    const cols = row.querySelectorAll("td");
    if (cols.length < 2) return;
    
    const name = cols[0].textContent.trim();
    const linkEl = cols[1].querySelector("a");
    const link = linkEl ? linkEl.href : "";
    
    // Extract ID or handle from link
    // Examples: https://www.youtube.com/channel/UC... or https://www.youtube.com/@...
    
    channels.push({ name, link });
  });
  
  console.log("Found channels:", channels.length);
  console.log(channels.slice(0, 10));
}

test();
