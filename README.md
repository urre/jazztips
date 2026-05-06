# Jazztips

Tst

Jazz music recommendations since 2010.

- Astro 5
- MDX
- Typescript
- Tiny bits of React

## Setup

```shell
npm i
```

## Run
```
npm start
```

## Build

```shell
npm run build
```

## Deploy

Deploys to Vercel with git

## Workflow and Tools

- Records are Markdown posts in `src/content/`
- Using Github Codepilot in Agent mode using Claude Sonnet to:
  - Find music metadata and format as Frontmatter YML sand save .md files
  - Ask Copilot to use the script in src/tools to get
    - Fetch streaming links by searching the web using Tavily Web search API
    - Fetch cover art by looking up the LastFM API

## Create a new record

### Claude Code skill (recommended)

This repo ships with a Claude Code skill at [.claude/skills/jazztips/](.claude/skills/jazztips/) that creates a fully-formatted record from just `Artist - Album` and pushes it to `origin`.

1. Open this repo in Claude Code (`claude` from the repo root).
2. Invoke the skill:
   ```
   /jazztips Nils Landgren - Love of My Life
   ```
   Or in plain text: `add Nils Landgren - Love of My Life to jazztips`.

The skill will:
- Search the web for metadata (release date, label, credits, description) and cover art.
- Pick the best Spotify / Tidal / Apple Music / Qobuz album URLs.
- Write `src/content/<slug>.md` with the proper frontmatter.
- Commit and push to `main`.

Requirements: clean working tree on `main`. The skill stops and asks if either is off.

### Legacy: Copilot Agent Mode

```markdown
#new-record Create an entry for "Blue Train" by John Coltrane
```

### ENV

Create `src/.env`

```
CLOUDNAME=XXX
APIKEY=XXX
APISECRET=XXX
LASTFM_API_KEY=XXX
LASTFM_USER=XXX
GOOGLE_API_KEY=XXX
SEARCH_ENGINE_ID=XXX
SPOTIFY_CLIENT_ID=XXX
SPOTIFY_CLIENT_SECRET=XXX
TAVILY_API_KEY=XXX
```
