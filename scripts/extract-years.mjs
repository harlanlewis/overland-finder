#!/usr/bin/env node
/**
 * Extract year ranges from vehicle names and add structured fields
 *
 * Usage: node scripts/extract-years.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');

const dryRun = process.argv.includes('--dry-run');

// Manual generation code mappings for vehicles where it's not in the name
const GENERATION_MAP = {
  'fj_cruiser': 'FJ',
  'gx460': 'J150',
  'gx470': 'J120',
  'lc200': '200 Series',
  'lc100': '100 Series',
  'lc80': '80 Series',
  'lx570': '200 Series',
  'sequoia_2g': '2nd Gen',
  'defender_classic': 'Defender 110',
  'disco_lr4': 'LR4/L319',
  'disco_5': 'L462',
  'gc_wk2': 'WK2',
  'gc_wk2_th': 'WK2',
  'wrangler_jl': 'JL',
  'wrangler_jk': 'JK',
  'wrangler_tj': 'TJ',
  'bronco_21_24': '6th Gen',
  'expedition_4g': '4th Gen',
  'excursion': '1st Gen',
  'tahoe_5g': '5th Gen',
  'tahoe_4g': '4th Gen',
  'gwagen_w463': 'W463',
  'montero_sport': '1st Gen',
  'montero_gen3': '3rd Gen',
  'xterra': '2nd Gen',
  'pathfinder_r51': 'R51',
  'patrol_y61': 'Y61',
  '4wd_suburban': '11th Gen',
  'hummer_h2': 'H2',
  'trooper': '2nd Gen',
  '4runner_5g_trd_pro': '5th Gen',
  '4runner_5g_trd_or': '5th Gen',
  '4runner_5g_sr5': '5th Gen',
};

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));

  let updated = 0;

  for (const vehicle of vehicles) {
    if (vehicle.condition !== 'used') continue;

    // Extract year range from name like "(2007-2018)"
    const yearMatch = vehicle.name.match(/\((\d{4})-(\d{4})\)/);

    if (yearMatch) {
      const yearStart = parseInt(yearMatch[1]);
      const yearEnd = parseInt(yearMatch[2]);

      // Check if already set
      if (vehicle.yearStart === yearStart && vehicle.yearEnd === yearEnd) {
        continue;
      }

      console.log(`[${vehicle.id}] ${yearStart}-${yearEnd}`);

      vehicle.yearStart = yearStart;
      vehicle.yearEnd = yearEnd;

      // Add generation if we have a mapping
      if (GENERATION_MAP[vehicle.id]) {
        vehicle.generation = GENERATION_MAP[vehicle.id];
        console.log(`  generation: ${vehicle.generation}`);
      }

      updated++;
    } else {
      console.log(`[${vehicle.id}] ⚠️ No year range found in: ${vehicle.name}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Updated: ${updated} vehicles`);

  if (!dryRun && updated > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
