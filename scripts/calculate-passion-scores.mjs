#!/usr/bin/env node
/**
 * Calculate passion scores based on community, aftermarket, heritage, identity, and resale data
 *
 * Formula:
 *   raw = community + aftermarket + heritage + identity + resale_premium
 *   score = 1 + (raw / 10) * 9   // Normalized to 1-10
 *   rounded = Math.round(score * 2) / 2  // Round to nearest 0.5
 *
 * Usage: node scripts/calculate-passion-scores.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const PASSION_DATA_PATH = join(__dirname, 'passion-data.json');

const dryRun = process.argv.includes('--dry-run');

function calculatePassionScore(vehicleData) {
  const raw = (vehicleData.community || 0) +
              (vehicleData.aftermarket || 0) +
              (vehicleData.heritage || 0) +
              (vehicleData.identity || 0) +
              (vehicleData.resale_premium || 0);

  // Normalize to 1-10 scale
  const score = 1 + (raw / 10) * 9;

  // Round to nearest 0.5
  const rounded = Math.round(score * 2) / 2;

  return {
    raw,
    score: rounded,
    breakdown: {
      community: vehicleData.community || 0,
      aftermarket: vehicleData.aftermarket || 0,
      heritage: vehicleData.heritage || 0,
      identity: vehicleData.identity || 0,
      resale_premium: vehicleData.resale_premium || 0,
    },
  };
}

function main() {
  console.log(dryRun ? '🔍 DRY RUN - no changes will be written\n' : '');
  console.log('Calculating passion scores...\n');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const passionData = JSON.parse(readFileSync(PASSION_DATA_PATH, 'utf-8'));

  let updated = 0;
  let unchanged = 0;
  let noData = 0;

  const results = [];

  for (const vehicle of vehicles) {
    const data = passionData[vehicle.id];

    if (!data || data._meta) {
      // Skip vehicles without passion data (will show in summary)
      noData++;
      continue;
    }

    const { raw, score, breakdown } = calculatePassionScore(data);
    const oldScore = vehicle.passion;
    const isNew = oldScore === undefined;
    const changed = isNew || oldScore !== score;

    results.push({
      id: vehicle.id,
      name: vehicle.name || `${vehicle.make} ${vehicle.model}`,
      make: vehicle.make,
      oldScore: oldScore || 0,
      newScore: score,
      raw,
      breakdown,
      isNew,
      changed,
    });

    if (changed) {
      const symbol = isNew ? '🆕' : '📝';
      console.log(`${symbol} [${vehicle.id}] ${oldScore || 'none'} → ${score}`);
      console.log(`   Community: ${breakdown.community} | Aftermarket: ${breakdown.aftermarket} | Heritage: ${breakdown.heritage} | Identity: ${breakdown.identity} | Resale: ${breakdown.resale_premium}`);
      vehicle.passion = score;
      updated++;
    } else {
      unchanged++;
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Updated:   ${updated}`);
  console.log(`⏭️  Unchanged: ${unchanged}`);
  console.log(`⚠️  No data:   ${noData}`);
  console.log(`📊 Total:     ${vehicles.length}`);

  // Show top 10 and bottom 10 (only vehicles with data)
  const scoredResults = results.filter(r => r.newScore > 0);
  scoredResults.sort((a, b) => b.newScore - a.newScore);

  if (scoredResults.length > 0) {
    console.log(`\n🔥 TOP 10 PASSION:`);
    for (const r of scoredResults.slice(0, 10)) {
      console.log(`  ${r.newScore.toFixed(1)} - ${r.name} (${r.make})`);
    }

    console.log(`\n❄️  BOTTOM 10 PASSION:`);
    for (const r of scoredResults.slice(-10).reverse()) {
      console.log(`  ${r.newScore.toFixed(1)} - ${r.name} (${r.make})`);
    }
  }

  if (!dryRun && updated > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\n💾 Wrote changes to ${VEHICLES_PATH}`);
  } else if (dryRun) {
    console.log(`\n🔍 Dry run complete - no changes written`);
  }
}

main();
