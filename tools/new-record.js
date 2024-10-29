const puppeteer = require("puppeteer");
const cloudinary = require("cloudinary");
require("dotenv").config();
const { saveMarkdown } = require("./util");

// Cloudinary settings, read secrets
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

(async () => {
  const args = process.argv.slice(2);
  const searchTerm = encodeURIComponent(args.join("+"));

  console.log("\x1b[32m%s\x1b[0m", `Searching ${args.join(" ")} on Discogs...`);

  // Launch the browser
  // const browser = await puppeteer.launch({ headless: "new" });
  const browser = await puppeteer.launch({
    headless: false,
    ignoreHTTPSErrors: true,
    args: [`--window-size=1920,1080`],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();

  // First search for the album
  await page.goto(`https://www.discogs.com/search?q=${searchTerm}`, {
    waitUntil: "networkidle2",
  });

  // Consent cookies
  await page.waitForSelector("#onetrust-accept-btn-handler", {
    visible: true,
    timeout: 5000,
  });
  await page.click("#onetrust-accept-btn-handler");

  // Scrape first album link
  const albumLink = await page.$eval(
    "#search_results > li:nth-child(1) > a",
    (el) => el.href
  );

  await page.goto(`${albumLink}`, {
    waitUntil: "networkidle2",
  });

  // Scrape album title
  const albumTitle = await page.$eval(
    "#page h1",
    (el) => el.textContent.split("–")[1]
  );

  // Scrape artist name
  const artist = await page.$eval(
    "#page h1",
    (el) => el.textContent.split("–")[0]
  );

  let releasedYearSelector = await page.$(
    "#page > div.content_3oPo5 > div:nth-child(2) > div > div.info_23nnx > table > tbody > tr:nth-child(4) > td > a > time"
  );

  let releasedYear = releasedYearSelector
    ? await page.evaluate(
        (el) => el.textContent.split(",")[1].trim(),
        releasedYearSelector
      )
    : "";

  // // Scrape album image URL
  // const imageUrl = await page.$eval(
  //   "#page > div.content_3oPo5 > div:nth-child(2) > div > div.thumbnail_1RxJB > div > a > div > picture > img",
  //   (img) => img.src
  // );

  // Scrape credits, musicians, and instruments from the credits table
  const credits = await page.$$eval("#release-credits > div > ul li", (rows) =>
    rows.map((row) => {
      const musician = row.querySelector("span.link_15cpV")?.textContent.trim();
      const instrument = row
        .querySelector("span.role_2ga14")
        ?.textContent.trim();
      return { musician, instrument };
    })
  );

  // Save Markdown file
  saveMarkdown(albumTitle, artist, releasedYear, credits);

  // Close the browser
  await browser.close();
})();
