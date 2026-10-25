// Downloads remote cover images into src/assets/covers as compact AVIF files
// and points the record's frontmatter at the local file. The original URL is
// kept in `imageSource` so a cover can be fetched again later.
//
//   node scripts/localize-covers.mjs              all records with a remote image
//   node scripts/localize-covers.mjs some-record  only src/content/some-record.md
//
// Set COVER_CACHE to a folder of already downloaded originals (named by record
// id) to skip the download.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const CONTENT = "src/content";
const COVERS = "src/assets/covers";
// Big enough for the largest cover on a retina screen (500 css px)
const MAX_SIZE = 1000;
const AVIF = { quality: 58, effort: 6 };

const only = process.argv.slice(2);
const cache = process.env.COVER_CACHE;

fs.mkdirSync(COVERS, { recursive: true });

// `image: https://...` or a folded `image: >-` with the URL on the next line(s)
const imageBlock = /^image:[ \t]*(?:>-?|\|-?)?[ \t]*(\S*)[ \t]*\n((?:[ \t]+\S.*\n)*)/m;

function remoteImage(frontmatter) {
  const match = frontmatter.match(imageBlock);
  if (!match) return null;
  const url = (match[1] + match[2].replace(/\s+/g, "")).replace(/^["']|["']$/g, "");
  return /^https?:\/\//.test(url) ? { block: match[0], url } : null;
}

async function download(id, url) {
  const cached = cache && path.join(cache, id);
  if (cached && fs.existsSync(cached)) return fs.readFileSync(cached);

  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/130 Safari/537.36" },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function localize(file) {
  const id = path.basename(file, ".md");
  const source = fs.readFileSync(file, "utf8");
  const [, frontmatter] = source.split(/^---$/m);
  const remote = frontmatter && remoteImage(frontmatter);
  if (!remote) return "skipped";

  const original = await download(id, remote.url);
  const avif = await sharp(original)
    .rotate()
    .resize(MAX_SIZE, MAX_SIZE, { fit: "inside", withoutEnlargement: true })
    .avif(AVIF)
    .toBuffer();
  fs.writeFileSync(path.join(COVERS, `${id}.avif`), avif);

  // Replace the frontmatter's own image line, not a matching `ogimage:` line
  const replacement = `image: ../assets/covers/${id}.avif\nimageSource: ${remote.url}\n`;
  fs.writeFileSync(file, source.replace(imageBlock, replacement));
  return `${Math.round(original.length / 1024)} KB -> ${Math.round(avif.length / 1024)} KB`;
}

const files = (only.length ? only.map((id) => `${id.replace(/\.md$/, "")}.md`) : fs.readdirSync(CONTENT))
  .filter((name) => name.endsWith(".md"))
  .map((name) => path.join(CONTENT, name));

let next = 0;
const failures = [];
let done = 0;

await Promise.all(
  Array.from({ length: 8 }, async () => {
    while (next < files.length) {
      const file = files[next++];
      try {
        const result = await localize(file);
        if (result !== "skipped") {
          done++;
          if (only.length) console.log(`${file}: ${result}`);
        }
      } catch (error) {
        failures.push(`${file}: ${error.message}`);
      }
    }
  })
);

console.log(`Localized ${done} cover(s)`);
if (failures.length) {
  console.error(`Failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
}
