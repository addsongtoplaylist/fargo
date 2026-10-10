#!/usr/bin/env node
/**
 * Stamp generator (docs/STAMPS.md v2). Runs on the owner's machine only.
 *
 *   node scripts/stamps/generate.mjs <list.json> --provider openai [--set v2] [--model gpt-image-2] [--quality medium] [--force]
 *
 * Reads the API key from app/.env.local (never printed), calls the image model once
 * per entry and saves raw PNGs to stamps-review/<provider>/raw/<id>.png. Existing
 * files are skipped unless --force (--set keeps rounds apart: stamps-review/<provider>-<set>/), so a re-run only makes what's missing.
 * Clean-up and the review sheet are separate steps (clean.py, sheet.py).
 */
import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const listPath = args.find((a) => a.endsWith(".json"));
const provider = flag("provider", "openai");
const model = flag("model", provider === "openai" ? "gpt-image-2" : "");
const quality = flag("quality", "medium");
const force = args.includes("--force");
const set = flag("set", "");
if (!listPath) throw new Error("Usage: generate.mjs <list.json> --provider openai");

// House template (STAMPS.md v2, round 2): one shared style, a different shape and
// composition per stamp so the set feels playful. No text: image models misspell it.
function prompt(e) {
  const what = e.kind === "country" ? `${e.country}` : `${e.name}, ${e.country}`;
  return [
    `Single-colour rubber ink travel stamp for ${what}.`,
    `Shape: ${e.shape ?? "circle"}, with a bold double-line border that follows that shape.`,
    `Inside the border, a line illustration of ${e.subject}.`,
    `Composition: ${e.composition ?? "the landmark centred"}. Everything stays inside the border.`,
    "Style: bold, clean linework like a hand-carved rubber stamp, slightly uneven ink coverage with small worn gaps and light texture, as if stamped on paper.",
    "One flat ink colour: deep teal. Plain white background, the stamp only, centred, no shadow, no paper texture.",
    e.text
      ? `No sun, no moon. Lettering: the text ${e.text.map((t) => `"${t}"`).join(" and ")} in bold capital letters, spelled exactly as given, ${e.placement ?? "set in a band or banner along the border"}, in the same ink. No other text, letters or numbers.`
      : "No sun, no moon. Absolutely no text, letters, numbers or words anywhere.",
  ].join(" ");
}

async function envKey(name) {
  const env = await readFile(join(root, "app", ".env.local"), "utf8");
  const line = env.split("\n").reverse().find((l) => l.startsWith(`${name}=`));
  const value = line?.slice(name.length + 1).trim().replace(/^["']|["']$/g, "");
  if (!value) throw new Error(`${name} is missing from app/.env.local`);
  return value;
}

async function openai(e, key) {
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, prompt: prompt(e), size: "1024x1024", quality, n: 1 }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  return Buffer.from(data.data[0].b64_json, "base64");
}

const entries = JSON.parse(await readFile(listPath, "utf8"));
const outDir = join(root, "stamps-review", set ? `${provider}-${set}` : provider, "raw");
await mkdir(outDir, { recursive: true });
const key = await envKey(provider === "openai" ? "OPENAI_API_KEY" : "GEMINI_API_KEY");
const exists = (p) => access(p).then(() => true, () => false);

let made = 0;
for (const e of entries) {
  const out = join(outDir, `${e.id}.png`);
  if (!force && (await exists(out))) {
    console.log(`skip  ${e.id} (already made)`);
    continue;
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const t = Date.now();
      const png = provider === "openai" ? await openai(e, key) : null;
      if (!png) throw new Error(`provider ${provider} not set up yet`);
      await writeFile(out, png);
      made++;
      console.log(`made  ${e.id} (${((Date.now() - t) / 1000).toFixed(0)}s)`);
      break;
    } catch (err) {
      console.log(`fail  ${e.id} try ${attempt}: ${err.message}`);
      if (attempt === 3) console.log(`gave up on ${e.id}`);
    }
  }
}
console.log(`done: ${made} new image(s) with ${provider} ${model} (${quality})`);
