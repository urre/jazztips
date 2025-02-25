#!/usr/bin/env node

import fs from "fs/promises";
import path from "path";
import { getMusicServiceLinks } from "./getMusicServiceLinks.js";

async function main() {
  try {
    const mdFile = process.argv[2];
    if (!mdFile) {
      console.error("Please provide a markdown file name");
      process.exit(1);
    }

    // Construct path to look in src/pages directory
    const fullPath = path.join(process.cwd(), "src", "content", mdFile);

    // Check if file exists
    try {
      await fs.access(fullPath);
    } catch (error) {
      console.error(`File not found: ${mdFile} in src/content directory`);
      process.exit(1);
    }

    // Read the markdown file
    const content = await fs.readFile(fullPath, "utf8");

    // Extract the title and artist from frontmatter
    const titleMatch = content.match(/title:\s*["']?(.+?)["']?\s*$/m);
    const artistMatch = content.match(/artist:\s*["']?(.+?)["']?\s*$/m);

    if (!titleMatch || !artistMatch) {
      console.error("Missing required frontmatter: title or artist");
      process.exit(1);
    }

    const title = titleMatch[1];
    const artist = artistMatch[1];

    // Create search query
    const query = `${title} ${artist}`;
    console.log(`Searching for: ${query}`);

    // Get the links
    const links = await getMusicServiceLinks(query);

    if (!Array.isArray(links)) {
      console.error("Failed to get music service links");
      process.exit(1);
    }

    // Format the links for markdown
    const [spotify, apple, tidal, qobuz] = links;

    // Create the new content
    const newContent = content.replace(
      /(---\s*\n[\s\S]*?\n)---/,
      `$1spotify: ${spotify || ""}\napple: ${apple || ""}\ntidal: ${
        tidal || ""
      }\nqobuz: ${qobuz || ""}\n---`
    );

    // Write the file back
    if (spotify !== "" || tidal !== "") {
      await fs.writeFile(fullPath, newContent);
      console.log("✅ Successfully added music service links!");
    } else {
      console.log("🚩 Didn't update the record since music links was empty");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
