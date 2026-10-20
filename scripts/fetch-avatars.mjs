// Finds photos for the most featured musicians and writes them to
// src/data/musician-avatars.json, which the musicians page reads.
//
//   node scripts/fetch-avatars.mjs [count]
//
// Looks the musician up on English Wikipedia (Swedish as fallback), follows the
// page to Wikidata and uses its image (P18), which is always a freely licensed
// Wikimedia Commons file. Existing entries are kept, so it is safe to rerun.
import fs from "node:fs";
import path from "node:path";

const COUNT = Number(process.argv[2] ?? 20);
const CONTENT = "src/content";
const OUT = "src/data/musician-avatars.json";
const HEADERS = { "User-Agent": "jazztips-avatars/1.0 (https://jazztips.se)" };

// Same merge rule as the page: trimmed, case-insensitive names
const counts = new Map();
for (const file of fs.readdirSync(CONTENT)) {
  const text = fs.readFileSync(path.join(CONTENT, file), "utf8");
  const seen = new Set();
  for (const [, raw] of text.matchAll(/^\s*- name:\s*(.+)$/gm)) {
    const name = raw.replace(/^["']|["']$/g, "").trim().replace(/\s+/g, " ");
    const key = name.toLowerCase();
    if (!name || name === "-" || seen.has(key)) continue;
    seen.add(key);
    const entry = counts.get(key) ?? { name, count: 0 };
    entry.count++;
    counts.set(key, entry);
  }
}
const top = [...counts.values()].sort((a, b) => b.count - a.count).slice(0, COUNT);

const getJson = async (url) => (await fetch(url, { headers: HEADERS })).json();

async function findPage(name, lang) {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `${name} jazz`,
    gsrlimit: "3",
    prop: "pageprops|description",
    ppprop: "wikibase_item",
    format: "json",
  });
  const data = await getJson(`https://${lang}.wikipedia.org/w/api.php?${params}`);
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index);
  // The page title must be the musician, not an album or band they played in
  return pages.find((p) => p.title.replace(/ \(.*\)$/, "").toLowerCase() === name.toLowerCase());
}

async function imageFor(qid) {
  const data = await getJson(
    `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json`
  );
  return data.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
}

const avatars = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};

for (const { name } of top) {
  const key = name.toLowerCase();
  if (avatars[key]) continue;

  let found;
  for (const lang of ["en", "sv"]) {
    const page = await findPage(name, lang);
    const qid = page?.pageprops?.wikibase_item;
    const file = qid && (await imageFor(qid));
    if (file) {
      found = {
        name,
        image: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=160`,
        credit: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file.replace(/ /g, "_"))}`,
        page: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
      };
      break;
    }
  }

  console.log(found ? `✓ ${name}` : `– ${name} (no free photo found)`);
  if (found) avatars[key] = found;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(avatars, null, 2) + "\n");
