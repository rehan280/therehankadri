async function test() {
  const res = await fetch(
    "https://en.wikipedia.org/w/api.php?action=parse&page=List_of_most-subscribed_YouTube_channels&prop=wikitext&format=json&section=1"
  );
  const data = await res.json();
  const wikitext = data.parse?.wikitext?.["*"] || "";
  
  // The table rows start with |- and then the first cell is the name
  // Example:
  // |-
  // | [[MrBeast]]
  // OR
  // | [[T-Series (company)|T-Series]]
  
  const lines = wikitext.split("\n");
  const channels = [];
  let inRow = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("|-")) {
      inRow = true;
      // The next line or the one after should be the channel name
      // Look for the first line starting with | after |-
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith("|")) {
        j++;
      }
      if (j < lines.length && lines[j].startsWith("|")) {
        let nameLine = lines[j].substring(1).trim();
        // Handle wikilinks: [[Target|Display]] or [[Target]]
        if (nameLine.includes("[[")) {
          const match = nameLine.match(/\[\[(.*?)\]\]/);
          if (match) {
            let name = match[1];
            if (name.includes("|")) {
              name = name.split("|")[1];
            }
            channels.push(name);
          }
        } else {
            // Sometimes it's just text
            if(nameLine && !nameLine.startsWith("scope=") && !nameLine.includes("bgcolor=") && !nameLine.startsWith("}")) {
                channels.push(nameLine.trim());
            }
        }
      }
    }
  }
  
  console.log("Channels found:", channels.length);
  console.log(channels);
}
test();
