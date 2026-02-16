#!/usr/bin/env node
/**
 * Calculate performance scores based on power-to-weight ratio
 *
 * Formula: (hp / weight_lbs) * 1000 = power-to-weight
 * Then normalize to 1-10 scale based on observed range
 *
 * Typical SUV/truck range:
 * - Low: ~30 (heavy diesel, underpowered)
 * - Mid: ~60-70 (typical SUV)
 * - High: ~120+ (performance vehicles)
 *
 * Usage: node scripts/calculate-performance-scores.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const HP_PATH = join(__dirname, 'horsepower-data.json');

const dryRun = process.argv.includes('--dry-run');

// Normalization bounds (power-to-weight * 1000)
// Adjusted: most SUVs cluster around 50-90 PTW
const PTW_MIN = 25;   // Scores 1 (very underpowered)
const PTW_MAX = 125;  // Scores 10 (supercar territory)

function calculatePtwScore(hp, weight) {
  const ptw = (hp / weight) * 1000;

  // Linear interpolation from PTW_MIN-PTW_MAX to 1-10
  const normalized = 1 + ((ptw - PTW_MIN) / (PTW_MAX - PTW_MIN)) * 9;

  // Clamp to 1-10 and round to nearest 0.5
  const clamped = Math.min(10, Math.max(1, normalized));
  return Math.round(clamped * 2) / 2;
}

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const hpData = JSON.parse(readFileSync(HP_PATH, 'utf-8'));

  let updated = 0;
  let missing = 0;

  // First pass: calculate all PTW values to show distribution
  const ptwValues = [];
  for (const vehicle of vehicles) {
    const data = hpData.vehicles[vehicle.id];
    if (data) {
      const ptw = (data.hp / vehicle.weight) * 1000;
      ptwValues.push({ id: vehicle.id, ptw, hp: data.hp, weight: vehicle.weight });
    }
  }

  // Sort by PTW for reference
  ptwValues.sort((a, b) => a.ptw - b.ptw);

  console.log('Power-to-Weight Distribution:');
  console.log('='.repeat(60));
  console.log(`Lowest:  ${ptwValues[0].id} (${ptwValues[0].ptw.toFixed(1)})`);
  console.log(`Median:  ${ptwValues[Math.floor(ptwValues.length/2)].id} (${ptwValues[Math.floor(ptwValues.length/2)].ptw.toFixed(1)})`);
  console.log(`Highest: ${ptwValues[ptwValues.length-1].id} (${ptwValues[ptwValues.length-1].ptw.toFixed(1)})`);
  console.log();

  console.log('Vehicle ID'.padEnd(25) + 'HP'.padStart(6) + 'Weight'.padStart(8) + 'PTW'.padStart(8) + 'Old'.padStart(6) + 'New'.padStart(6));
  console.log('='.repeat(70));

  for (const vehicle of vehicles) {
    const data = hpData.vehicles[vehicle.id];

    if (!data) {
      console.log(`${vehicle.id.padEnd(25)} ⚠️  No HP data`);
      missing++;
      continue;
    }

    const ptw = (data.hp / vehicle.weight) * 1000;
    const newScore = calculatePtwScore(data.hp, vehicle.weight);
    const oldScore = vehicle.performance;
    const diff = newScore - oldScore;

    if (Math.abs(diff) > 0.1) {
      const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
      console.log(
        `${vehicle.id.padEnd(25)}${data.hp.toString().padStart(6)}${vehicle.weight.toString().padStart(8)}${ptw.toFixed(1).padStart(8)}${oldScore.toString().padStart(6)}${newScore.toString().padStart(6)}  (${diffStr})`
      );

      vehicle.performance = newScore;
      updated++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Updated: ${updated}`);
  console.log(`Missing data: ${missing}`);

  if (!dryRun && updated > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
