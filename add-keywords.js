const fs = require('fs');
const path = require('path');

const articlesDir = path.join(__dirname, 'public', 'tools', 'articles');
const rootArticle = path.join(__dirname, 'youtube-tag-generator-article.md');

const files = fs.readdirSync(articlesDir)
  .filter(f => f.endsWith('.md'))
  .map(f => path.join(articlesDir, f));

files.push(rootArticle);

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const filename = path.basename(filePath, '.md');
  const keyword = filename.replace(/-/g, ' ');
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  let addedCount = 0;
  const maxAdditions = 2;
  
  // Replace "this tool"
  content = content.replace(/\bthis tool\b/ig, (match) => {
    if (addedCount >= maxAdditions) return match;
    addedCount++;
    return match.charAt(0) === 'T' ? `This ${keyword}` : `this ${keyword}`;
  });
  
  // If not enough, try "the tool"
  content = content.replace(/\bthe tool\b/ig, (match) => {
    if (addedCount >= maxAdditions) return match;
    addedCount++;
    return match.charAt(0) === 'T' ? `The ${keyword}` : `the ${keyword}`;
  });

  // If not enough, try "a free tool" -> "a free {keyword}"
  content = content.replace(/\ba free tool\b/ig, (match) => {
    if (addedCount >= maxAdditions) return match;
    addedCount++;
    return match.charAt(0) === 'A' ? `A free ${keyword}` : `a free ${keyword}`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Processed ${filename}, added ${addedCount} times.`);
}

files.forEach(processFile);
