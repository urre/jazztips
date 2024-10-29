require("dotenv").config({ path: "../.env" });
const axios = require("axios");

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

async function getAlbumCoverUrl(artist, album) {
  const endpoint = "http://ws.audioscrobbler.com/2.0/";

  try {
    const response = await axios.get(endpoint, {
      params: {
        method: "album.getinfo",
        api_key: LASTFM_API_KEY,
        artist: artist,
        album: album,
        format: "json",
      },
    });

    // Extract image URLs
    const images = response.data.album?.image;
    const imageUrl =
      images && images.length > 0
        ? images[images.length - 1]["#text"] // Get the largest image available
        : null;

    return imageUrl;
  } catch (error) {
    console.error("Error fetching album cover:", error.message);
    return null;
  }
}

module.exports = getAlbumCoverUrl;
