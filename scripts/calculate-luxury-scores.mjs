#!/usr/bin/env node
/**
 * Calculate luxury scores based on feature data
 *
 * Formula:
 *   raw = brand_tier + interior + features + tech + quietness
 *   score = 1 + (raw / 10.5) * 9   // Normalized to 1-10
 *
 * Usage: node scripts/calculate-luxury-scores.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const FEATURES_PATH = join(__dirname, 'luxury-features.json');

const dryRun = process.argv.includes('--dry-run');

// Brand tiers
const BRAND_TIERS = {
  // Luxury (3)
  'Land Rover': 3,
  'Mercedes-Benz': 3,
  'BMW': 3,
  'Porsche': 3,
  'Lexus': 3,
  'Lincoln': 3,
  'Genesis': 3,
  'Cadillac': 3,
  // Premium (1.5)
  'Audi': 1.5,
  'Volvo': 1.5,
  'Acura': 1.5,
  'Infiniti': 1.5,
  'Rivian': 1.5,
  'Tesla': 1.5,
  // Mainstream (0)
  'Toyota': 0,
  'Ford': 0,
  'Jeep': 0,
  'Chevrolet': 0,
  'GMC': 0,
  'Honda': 0,
  'Nissan': 0,
  'Subaru': 0,
  'Hyundai': 0,
  'Kia': 0,
  'Mitsubishi': 0,
  'Isuzu': 0,
  'Hummer': 0,
  'Dodge': 0,
  'Mazda': 0,
  'Ineos': 0,
  'Volkswagen': 0,
  'Ram': 0,
  'Suzuki': 0,
  'Geo': 0,
};

// Interior scores
const INTERIOR_SCORES = {
  'cloth': 0,
  'leatherette': 0.5,
  'leather': 1,
  'premium_leather': 1.5,
};

// Feature points
const FEATURE_POINTS = {
  'ventilated_seats': 0.5,
  'massage_seats': 0.5,
  'premium_audio': 0.5,
  'air_suspension': 1,
  'pano_roof': 0.5,
};

// Tech points
const TECH_POINTS = {
  'large_display': 0.5,
  'digital_cluster': 0.5,
  'hud': 0.5,
};

// Quietness tiers
const QUIETNESS_SCORES = {
  'loud': 0,
  'average': 0.5,
  'quiet': 1,
  'very_quiet': 1.5,
};

function calculateLuxuryScore(vehicle, featureData) {
  let raw = 0;

  // Brand tier
  const brandTier = BRAND_TIERS[vehicle.make] ?? 0;
  raw += brandTier;

  // Interior
  const interiorScore = INTERIOR_SCORES[featureData.interior] ?? 0;
  raw += interiorScore;

  // Features
  let featureScore = 0;
  for (const feature of featureData.features || []) {
    featureScore += FEATURE_POINTS[feature] ?? 0;
  }
  raw += featureScore;

  // Tech
  let techScore = 0;
  for (const tech of featureData.tech || []) {
    techScore += TECH_POINTS[tech] ?? 0;
  }
  raw += techScore;

  // Quietness
  const quietnessScore = QUIETNESS_SCORES[featureData.quietness] ?? 0;
  raw += quietnessScore;

  // Normalize to 1-10 scale
  // Max possible: 3 (brand) + 1.5 (interior) + 3 (features) + 1.5 (tech) + 1.5 (quietness) = 10.5
  // Using 10.5 as divisor to properly cap at 10
  const score = 1 + (raw / 10.5) * 9;

  return {
    raw,
    score: Math.round(score * 10) / 10, // Round to 1 decimal
    breakdown: {
      brand: brandTier,
      interior: interiorScore,
      features: featureScore,
      tech: techScore,
      quietness: quietnessScore,
    },
  };
}

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const featuresData = JSON.parse(readFileSync(FEATURES_PATH, 'utf-8'));

  let updated = 0;
  let unchanged = 0;
  let noData = 0;

  const results = [];

  for (const vehicle of vehicles) {
    const features = featuresData[vehicle.id];

    if (!features || features._meta) {
      console.log(`[${vehicle.id}] ⚠️ No feature data`);
      noData++;
      continue;
    }

    const { raw, score, breakdown } = calculateLuxuryScore(vehicle, features);
    const oldScore = vehicle.luxury;
    const diff = score - oldScore;

    results.push({
      id: vehicle.id,
      name: vehicle.name,
      make: vehicle.make,
      oldScore,
      newScore: score,
      diff,
      breakdown,
    });

    if (Math.abs(diff) >= 0.1) {
      console.log(`[${vehicle.id}] ${oldScore} → ${score} (${diff > 0 ? '+' : ''}${diff.toFixed(1)})`);
      console.log(`  Brand: ${breakdown.brand} | Interior: ${breakdown.interior} | Features: ${breakdown.features} | Tech: ${breakdown.tech} | Quiet: ${breakdown.quietness}`);
      vehicle.luxury = score;
      updated++;
    } else {
      unchanged++;
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Updated:   ${updated}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`No data:   ${noData}`);
  console.log(`Total:     ${vehicles.length}`);

  // Show top 10 and bottom 10
  results.sort((a, b) => b.newScore - a.newScore);
  console.log(`\nTOP 10 LUXURY:`);
  for (const r of results.slice(0, 10)) {
    console.log(`  ${r.newScore.toFixed(1)} - ${r.name} (${r.make})`);
  }
  console.log(`\nBOTTOM 10 LUXURY:`);
  for (const r of results.slice(-10).reverse()) {
    console.log(`  ${r.newScore.toFixed(1)} - ${r.name} (${r.make})`);
  }

  if (!dryRun && updated > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
