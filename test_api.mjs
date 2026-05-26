import fetch from "node-fetch";

async function run() {
  console.log("Fetching API...");
  try {
    const res = await fetch("http://localhost:3000/api/top100");
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Meta:", data.meta);
    if (data.channels && data.channels.length > 0) {
      console.log(`First channel: ${data.channels[0].name} - ${data.channels[0].subs} subs`);
      console.log(`Total channels returned: ${data.channels.length}`);
    } else {
      console.log("Error or no channels:", data);
    }
  } catch (err) {
    console.log("Could not hit dev server:", err.message);
  }
}
run();
