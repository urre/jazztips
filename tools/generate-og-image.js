#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const {
    generateImageAndInsertToMarkdown,
    insertOgImageToMarkdown
} = require('./og-image');

async function main() {
    try {
        const mdFile = process.argv[2];
        if (!mdFile) {
            console.error('Please provide a markdown file name');
            process.exit(1);
        }

        // Construct path to look in src/pages directory
        const fullPath = path.join(process.cwd(), 'src', 'pages', mdFile);

        // Check if file exists
        try {
            await fs.access(fullPath);
        } catch (error) {
            console.error(`File not found: ${mdFile} in src/pages directory`);
            process.exit(1);
        }

        // Read the markdown file
        const content = await fs.readFile(fullPath, 'utf8');

        console.log('Content:', content.substring(0, 500)); // Show first 500 chars

        // Extract the title and artist from frontmatter
        const titleMatch = content.match(/title:\s*["']?(.+?)["']?\s*$/m);
        const artistMatch = content.match(/artist:\s*["']?(.+?)["']?\s*$/m);
        const imageMatch = content.match(/image:\s*["']?(.+?)["']?\s*$/m);

        console.log('Matches found:', {
            title: titleMatch,
            artist: artistMatch,
            image: imageMatch
        });

        if (!titleMatch || !artistMatch || !imageMatch) {
            console.error('Missing required frontmatter: title, artist, or image');
            process.exit(1);
        }

        const title = titleMatch[1];
        const artist = artistMatch[1];
        const image = imageMatch[1];

        console.log('Extracted values:', { title, artist, image });

        // Generate the OG image
        const ogImageUrl = await generateImageAndInsertToMarkdown(
            image,
            title,
            artist
        );

        // Insert the ogimage URL into the markdown file
        if (ogImageUrl) {
            await insertOgImageToMarkdown(fullPath, ogImageUrl, 12);
            console.log('Successfully generated and inserted OG image!');
        }

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main(); 