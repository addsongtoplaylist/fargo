/**
 * Landing "One trip, start to finish" illustrations, in brand (LANDING.md → Redesign v6).
 *
 *   node scripts/illustrations/generate.mjs [--model gpt-image-2] [--quality medium] [--n 2] [--only before,during,after]
 *
 * Reads OPENAI_API_KEY from app/.env.local (never printed). Writes illustrations-review/<scene>-<n>.png
 * (gitignored) and logs token usage to illustrations-review/usage.jsonl. Pure white background (the landing
 * section is white; gpt-image-2 can't do transparency), 1536×1024.
 */
import { readFile, writeFile, mkdir, appendFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const flag = (name, fallback) => (args.includes(`--${name}`) ? args[args.indexOf(`--${name}`) + 1] : fallback);
const model = flag("model", "gpt-image-2");
const quality = flag("quality", "medium");
const n = Number(flag("n", "2"));
const only = (flag("only", "") || "").split(",").filter(Boolean);

const HOUSE = (scene, blank) => `Create an isometric 3D-style illustration on a plain, flat, pure white background (#FFFFFF), landscape format: a single small scene floating on its own in the middle, with no floor, no ground plane, no backdrop and no shadow underneath.

Scene: ${scene} Classic isometric angle.

Style: soft, clean, friendly shapes with slightly rounded edges; smooth flat colour with gentle soft shading and subtle highlights. No black outlines, no texture; the background stays pure white edge to edge. Calm, modern, premium travel-app look.

Colours — use ONLY these: Fargo blue #0071BC, soft sky blue #E3F0FA, warm cream #F6EFE2, deep teal #065E6B as a small accent, white, and light grey for shading.

STRICT RULE — NO TEXT AND NO NUMBERS ANYWHERE: no letters, no words, no digits, no numerals, no labels, no logos, no brand names, no currency symbols, no writing of any kind. ${blank} must be completely blank or show only simple shapes. No people, no animals, no characters.`;

const SCENES = {
  before: HOUSE(
    "a tidy cream-and-white desk with an open laptop whose screen shows only a simple grid of plain blue squares, two stacked hard-shell suitcases (one Fargo blue, one cream), a folded map with a blue location pin standing on it, a compass with a blank face, and a small potted plant.",
    "Screens, maps, pages, the compass and every other surface"
  ),
  during: HOUSE(
    "an open guidebook lying flat with blank pages that show only soft coloured blocks instead of text, a folded map beside it with a large blue location pin standing on it, a small backpack in Fargo blue, a round clock on a little stand with a completely blank face (only two hands, no numbers and no tick marks), and a takeaway coffee cup with a plain unprinted sleeve.",
    "The book, map, clock, cup and every other surface"
  ),
  after: HOUSE(
    "a simple calculator in white and Fargo blue whose screen is completely blank and whose buttons are plain unmarked rounded squares, a small cream suitcase with a plain teal luggage tag, a piggy bank in soft sky blue, a few small stacks of plain coins with no markings in cream and teal, and a folded paper receipt with only faint grey lines instead of text.",
    "The calculator, receipt, coins, tag and every other surface"
  ),
};

const env = await readFile(join(root, "app", ".env.local"), "utf8");
const line = env.split("\n").reverse().find((l) => l.startsWith("OPENAI_API_KEY="));
const key = line?.slice("OPENAI_API_KEY=".length).trim().replace(/^["']|["']$/g, "");
if (!key) throw new Error("OPENAI_API_KEY is missing from app/.env.local");

const out = join(root, "illustrations-review");
await mkdir(out, { recursive: true });
for (const [id, prompt] of Object.entries(SCENES)) {
  if (only.length && !only.includes(id)) continue;
  const t = Date.now();
  const res = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, prompt, size: "1536x1024", quality, n }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.log(`fail  ${id}: ${data.error?.message ?? res.status}`);
    continue;
  }
  await appendFile(join(out, "usage.jsonl"), JSON.stringify({ at: new Date().toISOString(), id, model, quality, n, usage: data.usage ?? null }) + "\n");
  for (const [i, img] of data.data.entries()) await writeFile(join(out, `${id}-${i + 1}.png`), Buffer.from(img.b64_json, "base64"));
  console.log(`made  ${id} ×${data.data.length} (${((Date.now() - t) / 1000).toFixed(0)}s)`);
}
