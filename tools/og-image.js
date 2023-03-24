const fs = require("fs");
const { createCanvas, registerFont, loadImage } = require("canvas");
const fm = require("front-matter");
const cloudinary = require("cloudinary");
const insertLine = require("insert-line");
require("dotenv").config();

// Cloudinary settings, read secrets
cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

// Read args
const myArgs = process.argv.slice(2);
const useFile = myArgs[0];

// Wrap text in canvas
const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
  var words = text.split(" ");
  var line = "";

  for (var n = 0; n < words.length; n++) {
    var testLine = line + words[n] + " ";
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      context.fillText(line, x, y);
      line = words[n] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, y);
};

// Select file
const filename = `./src/pages/${useFile}`;
const fileFrontmatter = fs.readFileSync(filename, "utf8");
const fileData = fm(fileFrontmatter);

if (!fileData.attributes.ogimage) {
  // Load image into the canvas and add text
  loadImage(fileData.attributes.image).then((image) => {
    // Settings
    const width = 1200;
    const height = 630;
    // Set font style and placement
    let fontSize = 64;
    let lineHeight = fontSize * 1.3975;
    let textArtistY = 120;
    let textTitleY = textArtistY + 220;
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    // Fill with white background color
    context.fillStyle = "#e4edeb";
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Add image to canvas
    context.drawImage(image, 40, 50, 600, 600);
    // Use custom font
    registerFont("./tools/Spectral-Light.ttf", {
      family: "Spectral",
    });
    if (fileData.attributes.artist.length > 20) {
      fontSize = 50;
      lineHeight = fontSize * 1.275;
      textArtistY = 140;
      textTitleY = textArtistY + 240;
    } else {
      fontSize = 64;
    }
    context.font = `normal ${fontSize}pt Spectral`;
    context.textAlign = "left";
    context.textBaseline = "top";
    context.fillStyle = "#fff";
    context.fillRect(550, 90, 700, 500);
    // Add text
    context.fillStyle = "#000";
    wrapText(
      context,
      `${fileData.attributes.artist}`,
      640,
      textArtistY,
      510,
      lineHeight
    );
    wrapText(
      context,
      `”${fileData.attributes.title}”`,
      640,
      textTitleY,
      510,
      lineHeight
    );
    // Add Jazztips green circle
    context.fillStyle = "#3d8a69";
    context.beginPath();
    context.arc(1080, 100, 50, 0, 2 * Math.PI);
    context.fill();
    const buffer = canvas.toBuffer("image/jpeg");

    fs.writeFileSync("./temp.jpg", buffer);
    // Upload image to Cloudinary, and add as front matter in markdown file
    const newImage = cloudinary.v2.uploader.upload(
      "./temp.jpg",
      function (error, result) {
        insertLine(`${filename}`)
          .content(`ogimage: ${result.secure_url}`)
          .at(7)
          .then(function (err) {
            console.log(
              `✅ Cloudinary image done and inserted ${result.secure_url}`
            );
          });
      }
    );
  });
} else {
  console.log(`⚠️ ${filename} already has ogimage frontmatter`);
}
