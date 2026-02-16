#!/usr/bin/env node
/**
 * Apply verified price, powertrain, and reliability updates
 *
 * Usage: node scripts/apply-verified-updates.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const UPDATES_PATH = join(__dirname, 'verified-updates.json');

const dryRun = process.argv.includes('--dry-run');

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const updates = JSON.parse(readFileSync(UPDATES_PATH, 'utf-8'));

  let priceChanges = 0;
  let ptChanges = 0;
  let reliabilityChanges = 0;
  let noData = 0;

  for (const vehicle of vehicles) {
    const update = updates.vehicles[vehicle.id];

    if (!update) {
      console.log(`[${vehicle.id}] ⚠️ No update data`);
      noData++;
      continue;
    }

    const changes = [];

    // Price (stored in $K)
    if (update.price !== undefined && update.price !== vehicle.price) {
      const diff = update.price - vehicle.price;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
      changes.push(`price: $${vehicle.price}K → $${update.price}K (${diffStr})`);
      vehicle.price = update.price;
      priceChanges++;
    }

    // Powertrain
    if (update.pt !== undefined && update.pt !== vehicle.pt) {
      changes.push(`pt: ${vehicle.pt} → ${update.pt}`);
      vehicle.pt = update.pt;
      ptChanges++;
    }

    // Reliability (convert from 10-scale to match our data)
    if (update.reliability !== undefined) {
      const newRel = update.reliability;
      if (Math.abs(newRel - vehicle.reliability) > 0.3) {
        const diff = (newRel - vehicle.reliability).toFixed(1);
        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
        changes.push(`reliability: ${vehicle.reliability} → ${newRel} (${diffStr})`);
        vehicle.reliability = newRel;
        reliabilityChanges++;
      }
    }

    if (changes.length > 0) {
      console.log(`[${vehicle.id}] ${changes.join(', ')}`);
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Price changes: ${priceChanges}`);
  console.log(`Powertrain changes: ${ptChanges}`);
  console.log(`Reliability changes: ${reliabilityChanges}`);
  console.log(`No data: ${noData}`);

  if (!dryRun && (priceChanges + ptChanges + reliabilityChanges) > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
