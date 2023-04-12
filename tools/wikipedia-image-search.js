// Run like this: node wikipedia-image-search.js miles+davis

const puppeteer = require("puppeteer");
const query = process.argv[2];

console.log(process.argv[2]);

async function searchWikipedia(searchQuery) {
  const endpoint = `https://sv.wikipedia.org/w/api.php?action=opensearch&format=json&formatversion=2&search=${searchQuery}&namespace=0&limit=10`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw Error(response.statusText);
  }
  const json = await response.json();
  return json;
}

(async () => {
  let url = "";

  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  try {
    const results = await searchWikipedia(query);
    url = results[3].toString();
  } catch (err) {
    console.log(err);

    console.log("Failed to search wikipedia");
  }
  // Open login page and login
  await page.goto(url, {
    waitUntil: "load",
    timeout: 1000,
  });

  let content = await page.evaluate(() => {
    let photo = document.querySelector(".image img").src;
    return photo;
  });

  console.log(content);

  browser.close();
})();
