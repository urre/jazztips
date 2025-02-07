#!/usr/bin/env node

import fs from "fs-extra";
import fetch from "node-fetch";
import slugify from "slugify";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import dotenv from "dotenv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const parentDir = path.resolve(__dirname, "../");

// Load .env from the parent directory
dotenv.config({ path: path.join(parentDir, ".env") });

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;

if (!LASTFM_API_KEY) {
  console.error(
    "❌ Missing LASTFM_API_KEY! Please set it in .env (parent folder)"
  );
  process.exit(1);
}

// Read CLI arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node new-record.js <artist> <albumname>");
  process.exit(1);
}

const [artist, albumname] = args;
const slug = slugify(albumname, { lower: true });
const outputPath = path.join(parentDir, "src/pages", `${slug}.md`);

// Fetch album details from Last.fm
async function getAlbumDetails() {
  const url = `http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(
    artist
  )}&album=${encodeURIComponent(albumname)}&format=json`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.album;
  } catch (error) {
    console.error("❌ Error fetching album details:", error);
    return null;
  }
}

// Fetch album cover image from Last.fm
// Fetch the largest album cover image from Last.fm
async function getAlbumCover() {
  const albumDetails = await getAlbumDetails();
  return albumDetails?.image?.[albumDetails.image.length - 1]?.["#text"] || "";
}

// Fetch label and year from Last.fm
async function getLabelAndYear() {
  const albumDetails = await getAlbumDetails();
  const label = albumDetails?.label || "Unknown";
  const year = albumDetails?.released
    ? albumDetails.released.split(" ")[0]
    : "Unknown";
  return { label, year };
}

// Generate Credits for musicians (Name + Instrument)
async function getCredits() {
  const albumDetails = await getAlbumDetails();
  const credits = [];
  albumDetails?.artist?.tags?.tag?.forEach((musician) => {
    credits.push({ name: musician.name, instrument: "Unknown" });
  });
  return credits;
}

// Generate Credits for musicians (Name + Instrument) using Ollama (Mistral)
function queryCreditsForAlbum(albumName, artistName) {
  const prompt = `What musicians are playing on the album "${albumName}" by "${artistName}"? List the musicians' names and their instruments in a markdown-friendly format like the following example:
  - name: Drew Gress
    instrument: Double Bass
  - name: Joey Baron
    instrument: Drums
  - name: John Abercrombie
    instrument: Guitar
  - name: Marc Copland
    instrument: Piano
  Please format the output accordingly for "${albumName}" by "${artistName}".`;

  try {
    const result = execSync(`ollama run mistral "${prompt}"`, {
      encoding: "utf8",
    }).trim();
    return result;
  } catch (error) {
    console.error("❌ Error fetching credits from Ollama:", error);
    return "Error generating credits.";
  }
}

// Generate Markdown content using Ollama (Mistral)
function queryOllama(prompt) {
  try {
    return execSync(`ollama run mistral "${prompt}"`, {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    console.error("❌ Error running Ollama:", error);
    return "Error generating markdown.";
  }
}

// Generate Release Year for the album using Ollama
function queryReleaseYearForAlbum(albumName, artistName) {
  const prompt = `What year was the album "${albumName}" by "${artistName}" released? Please provide the release year.`;

  try {
    const result = execSync(`ollama run mistral "${prompt}"`, {
      encoding: "utf8",
    }).trim();
    return result;
  } catch (error) {
    console.error("❌ Error fetching release year from Ollama:", error);
    return "Unknown Year";
  }
}

// Generate Label for the album using Ollama
function queryLabelForAlbum(albumName, artistName) {
  const prompt = `What is the record label name for the album "${albumName}" by "${artistName}"? Please provide the label name. Only include max 2 words.`;

  try {
    const result = execSync(`ollama run mistral "${prompt}"`, {
      encoding: "utf8",
    }).trim();
    return result;
  } catch (error) {
    console.error("❌ Error fetching label from Ollama:", error);
    return "Unknown Label";
  }
}

// Main function
async function generateMarkdown() {
  const coverImage = await getAlbumCover();

  // Fetch year and label using Ollama
  const year = queryReleaseYearForAlbum(albumname, artist);
  const label = queryLabelForAlbum(albumname, artist);

  // Get musician credits from Ollama
  const credits = queryCreditsForAlbum(albumname, artist);

  const prompt = `Generate a markdown file for a jazz album with the following details:

- Artist: ${artist}
- Album: ${albumname}
- Cover image: ${coverImage || "No image available"}
- Layout: ../layouts/Record.astro
- Filename should be ${slug}.md
- Include tags
- Use single qoutes around pubDate like this pubDate: '2005-01-30'
- Include a section for credits with musicians and instruments.
- The content should match this structure:

---
layout: ../layouts/Record.astro
title: ${albumname}
pubDate: ${new Date().toISOString().split("T")[0]}
artist: ${artist}
label: ""
year: ${year}
tags:
  - ${slug}
ogimage: ${coverImage}
image: ${coverImage}
credits:
  ${credits}
---

Now generate this markdown file's full contents, including album information, credits. Don't include backticks in the beginning of the file.`;

  const markdownContent = queryOllama(prompt);

  if (!markdownContent || markdownContent.includes("Error")) {
    console.error("❌ Failed to generate markdown.");
    return;
  }

  await fs.outputFile(outputPath, markdownContent);
  console.log(`✅ Markdown file created: ${outputPath}`);

  try {
    const result = execSync(`code "${outputPath}"`, {
      encoding: "utf8",
    }).trim();
    return result;
  } catch (error) {
    console.error("❌ Error fetching credits from Ollama:", error);
    return "Error generating credits.";
  }
}

// Run script
generateMarkdown();
