const cheerio = require("cheerio");
const unirest = require("unirest");

async function getRecordLabel(query) {
  console.log(
    "\x1b[32m%s\x1b[0m",
    `Searching record label for ${query} on Google.com...`
  );

  try {
    const result = [];

    const url = `https://www.google.com/search?q=${query}+record+label`;
    const response = await unirest.get(url).headers({
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36",
    });

    const $ = cheerio.load(response.body);

    $(".ifM9O").each((i, el) => {
      result[i] = {
        label: $(el).find(".hgKElc").text(),
      };
    });

    const str = result[0].label;

    return str;

    // const regex = /([A-Za-z\s]+) Records[.”;]*/g;
    // const matches = str.match(regex);

    // return (
    //   matches &&
    //   matches[0]
    //     .replace("through", "")
    //     .replace("by", "")
    //     .replace(".", "")
    //     .trim()
    // );
  } catch (e) {
    console.log(e);
  }
}

module.exports = { getRecordLabel };
