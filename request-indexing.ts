import { google } from "googleapis";
import { toolCatalog } from "./src/lib/tool-catalog";
import * as fs from "fs";
import * as path from "path";

// Configuration
const SITE_URL = "https://therehankadri.com"; 
const KEY_FILE_PATH = path.join(process.cwd(), "service-account.json");

async function requestIndexing() {
  if (!fs.existsSync(KEY_FILE_PATH)) {
    console.error(`\n❌ Error: Service account key not found at ${KEY_FILE_PATH}`);
    console.error("Please download your service-account.json file from Google Cloud Console and place it in the root folder.");
    process.exit(1);
  }

  console.log("🔑 Authenticating with Google...");
  
  const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE_PATH,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });

  const authClient = await auth.getClient();
  const indexing = google.indexing({
    version: "v3",
    auth: authClient as any,
  });

  console.log(`\n🚀 Preparing to request indexing for ${toolCatalog.length} tools...\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < toolCatalog.length; i++) {
    const tool = toolCatalog[i];
    const url = `${SITE_URL}/${tool.slug}`;
    
    try {
      console.log(`[${i + 1}/${toolCatalog.length}] Requesting indexing for: ${url}`);
      
      const response = await indexing.urlNotifications.publish({
        requestBody: {
          url: url,
          type: "URL_UPDATED",
        },
      });
      
      if (response.status === 200) {
        console.log(`   ✅ Success!`);
        successCount++;
      } else {
        console.log(`   ⚠️ Unexpected status: ${response.status}`);
      }
      
      // Add a small delay to avoid hitting rate limits (default quota is 100 requests per minute)
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error: any) {
      console.error(`   ❌ Failed: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n🎉 Indexing Request Complete!`);
  console.log(`   ✅ Successful requests: ${successCount}`);
  console.log(`   ❌ Failed requests: ${errorCount}`);
  if (errorCount > 0) {
    console.log(`\nNote: If you got a 403 error, make sure you added the service account email as an 'Owner' in Google Search Console.`);
  }
}

requestIndexing().catch(console.error);
