#!/usr/bin/env node
/**
 * Apply generation data (yearStart, yearEnd, generation) to all vehicles
 *
 * Usage: node scripts/apply-generation-data.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const GENERATION_PATH = join(__dirname, 'generation-data.json');

const dryRun = process.argv.includes('--dry-run');

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const generationData = JSON.parse(readFileSync(GENERATION_PATH, 'utf-8'));

  let updated = 0;
  let added = 0;
  let unchanged = 0;
  let noData = 0;

  for (const vehicle of vehicles) {
    const genData = generationData[vehicle.id];

    if (!genData) {
      console.log(`[${vehicle.id}] ⚠️ No generation data`);
      noData++;
      continue;
    }

    const changes = [];
    const isNew = !vehicle.yearStart && !vehicle.yearEnd && !vehicle.generation;

    // yearStart
    if (genData.yearStart !== undefined && genData.yearStart !== vehicle.yearStart) {
      const oldVal = vehicle.yearStart ?? 'none';
      changes.push(`yearStart: ${oldVal} → ${genData.yearStart}`);
      vehicle.yearStart = genData.yearStart;
    }

    // yearEnd (can be null for current production)
    if (genData.yearEnd !== vehicle.yearEnd) {
      const oldVal = vehicle.yearEnd ?? 'null';
      const newVal = genData.yearEnd ?? 'null';
      changes.push(`yearEnd: ${oldVal} → ${newVal}`);
      vehicle.yearEnd = genData.yearEnd;
    }

    // generation
    if (genData.generation !== undefined && genData.generation !== vehicle.generation) {
      const oldVal = vehicle.generation ?? 'none';
      changes.push(`generation: ${oldVal} → ${genData.generation}`);
      vehicle.generation = genData.generation;
    }

    if (changes.length > 0) {
      console.log(`[${vehicle.id}] ${changes.join(', ')}`);
      if (isNew) {
        added++;
      } else {
        updated++;
      }
    } else {
      unchanged++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Added (new vehicles):     ${added}`);
  console.log(`Updated (existing data):  ${updated}`);
  console.log(`Unchanged:                ${unchanged}`);
  console.log(`No data:                  ${noData}`);
  console.log(`Total vehicles:           ${vehicles.length}`);

  if (!dryRun && (added + updated) > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
