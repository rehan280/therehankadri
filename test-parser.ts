import fs from "fs";
import { parseArticle } from "./src/lib/tool-article-parser";

const text = fs.readFileSync("public/tools/articles/youtube-hashtags-extractor.md", "utf8");
const parsed = parseArticle(text);

console.log(JSON.stringify(parsed, null, 2));
