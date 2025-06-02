import { fetchStreamingLinks } from "./fetchStreamingLinks";

const args = process.argv.slice(2);
const artist = args[0];
const album = args[1];

// Check if both artist and album are provided
if (!artist || !album) {
	console.error("Usage: node script.js \"artist name\" \"album name\"");
	process.exit(1);
}

const links = await fetchStreamingLinks(artist, album);

console.log(links);
