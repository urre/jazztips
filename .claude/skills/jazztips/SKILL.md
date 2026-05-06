---
name: jazztips
description: Create a Jazztips record markdown file from "Artist - Album" input. Searches the web for album metadata, cover art, and streaming links (Spotify/Tidal/Apple/Qobuz), generates Astro frontmatter, writes the file under src/content/, and commits & pushes. Triggers on /jazztips or requests like "add Artist - Album to jazztips".
user_invocable: true
---

# Jazztips Record Creator

Replaces the n8n "Jazztips Record Creator Agent" workflow. Given `Artist - Album`, produce one markdown file under `src/content/<slug>.md` in this repo and push it to `origin`.

## Configuration

This skill is meant to be invoked from the root of the jazztips-astro repo. It operates on `$CLAUDE_PROJECT_DIR` directly — no separate repo path needed.

```
BRANCH: main
```

Before doing anything, sanity-check the working tree:
- `$CLAUDE_PROJECT_DIR` must contain `src/content/` (verify with `ls "$CLAUDE_PROJECT_DIR/src/content"`).
- The repo must be on `BRANCH` with a clean working tree. If not, stop and ask the user.

## Inputs

User supplies `Artist - Album` (free text). Examples:
- `Nils Landgren - Love of My Life`
- `John Coltrane - A Love Supreme`

## Workflow

### Step 1 — Gather metadata (one WebSearch)

Search: `<Artist> <Album> album credits musicians label discogs allmusic`

From the results, extract (set any missing field to `null`, never omit):

- `release_date` — `YYYY-MM-DD` if available, else `YYYY`
- `description` — 2–4 paragraph **neutral, factual** summary. No opinions.
- `tags` — genres only, e.g. `["Jazz", "Post-Bop"]`. **Never** include years.
- `credits` — array of `{name, role}` for **principal musicians and their instruments only**.
  - **Exclude:** Recording Engineer, Mixing Engineer, Producer, Cover Design, Cover Photo, Arranger, Artwork.
- `label` — record label
- `producers` — array of producer names (separate from credits)
- `source_urls` — at least 2 URLs you actually used (Discogs, AllMusic, Wikipedia, Bandcamp, official label pages preferred)

If WebSearch is rate-limited or returns nothing useful, fall back to WebFetch on a known source (e.g. `https://www.discogs.com/search/?q=<artist>+<album>&type=release`).

### Step 2 — Cover art (one WebSearch)

Search: `<Artist> <Album> album cover art`

Pick the first direct image URL (`.jpg`/`.jpeg`/`.png`/`.webp`) from a reputable source. Prefer Discogs, Bandcamp, label sites, Wikipedia. This becomes `cover_image_url`.

### Step 3 — Streaming links (four WebSearches, one per platform)

Run these in parallel:

| Platform | Query | Required URL shape |
|---|---|---|
| Spotify | `<artist> <album> spotify` | `https://open.spotify.com/album/<id>` |
| Tidal   | `<artist> <album> tidal`   | `https://tidal.com/browse/album/<numeric-id>` |
| Apple   | `<artist> <album> apple music` | `https://embed.music.apple.com/<cc>/album/<slug>/<id>` |
| Qobuz   | `<artist> <album> qobuz`   | `https://www.qobuz.com/<region>/album/<slug>/<id>` |

**Pick the best URL per platform** using this scoring (ported from the n8n `Extract Link` node):

1. Domain must match (`open.spotify.com`, `tidal.com`, `music.apple.com`/`embed.music.apple.com`, `qobuz.com`). Otherwise discard.
2. **+100** if the path is `/album/...` (or `/browse/album/...` for Tidal).
3. **−40** if it's an `/artist/` page.
4. **−20** if it's a `/track/` or `/song/` page.
5. **−60** if it's a `/search` page.
6. **+20** if the result title/snippet contains the artist name; **+30** if it contains the album name.
7. Tiebreaker: prefer URL length < 120 chars.

If no candidate scores positively, set that platform to `null`. **Do not** return search/artist/track URLs as a fallback.

URL **normalization** (the build script handles this; do not pre-normalize):
- Tidal `…/album/<id>` → `https://tidal.com/browse/album/<id>`
- Apple `music.apple.com` → `embed.music.apple.com`

### Step 4 — Build the markdown

Assemble a single JSON object matching this schema:

```json
{
  "title": "Artist - Album",
  "artist": "Artist Name",
  "album": "Album Name",
  "release_date": "YYYY-MM-DD",
  "description": "...",
  "tags": ["Jazz"],
  "credits": [{"name": "...", "role": "..."}],
  "label": "...",
  "producers": ["..."],
  "cover_image_url": "https://...",
  "spotify": "https://open.spotify.com/album/...",
  "tidal": "https://tidal.com/browse/album/...",
  "apple": "https://embed.music.apple.com/...",
  "qobuz": "https://www.qobuz.com/.../album/...",
  "source_urls": ["https://...", "https://..."]
}
```

`title` MUST be exactly `Artist - Album` (single hyphen, spaces around it).

Write the JSON to `/tmp/jazztips-meta.json`, then pipe it into the build script:

```bash
node "$CLAUDE_PROJECT_DIR/.claude/skills/jazztips/build-markdown.js" < /tmp/jazztips-meta.json
```

It prints `{"relPath": "src/content/<slug>.md", "markdown": "..."}` on stdout. Use the `Write` tool to write `markdown` to `$CLAUDE_PROJECT_DIR/<relPath>`.

### Step 5 — Commit & push

In `$CLAUDE_PROJECT_DIR`:

```bash
git checkout <BRANCH>
git pull --ff-only
git add src/content/<slug>.md
git commit -m "Add record: <Artist> - <Album>"
git push origin <BRANCH>
```

Report the commit SHA and the file path back to the user.

## Field rules (must hold)

- `title` exactly `Artist - Album`.
- `release_date` year-only is fine if no full date.
- `tags` are genres, never years or numbers.
- `credits` is **principal musicians only** — strip engineers, designers, photographers, arrangers, producers (producers go in their own field).
- `description` is factual; no opinions, no marketing language.
- `source_urls` ≥ 2 entries.
- Any unknown field → `null`. Never drop a key.

## Error handling

- If WebSearch returns no usable data after Steps 1–3, stop and report which step failed. Don't write a file with placeholder data.
- If the working tree isn't on `BRANCH` or has uncommitted changes, stop and ask the user before touching git.
- If the markdown file already exists, ask whether to overwrite before writing.
