#!/usr/bin/env node
/**
 * Calculate off-road scores based on features
 *
 * Scoring formula:
 * - 4WD system: awd=1, full_time=2, part_time=2, selectable=3
 * - Low range: +2
 * - Front locker: +1
 * - Center locker: +1
 * - Rear locker: +1.5
 * - Ground clearance: <8"=0, 8-9"=1, 9-10"=2, 10-11"=2.5, 11+"=3
 *
 * Max possible: 3 + 2 + 1 + 1 + 1.5 + 3 = 11.5 → normalized to 10
 *
 * Usage: node scripts/calculate-offroad-scores.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const FEATURES_PATH = join(__dirname, 'offroad-features.json');

const dryRun = process.argv.includes('--dry-run');

const SYSTEM_SCORES = {
  'awd': 1,
  'full_time': 2,
  'part_time': 2,
  'selectable': 3,
};

function getGcBonus(gc) {
  if (gc >= 11) return 3;
  if (gc >= 10) return 2.5;
  if (gc >= 9) return 2;
  if (gc >= 8) return 1;
  return 0;
}

function calculateScore(vehicle, features) {
  let raw = 0;

  // 4WD system type
  raw += SYSTEM_SCORES[features.system] || 0;

  // Low range
  if (features.low_range) raw += 2;

  // Lockers
  if (features.locker_front) raw += 1;
  if (features.locker_center) raw += 1;
  if (features.locker_rear) raw += 1.5;

  // Ground clearance bonus
  raw += getGcBonus(vehicle.gc);

  // Normalize: use softer scale so capable vehicles score well
  // raw ~6 (part-time, low range, rear locker, good gc) → ~7
  // raw ~10 (full setup with lockers) → ~9.5
  // Formula: 2 + (raw / 10) * 8, capped at 10
  const normalized = Math.min(10, Math.max(1, 2 + (raw / 10) * 8));

  return Math.round(normalized * 2) / 2; // Round to nearest 0.5
}

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const featuresData = JSON.parse(readFileSync(FEATURES_PATH, 'utf-8'));

  let updated = 0;
  let missing = 0;

  console.log('Vehicle ID'.padEnd(25) + 'Old'.padStart(6) + 'New'.padStart(6) + '  Features');
  console.log('='.repeat(80));

  for (const vehicle of vehicles) {
    const features = featuresData.vehicles[vehicle.id];

    if (!features) {
      console.log(`${vehicle.id.padEnd(25)} ⚠️  No feature data`);
      missing++;
      continue;
    }

    const newScore = calculateScore(vehicle, features);
    const oldScore = vehicle.offroad;
    const diff = newScore - oldScore;

    if (Math.abs(diff) > 0.1) {
      const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
      const featureStr = [
        features.system,
        features.low_range ? 'LR' : '',
        features.locker_front ? 'LF' : '',
        features.locker_center ? 'LC' : '',
        features.locker_rear ? 'LR' : '',
        `GC:${vehicle.gc}"`,
      ].filter(Boolean).join(', ');

      console.log(
        `${vehicle.id.padEnd(25)}${oldScore.toString().padStart(6)}${newScore.toString().padStart(6)}  (${diffStr}) ${featureStr}`
      );

      vehicle.offroad = newScore;
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
