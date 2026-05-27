const fs = require('fs');
const path = require('path');

const contentFile = 'C:\\Users\\youte\\Downloads\\tool-pages-content.md';
const outputDir = path.join(__dirname, '..', 'public', 'tools', 'articles');

// Mapping of slug from doc to filename in the filesystem
const slugToFileMap = {
  'youtube-video-ideas-generator': 'youtube-video-ideas-generator.md',
  'youtube-hashtags-generator': 'youtube-hashtags-generator.md',
  'youtube-hashtags-extractor': 'youtube-hashtags-extractor.md',
  'youtube-keyword-generator': 'youtube-keywords-generator.md', // handles singular/plural diff
  'youtube-title-generator': 'youtube-title-generator.md',
  'youtube-video-description-copy': 'youtube-video-description-copy.md',
  'youtube-channel-keywords-copy': 'youtube-channel-keywords-copy.md',
  'youtube-channel-name-generator': 'youtube-channel-name-generator.md',
  'youtube-top-100-channels': 'youtube-top-100.md', // mapping
  'youtube-money-calculator': 'youtube-money-calculator.md',
  'youtube-banner-downloader': 'youtube-banner-downloader.md',
  'youtube-thumbnail-downloader': 'youtube-thumbnail-downloader.md',
  'youtube-comment-picker': 'youtube-comment-picker.md',
  'youtube-channel-id-finder': 'youtube-channel-id-finder.md',
  'youtube-subscribe-link-generator': 'youtube-subscribe-link-generator.md',
  'youtube-video-embedder': 'youtube-embedder.md', // mapping
  'youtube-channel-search': 'youtube-channel-search.md',
  'youtube-playlist-length-calculator': 'youtube-playlist-length-calculator.md',
  'youtube-playlist-to-text': 'youtube-playlist-to-text-converter.md', // mapping
  'youtube-data-viewer': 'youtube-data-viewer.md',
  'youtube-category-checker': 'youtube-category-checker.md',
  'podcast-title-generator': 'podcast-title-generator.md',
  'podcast-title-checker': 'podcast-title-checker.md',
};

const text = fs.readFileSync(contentFile, 'utf8');
const sections = text.split(/(?=# \d+\. )/);

let updatedCount = 0;

sections.forEach(section => {
  if (!section.startsWith('# ')) return;
  
  const slugMatch = section.match(/\*\*URL slug:\*\*\s*\/tools\/([^\s\*]+)/);
  if (!slugMatch) return;
  
  const slug = slugMatch[1].trim();
  const filename = slugToFileMap[slug] || `${slug}.md`;
  
  // Find the separator '---' after the metadata
  const parts = section.split('\n---\n');
  if (parts.length < 2) return;
  
  // The first part is title + meta info
  // The rest is the content
  const content = parts.slice(1).join('\n---\n').trim();
  
  if (content) {
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filename}`);
    updatedCount++;
  }
});

console.log(`Total files updated: ${updatedCount}`);
