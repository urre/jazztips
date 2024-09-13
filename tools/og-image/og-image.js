/*

Usage:

Run like this from the root:

 docker run -it --env-file .env -v $(pwd):/opt/node/js -v $(pwd)/src:/opt/node/src my-node-app:latest ./tools/og-image/og-image.js sonny-rollins-and-the-contemporary-leaders.md


*/

const fs = require("fs");
const { createCanvas, registerFont, loadImage } = require("canvas");
const fm = require("front-matter");
const insertLine = require("insert-line");
require("dotenv").config();
const cloudinary = require("cloudinary").v2;
let tempImage = "./temp.jpg";

async function uploadImage(imagePath) {
  cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.APIKEY,
    api_secret: process.env.APISECRET,
  });

  try {
    const result = await cloudinary.uploader.upload(imagePath);
    console.log(`✅ Image uploaded successfully: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error("❌ Error uploading image:", error.message);
    throw error;
  }
}

async function insertImageUrlInMarkdown(filename, imageUrl, lineNumber = 7) {
  try {
    await insertLine(filename).content(`ogimage: ${imageUrl}`).at(lineNumber);
    console.log(`✅ Image URL inserted into ${filename} at line ${lineNumber}`);

    fs.unlink(tempImage, (err) => {
      if (err) {
        console.error("Error deleting the image:", err);
        return;
      }
      console.log("✅ Deleted temp.jpg successfully!");
    });
  } catch (error) {
    console.error("❌ Error inserting image URL:", error.message);
    throw error;
  }
}

async function init() {
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
    // Load image into the canvas and add text (artist, title)
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
      if (
        fileData.attributes.artist.length > 20 ||
        fileData.attributes.title.length > 20
      ) {
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
        `${fileData.attributes.title}`,
        600,
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

      fs.writeFileSync(tempImage, buffer);
    });

    const imageUrl = await uploadImage(tempImage);
    await insertImageUrlInMarkdown(filename, imageUrl);
  } else {
    console.log(`⚠️ ${filename} already has ogimage frontmatter`);
  }
}

init();
