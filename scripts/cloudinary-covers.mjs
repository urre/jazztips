// Puts every record cover on Cloudinary and points the frontmatter at it.
//
// - A cover that already lives on our Cloudinary account is used as is.
// - Any other cover (Apple Music, Bandcamp, a label site...) is uploaded to
//   jazztips/covers/<record id>, capped at 1400 px. The original URL is kept
//   in `imageSource`. If the original is gone, a local copy in
//   src/assets/covers/<record id>.avif is uploaded instead.
//
//   node scripts/cloudinary-covers.mjs [record-id ...]
//
// Reads CLOUDINARY_URL from the environment or from .env in the repo root
// (git-ignored; copy the line from ~/.dotfiles/.env if it's missing).

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const CONTENT = "src/content";
const LOCAL_COVERS = "src/assets/covers";
const FOLDER = "jazztips/covers";
// Applied on upload so stored originals stay a sensible size
const INCOMING = "c_limit,w_1400,h_1400";

if (!process.env.CLOUDINARY_URL && fs.existsSync(".env")) process.loadEnvFile(".env");

const config = process.env.CLOUDINARY_URL?.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
if (!config) {
  console.error("Set CLOUDINARY_URL=cloudinary://key:secret@cloud in .env (see ~/.dotfiles/.env)");
  process.exit(1);
}
const [, apiKey, apiSecret, cloud] = config;
const ownCloudinary = `https://res.cloudinary.com/${cloud}/`;

// A frontmatter field, plain or folded over several lines (`image: >-`)
const field = (name) => new RegExp(`^${name}:[ \\t]*(?:>-?|\\|-?)?[ \\t]*(\\S*)[ \\t]*\\n((?:[ \\t]+\\S.*\\n)*)`, "m");
const read = (frontmatter, name) => {
  const match = frontmatter.match(field(name));
  return match && (match[1] + match[2].replace(/\s+/g, "")).replace(/^["']|["']$/g, "");
};

async function upload(id, file) {
  const params = {
    public_id: `${FOLDER}/${id}`,
    overwrite: "true",
    transformation: INCOMING,
    timestamp: String(Math.floor(Date.now() / 1000)),
  };
  const toSign = Object.keys(params).sort().map((key) => `${key}=${params[key]}`).join("&");
  const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

  const body = new FormData();
  for (const [key, value] of Object.entries(params)) body.append(key, value);
  body.append("api_key", apiKey);
  body.append("signature", signature);
  body.append("file", file);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(60000),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error?.message ?? `HTTP ${response.status}`);
  return result.secure_url;
}

async function handleRecord(file) {
  const id = path.basename(file, ".md");
  const source = fs.readFileSync(file, "utf8");
  const frontmatter = source.split(/^---$/m)[1] ?? "";
  const image = read(frontmatter, "image");
  const imageSource = read(frontmatter, "imageSource");
  const original = imageSource ?? (/^https?:\/\//.test(image ?? "") ? image : null);

  let url;
  let how;
  if (image?.startsWith(ownCloudinary)) {
    return "already on Cloudinary";
  } else if (original?.startsWith(ownCloudinary)) {
    url = original;
    how = "reused";
  } else if (original) {
    try {
      url = await upload(id, original);
      how = "uploaded from source";
    } catch (error) {
      const local = path.join(LOCAL_COVERS, `${id}.avif`);
      if (!fs.existsSync(local)) throw new Error(`${original}: ${error.message}`);
      url = await upload(id, `data:image/avif;base64,${fs.readFileSync(local).toString("base64")}`);
      how = `uploaded local copy (${error.message})`;
    }
  } else {
    throw new Error("no image source");
  }

  // The source is only worth keeping when it differs from the image itself
  const sourceLine = original && original !== url ? `imageSource: ${original}\n` : "";
  let updated = source.replace(field("imageSource"), "");
  updated = updated.replace(field("image"), `image: ${url}\n${sourceLine}`);
  fs.writeFileSync(file, updated);
  return how;
}

const only = process.argv.slice(2);
const files = (only.length ? only.map((id) => `${id.replace(/\.md$/, "")}.md`) : fs.readdirSync(CONTENT))
  .filter((name) => name.endsWith(".md"))
  .map((name) => path.join(CONTENT, name));

const counts = {};
const failures = [];
let next = 0;

await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (next < files.length) {
      const file = files[next++];
      try {
        const how = await handleRecord(file);
        const key = how.startsWith("uploaded local copy") ? "uploaded local copy" : how;
        counts[key] = (counts[key] ?? 0) + 1;
        if (only.length || how.startsWith("uploaded local copy")) console.log(`${file}: ${how}`);
      } catch (error) {
        failures.push(`${file}: ${error.message}`);
      }
    }
  })
);

console.log(counts);
if (failures.length) {
  console.error(`Failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
}
