// Test Wikipedia API to get channel names from the list
async function test() {
  // Wikipedia has a REST API that returns parsed sections as plain text/JSON
  const res = await fetch(
    "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_most-subscribed_YouTube_channels&prop=wikitext&format=json&section=1",
    { headers: { "User-Agent": "Mozilla/5.0 TestBot/1.0" } }
  );
  const data = await res.json();
  const wikitext = data.parse?.wikitext?.["*"] || "";
  
  // Extract YouTube channel links - pattern: youtube.com/channel/UCxxxxxxxx or youtube.com/@handle
  const channelIdMatches = wikitext.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/g) || [];
  const handleMatches = wikitext.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/g) || [];
  
  // Extract channel IDs
  const ids = [...new Set(channelIdMatches.map(m => m.replace("youtube.com/channel/", "")))];
  console.log("Channel IDs found:", ids.length);
  console.log("First 10:", ids.slice(0, 10));
  console.log("Handles found:", handleMatches.slice(0, 5));
  console.log("\nRaw wikitext sample (first 3000 chars):");
  console.log(wikitext.slice(0, 3000));
}
test();
