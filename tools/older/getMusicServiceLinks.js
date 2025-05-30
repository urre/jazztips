import * as cheerio from "cheerio";
import unirest from "unirest";

export async function getMusicServiceLinks(query) {
  console.log(
    "\x1b[32m%s\x1b[0m",
    `Searching music service album links for ${query} on Google.com...`
  );

  const musicServices = ["spotify", "apple+music", "tidal", "qobuz"];
  const albumLinks = [];

  try {
    for (let index = 0; index < musicServices.length; index++) {
      const service = musicServices[index];
      const encodedQuery = encodeURIComponent(
        `${query} ${service === "apple+music" ? "apple music" : service} album`
      );
      const url = `https://www.google.com/search?q=${encodedQuery}`;

      console.log(`\n\nSearching for a ${service} link: `);

      const response = await unirest.get(url).headers({
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
      });

      const $ = cheerio.load(response.body);
      let found = false;

      $(".dURPMd div").each((i, el) => {
        console.log("selector: ", $el);
        if (!found) {
          const link = $(el).find("a").attr("href");
          console.log(link);
          if (link) {
            const isServiceLink = link.includes(service.replace("+music", ""));
            if (isServiceLink) {
              albumLinks[index] = link.includes("music.apple")
                ? link.replace("music.apple", "embed.music.apple")
                : link;
              found = true;
              console.log(`Found ${service} link:`, albumLinks[index]);
            }
          }
        }
      });

      if (!found) {
        console.log(`⚠️ No link found for ${service}`);
        albumLinks[index] = "";
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return albumLinks;
  } catch (e) {
    console.error("Error searching for links:", e);
    return Array(musicServices.length).fill("");
  }
}
