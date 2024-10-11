const { getMusicServiceLinks } = require("./getMusicServiceLinks");
const { getRecordLabel } = require("./getRecordLabel");

async function getLinks() {
  const args = process.argv.slice(2);
  // const links = await getMusicServiceLinks(`${args}`);
  const label = await getRecordLabel(`${args}`);
  console.log(label);
  // console.log(links);
}

getLinks();
