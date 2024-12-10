const sharp = require("sharp");
const axios = require("axios");
const cloudinary = require("cloudinary").v2;
const fs = require("fs").promises;

const insertLine = require("insert-line");
require("dotenv").config({ path: ".env" });

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.APIKEY,
  api_secret: process.env.APISECRET,
});

// Image dimensions
const mainImageWidth = 1200;
const mainImageHeight = 630;

// const fontPath = "./Spectral-Light.ttf";

// Function to download image from URL
async function downloadImage(url) {
  const response = await axios({
    url,
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data, "binary");
}

// Function to escape XML special characters
function escapeXml(unsafe) {
  return unsafe.replace(/[&<>"']/g, function (c) {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      case "'": return '&apos;';
      default: return c;
    }
  });
}

// Function to generate SVG with text for Sharp to composite
function generateTextSVG(heading, description) {
  const safeHeading = escapeXml(heading);
  const safeDescription = escapeXml(description);

  return `
    <svg width="${mainImageWidth}" height="${mainImageHeight}" viewBox="0 0 1200 630">
      <style>
        .heading { font-size: 84px; fill: black; font-family: serif; font-weight: normal; line-height: 1; }
        .description { font-size: 48px; fill: black; font-family: serif; }
      </style>
      <text x="550" y="250" class="heading" width="550" height="200">
        ${safeHeading}
      </text>
      <text x="550" y="400" class="description">&#8220;${safeDescription}&#8221;</text>
    </svg>
  `;
}

// Function to upload image to Cloudinary
async function uploadToCloudinary(imageBuffer) {
  try {
    const result = await cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        format: "jpg",
      },
      (error, result) => {
        if (error) {
          throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
        return result;
      }
    );

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.url);
          }
        }
      );
      sharp(imageBuffer).pipe(uploadStream);
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

// Function to insert ogimage into a Markdown file
async function insertOgImageToMarkdown(mdFilePath, imageUrl, lineNumber = 1) {
  try {
    await insertLine(mdFilePath).content(`ogimage: ${imageUrl}`).at(lineNumber);
    console.log(
      `Inserted og:image: ${imageUrl} at line ${lineNumber} in ${mdFilePath}`
    );
  } catch (error) {
    console.error("Error inserting into Markdown file:", error);
    throw error;
  }
}

// Main function to create the image, upload to Cloudinary, and update Markdown
async function generateImageAndInsertToMarkdown(
  imageUrl,
  heading,
  description
) {
  try {
    // Step 1: Download the image from the URL
    const imageBuffer = await downloadImage(imageUrl);

    // Step 2: Resize the image to 400x400px
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(400, 400)
      .toBuffer();

    // Function to generate SVG with a red circle
    function generateCircleSVG(diameter, color) {
      return `
    <svg width="${diameter}" height="${diameter}" xmlns="http://www.w3.org/2000/svg" >
      <circle cx="${diameter / 2}" cy="${diameter / 2}" r="${diameter / 2
        }" fill="${color}" />
    </svg>
  `;
    }

    const circleSVG = generateCircleSVG(100, "seagreen");

    const finalImageBuffer = await sharp({
      create: {
        width: mainImageWidth,
        height: mainImageHeight,
        channels: 3,
        background: { r: 228, g: 237, b: 236 },
      },
    })
      .composite([
        { input: Buffer.from(circleSVG), top: 70, left: 1020 },
        { input: resizedImageBuffer, top: 115, left: 100 },
        {
          input: Buffer.from(generateTextSVG(heading, description)),
          top: 0,
          left: 0,
        },
      ])
      .jpeg()
      .toBuffer();

    // await fs.writeFile("output-image.jpg", finalImageBuffer);
    const uploadedImageUrl = await uploadToCloudinary(finalImageBuffer);

    return uploadedImageUrl;
  } catch (error) {
    console.error("Error during image generation or markdown update:", error);
  }
}

// Export both functions
module.exports = {
  generateImageAndInsertToMarkdown,
  insertOgImageToMarkdown
};
