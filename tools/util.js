const fs = require("fs");
const slug = require("slug");
const path = require("path");
const cloudinary = require("cloudinary");
require("dotenv").config();

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
const saveMarkdown = async (
  albumTitle,
  artist,
  releasedYear,
  imageUrl,
  spotifyLink,
  appleMusicLink,
  credits
) => {
  const instrumentsToRemove = [
    "Main Personnel",
    "Mixing",
    "Engineer",
    "Mastering",
    "Packaging Manager",
    "Reissue Series",
    "Liner Notes",
    "Artist Coordination",
    "Photography",
    "Project Director",
    "Assistant",
    "undefined",
    "Coordination",
  ];

  const cleanedCredits = credits.filter(
    (credit) => !instrumentsToRemove.includes(credit.instrument)
  );

  const creditstring = cleanedCredits
    .map(
      ({ musician, instrument }) =>
        `\n- name: ${musician}\n  instrument: ${instrument}`
    )
    .join("");

  const dt = new Date();

  const postData = {
    layout: "../layouts/Record.astro",
    title: albumTitle.trim().replace("\n", ""),
    artist: artist.trim().replace("\n", ""),
    label: "",
    year: releasedYear,
    tags: "",
    image: await uploadImagetoCloudinary(imageUrl),
    permalink:
      "/" +
      slug(albumTitle.trim().replace("\n", ""), {
        lower: true,
      }) +
      "/",
    spotify: spotifyLink !== "undefined" ? spotifyLink : "",
    apple: appleMusicLink !== "undefined" ? appleMusicLink : "",
    credits: creditstring,
    pubDate: dt.getFullYear() + "/" + (dt.getMonth() + 1) + "/" + dt.getDate(),
  };

  const filename =
    slug(albumTitle, {
      lower: true,
    }) + ".md";

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
    "\npermalink: " +
    postData.permalink +
    "\nspotify: " +
    postData.spotify +
    "\ncredits: " +
    postData.credits +
    "\n---\n\n";

  // Save as Markdown file
  const filePath = path.join(__dirname, `../src/pages/${filename}`);

  fs.writeFile(filePath, markdown, (err) => {
    if (err) {
      console.error("Error writing file:", err);
    } else {
      console.log(`✔ Saved Markdown file in ./src/pages/${filename}`);
    }
  });
};

module.exports = {
  uploadImagetoCloudinary,
  saveMarkdown,
};
