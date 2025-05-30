const fs = require("fs");
const slug = require("slug");
const path = require("path");
const cloudinary = require("cloudinary");
require("dotenv").config();
const { getMusicServiceLinks } = require("./older/getMusicServiceLinks");
const { getRecordLabel } = require("./older/getRecordLabel");
const { generateImageAndInsertToMarkdown } = require("./older/og-image");

// Cloudinary settings, read secrets
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

// Upload image to Cloudinary
const uploadImagetoCloudinary = async (url) => {
  try {
    const media = url.replace("f=4", "f=6");
    const result = await cloudinary.uploader.upload(media);
    return result.secure_url;
  } catch (err) {
    console.log(err);
    return console.log("Image could not be uploaded to Cloudinary");
  }
};

// Save as markdown
const saveMarkdown = async (albumTitle, artist, releasedYear, credits) => {
  const productionPersonelTitles = [
    "Main Personnel",
    "Mixing",
    "Engineer",
    "Engineering, Mixing",
    "Mastering",
    "Packaging Manager",
    "Reissue Series",
    "Liner Notes",
    "Artist Coordination",
    "Photography",
    "Project Director",
    "Assistant",
    "Producer",
    "Art Direction",
    "Mixing",
    "Surround Sound",
    "undefined",
    "Graphic Design",
    "Design",
    "Executive Producer, Producer",
    "Coordination",
    "Art Direction Design",
  ];

  const creditstring = credits
    .filter(({ musician, instrument }) => musician !== undefined)
    .filter(
      ({ musician, instrument }) =>
        !productionPersonelTitles.includes(instrument)
    )
    .map(
      ({ musician, instrument }) =>
        `\n- name: ${musician}\n  instrument: ${instrument}`
    )
    .join("");

  const dt = new Date();

  const musicServiceLinks = await getMusicServiceLinks(
    `${artist} ${albumTitle}`
  );

  const filename =
    slug(albumTitle, {
      lower: true,
    }) + ".md";

  // Specify Markdown file path
  const filePath = path.join(__dirname, `../src/pages/${filename}`);

  // Get record cover image URL from LastFM API
  const getAlbumCoverUrl = require("./record-cover");
  const coverUrl = await getAlbumCoverUrl(
    artist.trim().replace("\n", ""),
    albumTitle.trim().replace("\n", "")
  );

  const postData = {
    layout: "../layouts/Record.astro",
    title: albumTitle.trim().replace("\n", ""),
    artist: artist.trim().replace("\n", ""),
    label: await getRecordLabel(`${artist} ${albumTitle}`),
    year: releasedYear,
    tags: "",
    image: await uploadImagetoCloudinary(coverUrl),
    ogimage: await generateImageAndInsertToMarkdown(
      coverUrl,
      artist,
      albumTitle
    ),
    permalink:
      "/" +
      slug(albumTitle.trim().replace("\n", ""), {
        lower: true,
      }) +
      "/",
    spotify: musicServiceLinks[0],
    apple: musicServiceLinks[1],
    tidal: musicServiceLinks[2],
    qobuz: musicServiceLinks[3],
    credits: creditstring,
    pubDate: dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate(),
  };

  // Prepare Markdown
  const markdown =
    "---\nlayout: " +
    postData.layout +
    "\ntitle: " +
    postData.title +
    "\npubDate: " +
    postData.pubDate +
    "\nartist: " +
    postData.artist +
    "\nlabel: " +
    postData.label +
    "\nyear: " +
    postData.year +
    "\ntags: " +
    "\n  - " +
    artist.trim().replace("\n", "").split(" ")[1].toLowerCase() +
    "\nimage: " +
    postData.image +
    "\nogimage: " +
    postData.ogimage +
    "\n
    postData.permalink +
    "\nspotify: " +
    postData.spotify +
    "\napple: " +
    postData.apple +
    "\ntidal: " +
    postData.tidal +
    "\nqobuz: " +
    postData.qobuz +
    "\ncredits: " +
    postData.credits +
    "\n---\n\n";

  fs.writeFile(filePath, markdown, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log(`✔ Saved Markdown file in ./src/pages/${filename}`);
      process.exit(0);
    }
  });
};

module.exports = {
  uploadImagetoCloudinary,
  saveMarkdown,
};
