#!/usr/bin/env node
// Port of the n8n "Build Markdown" code node.
// Reads metadata JSON from stdin, prints { relPath, markdown, meta } JSON to stdout.

function slugify(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function safeUrl(u) {
  try { return new URL(u); } catch { return null; }
}

function normalizeTidal(url) {
  if (!url) return "";
  const u = safeUrl(url);
  if (!u || !u.hostname.toLowerCase().includes("tidal.com")) return url;

  const parts = u.pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("album");
  if (idx === -1 || !parts[idx + 1]) return url;

  const id = parts[idx + 1].match(/\d+/)?.[0] || parts[idx + 1];
  return `https://tidal.com/browse/album/${id}`;
}

function normalizeApple(url) {
  if (!url) return "";
  const u = safeUrl(url);
  if (!u || !u.hostname.toLowerCase().endsWith("music.apple.com")) return url;

  u.protocol = "https:";
  u.hostname = "embed.music.apple.com";
  return u.toString();
}

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (c) => { data += c; });
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

(async () => {
  const raw = (await readStdin()).trim();
  let meta;
  try {
    meta = JSON.parse(raw);
  } catch {
    const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) {
      meta = JSON.parse(m[1].trim());
    } else {
      throw new Error("Did not receive valid JSON on stdin: " + raw.slice(0, 200));
    }
  }

  if (meta.error) throw new Error("Metadata error: " + meta.error);

  meta.tidal = normalizeTidal(meta.tidal);
  meta.apple = normalizeApple(meta.apple);

  const pubDate = new Date().toISOString().slice(0, 10);
  const slug = slugify(meta.title);
  const permalink = `https://jazztips.se/${slug}/`;
  const tags = Array.isArray(meta.tags) ? meta.tags : [];
  const credits = Array.isArray(meta.credits) ? meta.credits : [];
  const year = meta.release_date ? new Date(meta.release_date).getFullYear() : "";

  const optionalFields = [
    meta.spotify && `spotify: ${meta.spotify}`,
    meta.tidal && `tidal: ${meta.tidal}`,
    `image: ${meta.cover_image_url ?? ""}`,
    meta.apple && `apple: ${meta.apple}`,
    meta.qobuz && `qobuz: ${meta.qobuz}`,
  ].filter(Boolean).join("\n");

  const creditLines = credits.length
    ? credits.map((c) => `  - name: ${c.name}\n    instrument: ${c.role}`).join("\n")
    : "  - name: \n    instrument: ";

  const tagLines = tags.length
    ? tags.map((t) => `  - ${t}`).join("\n")
    : "  - ";

  const fm = `---
layout: ../layouts/Record.astro
title: ${meta.album}
draft: true
pubDate: ${pubDate}
artist: ${meta.artist}
label: ${meta.label ?? ""}
year: ${year}
tags:
${tagLines}
permalink: ${permalink}
${optionalFields}
credits:
${creditLines}
---

${meta.description ?? ""}
`;

  process.stdout.write(JSON.stringify({
    relPath: `src/content/${slug}.md`,
    markdown: fm,
    meta: { ...meta, pubDate, permalink, slug },
  }));
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
