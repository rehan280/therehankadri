const fs = require('fs');

const names = [
  "MrBeast", "T-Series", "Cocomelon", "SET India", "Kids Diana Show",
  "PewDiePie", "Like Nastya", "Vlad and Niki", "Zee Music Company", "WWE",
  "Blackpink", "Goldmines", "Sony SAB", "5-Minute Crafts", "BangtanTV",
  "Hybe Labels", "Justin Bieber", "Zee TV", "Pinkfong", "ChuChu TV",
  "Canal KondZilla", "Color TV", "BillionSurpriseToys", "T-Series Bhakti Sagar", "Dude Perfect",
  "Movieclips", "Tips Official", "EminemMusic", "El Reino Infantil", "Ed Sheeran",
  "Aaj Tak", "Marshmello", "Ariana Grande", "Sony Music India", "Taylor Swift",
  "LooLoo Kids", "Billiards", "JuegaGerman", "Badabun", "Fernanfloo",
  "Felipe Neto", "Voot Kids", "Viacom18", "BRIGHT SIDE", "Katy Perry",
  "Whinderssonnunes", "Alan Walker", "Voces Infantiles", "El Rubius", "TheEllenShow",
  "Eros Now", "Mnet K-POP", "Shakira", "Rihanna", "Toys and Colors",
  "infobells", "Little Baby Bum", "Wave Music", "SMTOWN", "Super Simple Songs",
  "One Direction", "Markiplier", "CVS 3D Rhymes", "Galinha Pintadinha", "Maroon 5",
  "Get Movies", "A4", "Masha and The Bear", "SAB TV", "Jacksepticeye",
  "Trap Nation", "StarPlus", "Crazy Frog", "T-Series Apna Punjab", "WorkpointOfficial",
  "DanTDM", "Peppa Pig", "ABS-CBN Entertainment", "Sony Music Entertainment", "JYP Entertainment",
  "JustinBieberVEVO", "Ozuna", "TaylorSwiftVEVO", "Daddy Yankee", "shfa",
  "GMA Network", "Spinnin' Records", "AuronPlay", "Vegetta777", "Ryan's World",
  "CarryMinati", "Total Gaming", "MrBeast Gaming", "Mikecrack", "Jkk Entertainment",
  "Desi Music Factory", "T-Series Telugu", "Speed Records", "Sony PAL"
];

const keys = [
  "AIzaSyD57bNZxLDp--XlX2NGErgqSX6k_m0_in8",
  "AIzaSyD5SMVEX79nShdNJApuz53gsuKEb0jCsH0",
  "AIzaSyDuX7EFhiLC6UQeyfdGBa-FkpLGZnDrJBU",
  "AIzaSyAYwIf0RVVAMjK1Tc4Ol0vrJOpm-Tv6bwo"
];

async function run() {
  const ids = [];
  
  for (let i = 0; i < names.length; i++) {
    const name = names[i];
    const apiKey = keys[i % keys.length];
    console.log(`Fetching ${i+1}/${names.length}: ${name} with key ${i % keys.length}`);
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(name)}&maxResults=1&key=${apiKey}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        ids.push({ name, id: data.items[0].snippet.channelId });
      }
    } catch (e) {
      console.log('Error', e);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  fs.writeFileSync('top100_ids.json', JSON.stringify(ids.map(i => i.id), null, 2));
  console.log(`Done. Saved ${ids.length} IDs to top100_ids.json`);
}

run();
