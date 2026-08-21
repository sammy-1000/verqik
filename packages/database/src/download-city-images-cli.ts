import { createWriteStream, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { citySeedImageFilename } from './city-image-seed-urls';
import { SUPPORTED_CITIES } from './supported-cities';

const here = dirname(fileURLToPath(import.meta.url));
const assetsDir = join(here, '../seed-assets/cities');

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function wikipediaThumbnail(cityName: string, countryCode: string) {
  const titles = [cityName, `${cityName}, ${countryCode}`];
  for (const title of titles) {
    const response = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      { headers: { 'User-Agent': 'VerqikCitySeed/1.0' } },
    );
    if (!response.ok) continue;
    const data = (await response.json()) as { thumbnail?: { source?: string } };
    if (data.thumbnail?.source) return data.thumbnail.source;
  }
  return null;
}

async function download(url: string, dest: string) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'VerqikCitySeed/1.0' },
    redirect: 'follow',
  });
  if (!response.ok || !response.body) {
    throw new Error(`HTTP ${response.status}`);
  }
  await pipeline(
    response.body as unknown as NodeJS.ReadableStream,
    createWriteStream(dest),
  );
}

async function main() {
  mkdirSync(assetsDir, { recursive: true });

  let ok = 0;
  let failed = 0;

  for (const city of SUPPORTED_CITIES) {
    const dest = join(assetsDir, citySeedImageFilename(city.seedKey));
    if (existsSync(dest)) {
      console.log(`skip ${city.seedKey} (exists)`);
      ok++;
      continue;
    }

    try {
      const url = await wikipediaThumbnail(city.name, city.countryCode);
      if (!url) throw new Error('no Wikipedia thumbnail');
      await download(url, dest);
      console.log(`ok ${city.seedKey}`);
      ok++;
    } catch (err) {
      console.warn(
        `fail ${city.seedKey}: ${err instanceof Error ? err.message : err}`,
      );
      failed++;
    }

    await sleep(2500);
  }

  console.log(`done: ${ok} ok, ${failed} failed → ${assetsDir}`);
}

void main();
