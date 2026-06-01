/**
 * M27B — Ship Asset Importer
 *
 * Fetches the STFC Space ship catalog, downloads ship images, and generates
 * a machine-readable catalog file at generated/ships.json.
 *
 * Sources:
 *   Ship summary:   https://data.stfc.space/ship/summary.json
 *   Translations:   https://data.stfc.space/translations/en/ships.json
 *   Images:         https://assets.stfc.space/thumbs/ship/i/{art_id}.png
 *
 * Usage:
 *   npm run import:ships
 */

import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const VERSION_URL = 'https://data.stfc.space/version.txt';
const DATA_BASE = 'https://data.stfc.space';
const IMAGE_BASE = 'https://assets.stfc.space/thumbs/ship/i';

const ASSETS_DIR = path.join(process.cwd(), 'assets', 'ships');
const GENERATED_DIR = path.join(process.cwd(), 'generated');
const SHIPS_JSON = path.join(GENERATED_DIR, 'ships.json');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RawShip {
  id: number;
  art_id: number;
  loca_id: number;
}

interface Translation {
  id: number | null;
  key: string;
  text: string;
}

interface ShipEntry {
  shipId: string;
  name: string;
  image: string;
  imageUrl: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.json() as Promise<T>;
}

/**
 * Normalise a ship name to a safe filename stem.
 * E.g. "U.S.S. KELVIN" → "uss-kelvin"
 */
function normaliseFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Download a remote URL to a local file.
 * Returns 'downloaded' | 'skipped' | 'failed'.
 */
async function downloadFile(
  url: string,
  dest: string,
): Promise<'downloaded' | 'skipped' | 'failed'> {
  if (fs.existsSync(dest)) {
    return 'skipped';
  }
  try {
    const res = await fetch(url);
    if (!res.ok) {
      process.stderr.write(`  warn: HTTP ${res.status} for ${url}\n`);
      return 'failed';
    }
    const buf = await res.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buf));
    return 'downloaded';
  } catch (err) {
    process.stderr.write(`  warn: failed to download ${url}: ${err}\n`);
    return 'failed';
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Ensure output directories exist
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  // 1. Resolve the current data version
  const version = (await fetchText(VERSION_URL)).trim();

  // 2. Fetch ship summary and English translations in parallel
  const [rawShips, translations] = await Promise.all([
    fetchJson<RawShip[]>(`${DATA_BASE}/ship/summary.json?version=${version}`),
    fetchJson<Translation[]>(
      `${DATA_BASE}/translations/en/ships.json?version=${version}`,
    ),
  ]);

  // 3. Build a loca_id → name map (key === 'ship_name')
  const nameByLocaId = new Map<number, string>();
  for (const t of translations) {
    if (t.key === 'ship_name' && t.id !== null && t.text.trim() !== '') {
      // First definition wins (some ids appear multiple times)
      if (!nameByLocaId.has(t.id as number)) {
        nameByLocaId.set(t.id as number, t.text.trim());
      }
    }
  }

  // 4. Process each ship
  const catalog: ShipEntry[] = [];
  const usedFilenames = new Map<string, number>(); // stem → count

  let countDownloaded = 0;
  let countSkipped = 0;
  let countFailed = 0;

  for (const ship of rawShips) {
    const name = nameByLocaId.get(ship.loca_id);
    if (!name) continue; // no translation → not a player ship we can identify

    const imageUrl = `${IMAGE_BASE}/${ship.art_id}.png`;

    // Build a stable, collision-free filename
    const stem = normaliseFilename(name);
    const existingCount = usedFilenames.get(stem) ?? 0;
    usedFilenames.set(stem, existingCount + 1);

    const filename =
      existingCount === 0 ? `${stem}.png` : `${stem}-${ship.id}.png`;

    const dest = path.join(ASSETS_DIR, filename);
    const result = await downloadFile(imageUrl, dest);

    if (result === 'downloaded') countDownloaded++;
    else if (result === 'skipped') countSkipped++;
    else countFailed++;

    catalog.push({
      shipId: String(ship.id),
      name,
      image: filename,
      imageUrl,
    });
  }

  // 5. Write generated/ships.json
  fs.writeFileSync(SHIPS_JSON, JSON.stringify(catalog, null, 2) + '\n');

  // 6. Summary
  console.log(`\nImported: ${catalog.length} ships`);
  console.log(`Downloaded: ${countDownloaded} new images`);
  console.log(`Skipped: ${countSkipped} existing images`);
  if (countFailed > 0) {
    console.log(`Failed: ${countFailed} images (warnings above)`);
  }
}

main().catch((err: unknown) => {
  console.error('import-ships failed:', err);
  process.exit(1);
});
