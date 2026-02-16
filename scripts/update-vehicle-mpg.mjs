#!/usr/bin/env node
/**
 * Apply EPA MPG data to vehicles.json
 *
 * Usage: node scripts/update-vehicle-mpg.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const RESULTS_PATH = join(__dirname, 'vehicle-data-results.json');

const dryRun = process.argv.includes('--dry-run');

// Manual overrides for vehicles with special cases
const MANUAL_MPG = {
  // G-Wagen (not in EPA database, use manufacturer specs)
  'gwagen': 15,
  'gwagen_amg': 14,
  'gwagen_w463': 13,
  // Classic Defender (not in EPA)
  'defender_classic': 14,
  // Ford Excursion (older, use manufacturer)
  'excursion': 12,
  // Nissan Patrol (not sold in US)
  'patrol_y61': 14,
  // Hummer H2 (older, use manufacturer)
  'hummer_h2': 10,

  // Script matched wrong variant - manual corrections
  'q8': 19, // ICE Q8 quattro (script matched Q8 e-tron)
  'disco_lr4': 16, // LR4 (script matched Discovery Sport)
  'bronco_raptor': 15, // Bronco Raptor 4WD (script matched base Bronco)
  'rr_full': 18, // Range Rover V8 (script may have matched diesel variant)
  'wrangler_jl': 17, // Rubicon 4dr 4WD with 3.6L V6
  'wrangler_jk': 17, // JK Rubicon (similar to JL)

  // PHEVs - use blended/real-world estimates instead of gas-only EPA
  'x5': 50, // PHEV combined estimate (gas-only is 15)
  'cayenne_ehybrid': 46, // PHEV blended (gas-only is 19)
  'cayenne_turbo': 38, // PHEV blended (gas-only is 19)
  'gle350de': 56, // Diesel PHEV, European spec

  // EVs - use MPGe (EPA standard)
  // Note: These are miles per gallon equivalent, not traditional MPG
  'g580_eq': 77, // Electric G-Wagen MPGe
  'eqs_suv': 79, // Mercedes EQS SUV MPGe
};

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const { results } = JSON.parse(readFileSync(RESULTS_PATH, 'utf-8'));

  // Build lookup map from EPA results
  const epaMap = {};
  for (const r of results) {
    epaMap[r.id] = r.epaMpg;
  }

  let updated = 0;
  let skipped = 0;

  for (const vehicle of vehicles) {
    const oldMpg = vehicle.mpg;
    let newMpg = null;
    let source = null;

    // Check manual overrides first
    if (MANUAL_MPG[vehicle.id] !== undefined) {
      newMpg = MANUAL_MPG[vehicle.id];
      source = 'manual';
    }
    // Then EPA data
    else if (epaMap[vehicle.id]) {
      newMpg = epaMap[vehicle.id];
      source = 'EPA';
    }

    if (newMpg !== null && newMpg !== oldMpg) {
      const diff = newMpg - oldMpg;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
      console.log(`${vehicle.id}: ${oldMpg} → ${newMpg} (${diffStr}) [${source}]`);
      vehicle.mpg = newMpg;
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nUpdated: ${updated}, Unchanged: ${skipped}`);

  if (!dryRun && updated > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
