const { generateImageAndInsertToMarkdown } = require("./og-image.js");
const getAlbumCoverUrl = require("./record-cover");

// const test = async () => {
//   const image = await generateImageAndInsertToMarkdown(
//     "https://res.cloudinary.com/urre/image/upload/v1729496916/hpxzcjjqnxrxbyeh40zr.jpg",
//     "Belmondo Big Band / Christophe dal Sasso",
//     "John Coltrane: A Love Supreme"
//   );
//   return image;
// };

// test();

// Get record cover image URL from LastFM API
const test = async () => {
  const coverUrl = await getAlbumCoverUrl("Sonny Rollins", "The Bridge");
  return coverUrl;
};

// Wrap in an async IIFE to await test()
(async () => {
  console.log(await test());
})();
