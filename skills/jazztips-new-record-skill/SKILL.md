---
name: jazztips-new-record-skill
description: "Create comprehensive album entries for a jazz music blog with automatic metadata fetching, streaming links, and proper frontmatter formatting"
---

# JazzTips New Record Entry

This skill helps you create complete, well-formatted album entries for a jazz music blog built with Astro. It handles metadata fetching, streaming link retrieval, and ensures consistent formatting across all entries.

## When to Use This Skill

Use this skill when you need to:

- Add a new album entry to the JazzTips music blog
- Create comprehensive album documentation with proper metadata
- Fetch album artwork and streaming links automatically
- Ensure consistent frontmatter structure across blog entries
- Generate properly formatted Markdown content files

## Prerequisites

- The JazzTips Astro site must be available at the workspace
- Webhook endpoints for album metadata must be accessible at `http://192.168.86.47:5678`
- Content files are stored in `src/content/` directory
- Node.js and npm should be available for optional helper scripts

## How to Create a New Album Entry

### Step 1: Fetch Album Metadata Using Webhooks

**REQUIRED**: Execute the following webhook calls to gather metadata before creating the file.

#### Get Album Cover Image

Execute this command to retrieve the album cover image URL:

```bash
curl -sS -X POST "http://192.168.86.47:5678/webhook/album-art" \
  -H "Content-Type: application/json" \
  -d '{"artist":"[Artist Name]","album":"[Album Title]"}'
```

**Example response**:
```json
{"image":"https://cdn.shopify.com/s/files/1/0613/3493/products/blue-train-5269591f6c6d5_1024x1024.jpg?v=1446154827"}
```

Extract the image URL from the response and use it for the `image:` field in the frontmatter. Always verify the image is correct and high quality.

#### Get Streaming Links

Execute this command to retrieve streaming platform links:

```bash
curl -sS -X POST "http://192.168.86.47:5678/webhook/streaming-links" \
  -H "Content-Type: application/json" \
  -d '{"artist":"[Artist Name]","album":"[Album Title]"}'
```

**Example response**:
```
tidal: https://tidal.com/album/58990510
apple: https://music.apple.com/us/album/ok-computer/1097861387
spotify: https://open.spotify.com/album/6dVIqQ8qmQ5GBnJ9shOYGE
qobuz: https://www.qobuz.com/us-en/album/ok-computer-radiohead/0634904078164
```

**Important Notes**:
- **YOU MUST execute both webhook commands above** before creating the file
- Always verify links by checking them
- If a platform doesn't have the album, omit that field entirely
- The webhook may not find all platforms - manually search if needed
- For Apple links must have the `embed` word in the URL like `https://embed.music.apple.com...`
- For Tidal use the format `https://tidal.com/browse/album/...`

### Step 2: Research Additional Metadata

After fetching image and streaming links, gather:

- **Artist name** (exact spelling and capitalization)
- **Album title** (exact spelling and capitalization)
- **Record label** (official label name)
- **Release year** (as a number)
- **Complete credits** with musician names and instruments
- **Specific descriptive tags** (instruments, styles, locations, key musicians)

### Step 3: Create the Markdown File

1. **Generate filename**: Convert album title to lowercase kebab-case
   - Example: "Chapter One" → `chapter-one.md`
   - Example: "Blue Train" → `blue-train.md`

2. **Create file at**: `src/content/[filename].md`

3. **Set pubDate**: Use today's date in YYYY-MM-DD format

4. **Use the metadata**: Include the image URL and streaming links obtained from the webhooks in Step 1

### Step 4: Format the Frontmatter

Structure the YAML frontmatter following this exact template:

```yaml
---
layout: ../layouts/Record.astro
title: [Album Title - exact capitalization]
pubDate: [YYYY-MM-DD]
artist: [Artist Name - exact capitalization]
label: [Record Label]
year: [Release Year as number]
tags:
  - [specific tag 1]
  - [specific tag 2]
  - [artist surname lowercase]
  - [location/scene if relevant]
permalink: https://jazztips.se/[kebab-case-filename]/
spotify: [Spotify album URL]
tidal: [Tidal album URL]
image: [Album cover image URL]
apple: [Apple Music embed URL]
qobuz: [Qobuz album URL]
credits:
  - name: [Musician Name]
    instrument: [Instrument]
  - name: [Musician Name]
    instrument: [Instrument]
---
```

## Important Guidelines

### Tags
- Use specific, descriptive tags only (instruments, sub-genres, key musicians, locations)
- **NEVER use generic "jazz" tag**
- Examples: `piano`, `trio`, `bebop`, `nyc`, `coltrane`, `blue-note`

### Dates
- Use ISO format (YYYY-MM-DD) for pubDate
- Example: `2026-02-15`

### Filenames
- Always use lowercase kebab-case
- No special characters except hyphens
- Remove apostrophes, quotes, and other punctuation
- Example: "Coltrane's Sound" → `coltranes-sound.md`

### Credits
- List all musicians with their specific instruments
- Use proper capitalization for names
- Be specific with instruments (e.g., "Tenor Saxophone" not just "Saxophone")

### Links
- Verify all streaming links are valid and point to the correct album
- Check each link manually before saving
- If a platform isn't available, omit the field entirely

### Images
- Prefer official album artwork from reliable sources
- Verify the image URL is accessible
- Ensure high quality images suitable for display

## Example Output

Here's a complete example of a properly formatted album entry:

```markdown
---
layout: ../layouts/Record.astro
title: Chapter One
pubDate: 2026-01-05
artist: Caelan Cardello
label: Jazz Bird
year: 2025
tags:
  - piano
  - trio
  - cardello
  - nyc
permalink: https://jazztips.se/chapter-one/
spotify: https://open.spotify.com/album/2lblGX2zuKX7kdr8jU3ruq?si=gUPfjQf6S9eTFq5qck46Ig
tidal: https://tidal.com/browse/album/425663129/
image: https://jazzviews.net/wp-content/uploads/2025/08/CaelanC.jpg
apple: https://embed.music.apple.com/us/album/chapter-one/1803831507
qobuz: https://www.qobuz.com/fr-fr/album/chapter-one-caelan-cardello/f91txn84ia1nc
credits:
  - name: Caelan Cardello
    instrument: Piano
  - name: Jonathon Muir-Cotton
    instrument: Bass
  - name: Domo Branch
    instrument: Drums
  - name: Chris Lewis
    instrument: Tenor Saxophone
---
```

## Validation Checklist

Before completing the task, verify:

- [ ] Both webhook commands have been executed successfully
- [ ] All required frontmatter fields are present
- [ ] Filename matches album title in kebab-case
- [ ] pubDate is set to today's date
- [ ] Tags are specific and descriptive (no "jazz" tag)
- [ ] All streaming links are valid and verified
- [ ] Credits list is complete with instruments
- [ ] Image URL returns a valid album cover
- [ ] permalink uses the correct kebab-case filename
- [ ] Apple Music link uses the `embed.music.apple.com` domain
- [ ] Tidal link uses the `tidal.com/browse/album/` format

## Workflow Summary

1. **Execute webhook** for album artwork
2. **Execute webhook** for streaming links
3. **Research** remaining metadata (label, year, credits)
4. **Generate** kebab-case filename from album title
5. **Create** markdown file in `src/content/`
6. **Format** frontmatter with all collected data
7. **Verify** all links and metadata
8. **Optionally run** `npm run ogimage` for social media images

## Troubleshooting

**Webhook not responding?**
- Verify the webhook service is running at `http://192.168.86.47:5678`
- Check your network connection
- Ensure the artist and album names are spelled correctly

**Streaming links not found?**
- Manually search on each platform
- Some albums may not be available on all platforms
- Older or obscure releases may require direct platform searches

**Image URL not working?**
- Find alternative album artwork sources
- Check AllMusic, Discogs, or official label websites
- Ensure the URL is directly serving an image (not an HTML page)
