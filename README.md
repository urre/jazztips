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

Typical AI Prompt to use with for example Copilot in Agent Mode

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
