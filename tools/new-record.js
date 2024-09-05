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
  const searchTerm = encodeURIComponent(args.join(" "));

  console.log(
    "\x1b[32m%s\x1b[0m",
    `Searching ${args.join(" ")} on Allmusic.com...`
  );

  // Launch the browser
  const browser = await puppeteer.launch({ headless: "new" });

  // const browser = await puppeteer.launch({
  //   headless: false,
  //   ignoreHTTPSErrors: true,
  //   args: [`--window-size=1920,1080`],
  //   defaultViewport: {
  //     width: 1920,
  //     height: 1080,
  //   },
  // });

  const page = await browser.newPage();

  // First search for the album
  await page.goto(`https://www.allmusic.com/search/all/${searchTerm}`, {
    waitUntil: "networkidle2",
  });

  // Consent cookies
  await page.locator(".fc-cta-consent").click();

  // Scrape first album link
  const albumLink = await page.$eval(
    "#scrollGridContainer > div.album > .info > .title a",
    (el) => el.href
  );

  await page.goto(`${albumLink}`, {
    waitUntil: "networkidle2",
  });

  // Scrape album title
  const albumTitle = await page.$eval("h1#albumTitle", (el) =>
    el.textContent.trim()
  );

  // Scrape artist name
  const artist = await page.$eval("#albumArtists", (el) =>
    el.textContent.trim()
  );

  // Scrape release year
  const releasedYear = await page.$eval(
    "div.release-date > span",
    (el) => el.textContent.split(",")[1]
  );

  // Scrape album image URL
  const imageUrl = await page.$eval("#albumCover img", (img) => img.src);

  // Spotify
  let spotifySelector = await page.$("#streamBtnContainer a:nth-child(2)");

  let spotifyLinkContents = spotifySelector
    ? await page.evaluate((el) => el.href, spotifySelector)
    : "";

  spotifyLink = spotifyLinkContents.includes("spotify")
    ? spotifyLinkContents
    : "";

  // Apple Music
  let appleMusicSelector = await page.$("#streamBtnContainer a:nth-child(3)");

  let appleMusicLink = appleMusicSelector
    ? await page.evaluate((el) => el.href, appleMusicSelector)
    : "";

  // Scrape credits, musicians, and instruments
  // Click on the credits tab to load the credits section

  await page.locator("#creditsTab h2").click();

  // Wait for the credits table to be loaded
  await page.waitForSelector("#credits");

  // Scrape credits, musicians, and instruments from the credits table
  const credits = await page.$$eval("#credits tr", (rows) =>
    rows.map((row) => {
      const musician = row
        .querySelector("td.singleCredit span.artist")
        ?.textContent.trim();
      const instrument = row
        .querySelector("td.singleCredit span.artistCredits")
        ?.textContent.trim();
      return { musician, instrument };
    })
  );

  // Save Markdown file
  saveMarkdown(
    albumTitle,
    artist,
    releasedYear,
    imageUrl,
    spotifyLink,
    appleMusicLink,
    credits
  );

  // Close the browser
  await browser.close();
})();
