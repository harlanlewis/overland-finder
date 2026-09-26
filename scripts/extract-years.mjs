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
  'toyota-fj-cruiser-2007': 'FJ',
  'lexus-gx-460-2010': 'J150',
  'lexus-gx-470-2003': 'J120',
  'toyota-land-cruiser-2008': '200 Series',
  'toyota-land-cruiser-1998': '100 Series',
  'toyota-land-cruiser-1990': '80 Series',
  'lexus-lx-570-2008': '200 Series',
  'toyota-sequoia-2008': '2nd Gen',
  'land-rover-defender-classic-1983': 'Defender 110',
  'land-rover-lr4-2010': 'LR4/L319',
  'land-rover-discovery-2017': 'L462',
  'jeep-grand-cherokee-2011': 'WK2',
  'jeep-grand-cherokee-trailhawk-2017': 'WK2',
  'jeep-wrangler-rubicon-2018': 'JL',
  'jeep-wrangler-rubicon-2007': 'JK',
  'jeep-wrangler-1997': 'TJ',
  'ford-bronco-badlands-2021': '6th Gen',
  'ford-expedition-2018': '4th Gen',
  'ford-excursion-2000': '1st Gen',
  'chevrolet-tahoe-z71-2021': '5th Gen',
  'chevrolet-tahoe-z71-2015': '4th Gen',
  'mercedes-benz-g-class-1990': 'W463',
  'mitsubishi-montero-sport-1997': '1st Gen',
  'mitsubishi-montero-2001': '3rd Gen',
  'nissan-xterra-2005': '2nd Gen',
  'nissan-pathfinder-2005': 'R51',
  'nissan-patrol-1997': 'Y61',
  'chevrolet-suburban-4wd-2015': '11th Gen',
  'hummer-h2-2003': 'H2',
  'isuzu-trooper-1992': '2nd Gen',
  'toyota-4runner-trd-pro-2015': '5th Gen',
  'toyota-4runner-trd-off-road-2010': '5th Gen',
  'toyota-4runner-sr5-2010': '5th Gen',
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
