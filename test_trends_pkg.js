
const googleTrends = require("google-trends-api");
googleTrends.relatedQueries({keyword: "how to download kaise", property: "youtube"})
.then((res) => {
  console.log("Success:", JSON.parse(res).default.rankedList[0].rankedKeyword.slice(0, 5));
})
.catch((err) => {
  console.log("Error:", err.message);
});

