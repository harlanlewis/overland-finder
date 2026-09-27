#!/usr/bin/env node
/**
 * Apply EPA MPG data to vehicles.json
 *
 * Usage: node scripts/update-vehicle-mpg.mjs [--dry-run]
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const RESULTS_PATH = join(__dirname, 'vehicle-data-results.json');

const dryRun = process.argv.includes('--dry-run');

// Manual overrides for vehicles with special cases
const MANUAL_MPG = {
  // G-Wagen (not in EPA database, use manufacturer specs)
  'mercedes-benz-g-class-g-550-2019': 15,
  'mercedes-benz-g-class-amg-g-63-2019': 14,
  'mercedes-benz-g-class-1990': 13,
  // Classic Defender (not in EPA)
  'land-rover-defender-classic-1983': 14,
  // Ford Excursion (older, use manufacturer)
  'ford-excursion-2000': 12,
  // Nissan Patrol (not sold in US)
  'nissan-patrol-1997': 14,
  // Hummer H2 (older, use manufacturer)
  'hummer-h2-2003': 10,

  // Script matched wrong variant - manual corrections
  'audi-q8-2019': 19, // ICE Q8 quattro (script matched Q8 e-tron)
  'land-rover-lr4-2010': 16, // LR4 (script matched Discovery Sport)
  'ford-bronco-raptor-2021': 15, // Bronco Raptor 4WD (script matched base Bronco)
  'land-rover-range-rover-2022': 18, // Range Rover V8 (script may have matched diesel variant)
  'jeep-wrangler-rubicon-2018': 17, // Rubicon 4dr 4WD with 3.6L V6
  'jeep-wrangler-rubicon-2007': 17, // JK Rubicon (similar to JL)

  // EVs - use MPGe (EPA standard)
  // Note: These are miles per gallon equivalent, not traditional MPG
  'mercedes-benz-g-class-g-580-eq-2024': 77, // Electric G-Wagen MPGe
  'mercedes-benz-eqs-suv-2023': 79, // Mercedes EQS SUV MPGe
};

// PHEVs: `mpg` is EPA gas-only combined (comb08), the figure that holds once the
// battery is spent; `mpge` is EPA charge-depleting combined (combA08), stored but
// not scored. Picked by hand from fueleconomy.gov/ws/rest/vehicle/{epaId} because
// the fetch script's first-option match can't tell PHEV records apart. An entry
// EPA hasn't rated keeps its mpg and carries no mpge.
const PHEV_EPA = {
  'jeep-grand-cherokee-4xe-summit-2022': { epaId: 48665, year: 2025, mpg: 23, mpge: 56 },
  'jeep-grand-cherokee-4xe-overland-2022': { epaId: 48665, year: 2025, mpg: 23, mpge: 56 },
  'jeep-grand-cherokee-4xe-trailhawk-2022': { epaId: 48665, year: 2025, mpg: 23, mpge: 56 },
  'jeep-wrangler-4xe-rubicon-2021': { epaId: 48664, year: 2025, mpg: 20, mpge: 49 },
  'jeep-wrangler-4xe-sahara-2021': { epaId: 48664, year: 2025, mpg: 20, mpge: 49 },
  'bmw-x5-xdrive50e-2019': { epaId: 49760, year: 2026, mpg: 22, mpge: 60 },
  'bmw-xm-2023': { epaId: 48655, year: 2025, mpg: 14, mpge: 46 },
  'porsche-cayenne-e-hybrid-2019': { epaId: 49023, year: 2025, mpg: 22, mpge: 53 },
  'porsche-cayenne-turbo-e-hybrid-2019': { epaId: 49027, year: 2025, mpg: 22, mpge: 47 },
  'mitsubishi-outlander-phev-2022': { epaId: 50310, year: 2026, mpg: 27, mpge: 73 },
  'volvo-xc90-t8-2015': { epaId: 49772, year: 2026, mpg: 27, mpge: 58 },
  'mazda-cx-90-phev-2024': { epaId: 50267, year: 2026, mpg: 26, mpge: 56 },
  'mazda-cx-70-phev-2025': { epaId: 50266, year: 2026, mpg: 26, mpge: 61 },
  'kia-sorento-sx-prestige-phev-2021': { epaId: 49766, year: 2026, mpg: 33, mpge: 74 },
  'kia-sportage-x-line-phev-2023': { epaId: 49767, year: 2026, mpg: 36, mpge: 83 },
  'hyundai-tucson-limited-phev-2022': { epaId: 49764, year: 2026, mpg: 35, mpge: 77 },
  'lexus-tx-550h-plus-2024': { epaId: 49013, year: 2025, mpg: 29, mpge: 76 },
  'lexus-nx-450h-plus-2022': { epaId: 48670, year: 2025, mpg: 36, mpge: 84 },
  'lexus-rx-450h-plus-luxury-2023': { epaId: 49159, year: 2025, mpg: 35, mpge: 83 },
  'ford-escape-phev-2020': { epaId: 49763, year: 2026, mpg: 40, mpge: 101 },
  'toyota-rav4-prime-xse-2021': { epaId: 49160, year: 2025, mpg: 38, mpge: 94 },
};

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  // The fetch output is a local artifact; without it only the tables above apply.
  const { results } = existsSync(RESULTS_PATH)
    ? JSON.parse(readFileSync(RESULTS_PATH, 'utf-8'))
    : { results: [] };

  // Build lookup map from EPA results
  const epaMap = {};
  for (const r of results) {
    epaMap[r.id] = r.epaMpg;
  }

  let updated = 0;
  let skipped = 0;

  for (const [i, vehicle] of vehicles.entries()) {
    const oldMpg = vehicle.mpg;
    let newMpg = null;
    let source = null;

    const phev = PHEV_EPA[vehicle.id];
    if (phev && phev.mpge !== vehicle.mpge) {
      console.log(`${vehicle.id}: mpge ${vehicle.mpge ?? '-'} → ${phev.mpge} [EPA ${phev.epaId}]`);
      // Rebuild so mpge sits next to mpg in the JSON
      const { mpge, ...rest } = vehicle;
      vehicles[i] = Object.fromEntries(Object.entries(rest).flatMap(([k, val]) =>
        k === 'mpg' ? [[k, val], ['mpge', phev.mpge]] : [[k, val]]));
      updated++;
    }

    if (phev) {
      newMpg = phev.mpg;
      source = `EPA ${phev.epaId}`;
    }
    // Then manual overrides
    else if (MANUAL_MPG[vehicle.id] !== undefined) {
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
      vehicles[i].mpg = newMpg;
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
