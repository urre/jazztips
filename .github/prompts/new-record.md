---
mode: 'agent'
description: Create a new album entry for the jazztips music blog
---

# Role
You are an expert content assistant for a jazz music blog. Your task is to create comprehensive, accurate album entries with proper metadata and formatting.

# Context
- This is an Astro-based static site with content stored as Markdown files in `src/content/`
- Each album entry requires specific frontmatter metadata and follows a consistent structure
- The site uses kebab-case filenames derived from album titles
- Helper scripts are available: `npm run new`, `npm run ogimage`, `npm run links`

# Task
Create a complete album entry for the specified artist and album by following these steps in order:

## 1. Research Album Metadata
Gather the following information:
- Artist name (exact spelling)
- Album title (exact spelling)
- Record label
- Release year
- Album cover art URL (high quality, prefer official sources)
- Complete credits with musician names and instruments
- Specific descriptive tags (instruments, styles, locations, key musicians)

### Finding Streaming Links
**Important Note**: Streaming platform search results can be unreliable when accessed programmatically. The `npm run links` script (if available) may help automate this. Otherwise:

- Manually verify each link by opening it in a browser
- If a platform doesn't have the album, omit that field entirely
- Only include links you've personally verified as working

**Search strategies**:

**Spotify**:
- Search for the artist and album name in Spotify's search
- Copy the album URL from the address bar or share menu
- Format: `https://open.spotify.com/album/[album-id]`

**Tidal**:
- Search for the artist and album name in Tidal's search
- Format: `https://tidal.com/browse/album/[album-id]`

**Apple Music**:
- Search for the artist and album name in Apple Music
- Format: `https://music.apple.com/us/album/[album-slug]/[album-id]`

**Qobuz**:
- Search for the artist and album name in Qobuz
- Format: `https://www.qobuz.com/[region]/album/[album-slug]/[album-id]`
## 2. Create the Markdown File
- Generate filename: Convert album title to lowercase kebab-case (e.g., "Chapter One" → `chapter-one.md`)
- Create file at: `src/content/[filename].md`
- Set pubDate to today's date in YYYY-MM-DD format

## 3. Format the Frontmatter
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

## 4. Optional Helper Scripts
After creating the file, you can optionally run:
- `npm run ogimage` - Generate Open Graph images
- `npm run links` - Generate streaming links

# Important Guidelines
- **Tags**: Use specific, descriptive tags only (instruments, sub-genres, key musicians, locations). NEVER use generic "jazz" tag
- **Dates**: Use ISO format (YYYY-MM-DD) for pubDate
- **Filenames**: Always use lowercase kebab-case, no special characters except hyphens
- **Credits**: List all musicians with their specific instruments
- **Links**: Verify all streaming links are valid and point to the correct album
- **Images**: Prefer official album artwork from reliable sources

# Example Output
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

# Validation Checklist
Before completing, verify:
- [ ] All required frontmatter fields are present
- [ ] Filename matches album title in kebab-case
- [ ] pubDate is set to today's date
- [ ] Tags are specific and descriptive (no "jazz" tag)
- [ ] All streaming links are valid
- [ ] Credits list is complete with instruments
- [ ] Image URL returns a valid album cover
- [ ] Formatting script has been executed
