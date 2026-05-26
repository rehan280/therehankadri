
const titles = [
  "How to Download Kaise: A Proxy-First Approach That Works",
  "Proxy vs Server: Which How To Download approach wins in 2025?",
  "The How To Download how-to guide that goes deeper than every other video",
  "Reacting to the most popular How To Download advice on YouTube (is it actually good?)"
];

function recombine(titles) {
  const parts = [];
  for (const t of titles) {
    if (t.includes(": ")) parts.push(t.split(": "));
    else if (t.includes(" - ")) parts.push(t.split(" - "));
    else if (t.includes(" | ")) parts.push(t.split(" | "));
    else if (t.includes(" (")) parts.push(t.split(" ("));
  }
  
  const prefixes = parts.map(p => p[0]);
  const suffixes = parts.map(p => p[1] ? p[1].replace(")", "") : "");
  
  const results = [];
  for (let i = 0; i < prefixes.length; i++) {
    for (let j = 0; j < suffixes.length; j++) {
      if (i !== j && suffixes[j]) {
        results.push(`${prefixes[i]}: ${suffixes[j]}`);
        results.push(`${prefixes[i]} (${suffixes[j]})`);
        results.push(`${prefixes[i]} - ${suffixes[j]}`);
      }
    }
  }
  return results;
}

console.log(recombine(titles).slice(0, 10));

