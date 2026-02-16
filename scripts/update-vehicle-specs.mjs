#!/usr/bin/env node
/**
 * Update vehicle specs from researched data
 *
 * Uses: manual-specs.json (researched tow, cargo, gc, weight values)
 *
 * Usage: node scripts/update-vehicle-specs.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const MANUAL_SPECS_PATH = join(__dirname, 'manual-specs.json');

const dryRun = process.argv.includes('--dry-run');

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const manualSpecs = JSON.parse(readFileSync(MANUAL_SPECS_PATH, 'utf-8'));

  let updated = 0;
  let skipped = 0;
  let noData = 0;

  const changes = [];

  for (const vehicle of vehicles) {
    const specs = manualSpecs.vehicles[vehicle.id];

    if (!specs) {
      console.log(`[${vehicle.id}] ⚠️ No manual specs`);
      noData++;
      continue;
    }

    const vehicleChanges = [];

    // Check each field
    const fields = ['weight', 'tow', 'cargo', 'gc'];
    for (const field of fields) {
      if (specs[field] !== undefined && specs[field] !== vehicle[field]) {
        const diff = specs[field] - vehicle[field];
        const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
        vehicleChanges.push(`${field}: ${vehicle[field]} → ${specs[field]} (${diffStr})`);
        vehicle[field] = specs[field];
      }
    }

    if (vehicleChanges.length > 0) {
      console.log(`[${vehicle.id}] ${vehicleChanges.join(', ')}`);
      changes.push({ id: vehicle.id, changes: vehicleChanges, source: specs.source });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Updated: ${updated}`);
  console.log(`Unchanged: ${skipped}`);
  console.log(`No data: ${noData}`);

  if (!dryRun && updated > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }

  // Show summary of significant changes
  if (changes.length > 0) {
    console.log('\n--- Changes by Source ---');
    const bySource = {};
    for (const c of changes) {
      if (!bySource[c.source]) bySource[c.source] = [];
      bySource[c.source].push(c.id);
    }
    for (const [source, ids] of Object.entries(bySource).slice(0, 10)) {
      console.log(`  ${source}: ${ids.join(', ')}`);
    }
  }
}

main();
