#!/usr/bin/env node
/**
 * Apply size classification data to vehicles
 *
 * Usage: node scripts/apply-size-data.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const SIZE_DATA_PATH = join(__dirname, 'size-data.json');

const dryRun = process.argv.includes('--dry-run');

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const sizeData = JSON.parse(readFileSync(SIZE_DATA_PATH, 'utf-8'));

  let changed = 0;
  let unchanged = 0;
  let noData = 0;

  for (const vehicle of vehicles) {
    const data = sizeData[vehicle.id];

    if (!data) {
      console.log(`[${vehicle.id}] ⚠️ No size data`);
      noData++;
      continue;
    }

    if (data.size !== vehicle.size) {
      console.log(`[${vehicle.id}] ${vehicle.size} → ${data.size} (${data.source})`);
      vehicle.size = data.size;
      changed++;
    } else {
      unchanged++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Changed:   ${changed}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`No data:   ${noData}`);
  console.log(`Total:     ${vehicles.length}`);

  if (!dryRun && changed > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
