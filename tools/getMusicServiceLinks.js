const cheerio = require("cheerio");
const unirest = require("unirest");

async function getMusicServiceLinks(query) {
  console.log(
    "\x1b[32m%s\x1b[0m",
    `Searching music service album links for ${query} on Google.com...`
  );

  const musicServices = ["spotify", "apple+music", "tidal", "qobuz"];
  const albumLinks = [];

  try {
    let links = [];
    for (let index = 0; index < musicServices.length; index++) {
      const url = `https://www.google.com/search?q=${query}+${musicServices[index]}+album`;
      const response = await unirest.get(url).headers({
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
      });

      const $ = cheerio.load(response.body);

      $(".MjjYud").each((i, el) => {
        links[i] = {
          link: $(el).find("a").attr("href"),
        };
      });

      links[0]
        ? (albumLinks[index] = links[0].link.replace(
            "music.apple",
            "embed.music.apple"
          ))
        : (albumLinks[index] = "");
    }

    return albumLinks;
  } catch (e) {
    console.log(e);
  }
}

module.exports = { getMusicServiceLinks };
