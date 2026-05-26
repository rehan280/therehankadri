
async function testTrends() {
  const url = "https://trends.google.com/trends/api/explore?hl=en-US&tz=420&req=%7B%22comparisonItem%22%3A%5B%7B%22keyword%22%3A%22youtube%22%2C%22geo%22%3A%22%22%2C%22time%22%3A%22today+12-m%22%7D%5D%2C%22category%22%3A0%2C%22property%22%3A%22youtube%22%7D&tz=420";
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text.slice(0, 200));
  } catch (e) {
    console.error(e);
  }
}
testTrends();

