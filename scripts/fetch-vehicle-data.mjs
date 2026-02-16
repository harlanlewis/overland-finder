#!/usr/bin/env node
/**
 * Vehicle data sourcing script
 *
 * Sources:
 * - EPA fueleconomy.gov API for MPG data
 *
 * Usage: node scripts/fetch-vehicle-data.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');

// Rate limiting
const DELAY_MS = 2000;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/**
 * Parse vehicle name to extract year, make, model info
 */
function parseVehicleName(name) {
  // Handle formats like:
  // "2025 Toyota 4Runner TRD Pro"
  // "5th Gen 4Runner TRD Pro (2015-2024)"
  // "Land Cruiser 200 Series (2008-2021)"
  // "Lexus GX 460 (2010-2023)"

  let year, make, model, isUsed = false;

  // Check for year range pattern (used vehicles)
  const yearRangeMatch = name.match(/\((\d{4})-(\d{4})\)/);
  if (yearRangeMatch) {
    // Use the end year for lookup
    year = parseInt(yearRangeMatch[2]);
    isUsed = true;
  }

  // Check for leading year (new vehicles)
  const leadingYearMatch = name.match(/^(\d{4})\s+/);
  if (leadingYearMatch) {
    year = parseInt(leadingYearMatch[1]);
  }

  return { year, isUsed, rawName: name };
}

/**
 * Build EPA API search params from vehicle data
 */
function buildEpaSearchParams(vehicle) {
  const { year, make, name } = vehicle;

  // Normalize make names for EPA API
  const epaMAkeMap = {
    'Land Rover': 'Land Rover',
    'Mercedes-Benz': 'Mercedes-Benz',
    'Chevrolet': 'Chevrolet',
    'GMC': 'GMC',
    'Cadillac': 'Cadillac',
    'Lexus': 'Lexus',
    'Toyota': 'Toyota',
    'Jeep': 'Jeep',
    'Ford': 'Ford',
    'BMW': 'BMW',
    'Audi': 'Audi',
    'Porsche': 'Porsche',
    'Volvo': 'Volvo',
    'Rivian': 'Rivian',
    'Tesla': 'Tesla',
    'Genesis': 'Genesis',
    'Nissan': 'Nissan',
    'Mitsubishi': 'Mitsubishi',
    'Isuzu': 'Isuzu',
    'Hummer': 'Hummer',
  };

  // Extract model from name
  // E.g., "2025 Toyota 4Runner TRD Pro" -> "4Runner"
  let model = null;
  if (name.includes('4Runner')) model = '4Runner';
  else if (name.includes('Land Cruiser')) model = 'Land Cruiser';
  else if (name.includes('GX 550') || name.includes('GX550')) model = 'GX';
  else if (name.includes('GX 460') || name.includes('GX460')) model = 'GX 460';
  else if (name.includes('GX 470') || name.includes('GX470')) model = 'GX 470';
  else if (name.includes('Sequoia')) model = 'Sequoia';
  else if (name.includes('LX 600') || name.includes('LX600')) model = 'LX';
  else if (name.includes('LX 570') || name.includes('LX570')) model = 'LX 570';
  else if (name.includes('FJ Cruiser')) model = 'FJ Cruiser';
  else if (name.includes('Defender')) model = 'Defender';
  else if (name.includes('Discovery')) model = 'Discovery';
  else if (name.includes('Range Rover Sport')) model = 'Range Rover Sport';
  else if (name.includes('Range Rover')) model = 'Range Rover';
  else if (name.includes('Grand Cherokee')) model = 'Grand Cherokee';
  else if (name.includes('Wagoneer') && name.includes('Grand')) model = 'Grand Wagoneer';
  else if (name.includes('Wagoneer')) model = 'Wagoneer';
  else if (name.includes('Wrangler')) model = 'Wrangler';
  else if (name.includes('Bronco')) model = 'Bronco';
  else if (name.includes('Expedition')) model = 'Expedition';
  else if (name.includes('Excursion')) model = 'Excursion';
  else if (name.includes('Tahoe')) model = 'Tahoe';
  else if (name.includes('Yukon')) model = 'Yukon';
  else if (name.includes('Suburban')) model = 'Suburban';
  else if (name.includes('Escalade')) model = 'Escalade';
  else if (name.includes('GLE')) model = 'GLE';
  else if (name.includes('GLS')) model = 'GLS';
  else if (name.includes('G-Wagen') || name.includes('G 550') || name.includes('G 580') || name.includes('G 63')) model = 'G-Class';
  else if (name.includes('X5')) model = 'X5';
  else if (name.includes('X7')) model = 'X7';
  else if (name.includes('XM')) model = 'XM';
  else if (name.includes('iX')) model = 'iX';
  else if (name.includes('Cayenne')) model = 'Cayenne';
  else if (name.includes('Q8') && name.includes('RS')) model = 'RS Q8';
  else if (name.includes('SQ8')) model = 'SQ8';
  else if (name.includes('Q8')) model = 'Q8';
  else if (name.includes('R1S')) model = 'R1S';
  else if (name.includes('Hummer EV')) model = 'Hummer EV';
  else if (name.includes('Cybertruck')) model = 'Cybertruck';
  else if (name.includes('Model X')) model = 'Model X';
  else if (name.includes('EQS SUV')) model = 'EQS SUV';
  else if (name.includes('Outlander')) model = 'Outlander';
  else if (name.includes('Montero Sport')) model = 'Montero Sport';
  else if (name.includes('Montero')) model = 'Montero';
  else if (name.includes('XC90')) model = 'XC90';
  else if (name.includes('EX90')) model = 'EX90';
  else if (name.includes('GV80')) model = 'GV80';
  else if (name.includes('Xterra')) model = 'Xterra';
  else if (name.includes('Pathfinder')) model = 'Pathfinder';
  else if (name.includes('Patrol')) model = 'Patrol';
  else if (name.includes('H2')) model = 'H2';
  else if (name.includes('Trooper')) model = 'Trooper';

  // Parse year from name
  const parsed = parseVehicleName(name);
  const searchYear = parsed.year || 2024; // default to 2024 for lookups

  return { make, model, year: searchYear };
}

/**
 * Fetch MPG data from EPA API
 */
async function fetchEpaMpg(make, model, year) {
  try {
    // First, get the model variations for this year
    const modelsUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${encodeURIComponent(make)}`;
    const modelsRes = await fetch(modelsUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!modelsRes.ok) return null;

    const modelsData = await modelsRes.json();
    if (!modelsData.menuItem) return null;

    const items = Array.isArray(modelsData.menuItem) ? modelsData.menuItem : [modelsData.menuItem];

    // Find matching model variations (prefer 4WD/AWD)
    const modelVariants = items.filter(item =>
      item.value.toLowerCase().includes(model.toLowerCase())
    );

    if (modelVariants.length === 0) return null;

    // Prefer 4WD variant
    const preferredVariant = modelVariants.find(v =>
      v.value.includes('4WD') || v.value.includes('AWD')
    ) || modelVariants[0];

    // Get vehicle options/IDs
    const optionsUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(preferredVariant.value)}`;
    const optionsRes = await fetch(optionsUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!optionsRes.ok) return null;

    const optionsData = await optionsRes.json();
    if (!optionsData.menuItem) return null;

    const options = Array.isArray(optionsData.menuItem) ? optionsData.menuItem : [optionsData.menuItem];
    if (options.length === 0) return null;

    // Get the first vehicle's full data
    const vehicleId = options[0].value;
    const vehicleUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`;
    const vehicleRes = await fetch(vehicleUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!vehicleRes.ok) return null;

    const vehicleData = await vehicleRes.json();

    return {
      mpgCity: parseInt(vehicleData.city08) || null,
      mpgHighway: parseInt(vehicleData.highway08) || null,
      mpgCombined: parseInt(vehicleData.comb08) || null,
      fuelType: vehicleData.fuelType1,
      cylinders: vehicleData.cylinders,
      displacement: vehicleData.displ,
      drive: vehicleData.drive,
      vehicleClass: vehicleData.VClass,
      epaId: vehicleId,
    };
  } catch (err) {
    console.error(`EPA API error for ${make} ${model} ${year}:`, err.message);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('Loading vehicles...');
  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));

  console.log(`Processing ${vehicles.length} vehicles...\n`);

  const results = [];
  const errors = [];

  // Process in batches to avoid rate limiting
  for (const vehicle of vehicles) {
    const { make, model, year } = buildEpaSearchParams(vehicle);

    console.log(`\n[${vehicle.id}] ${vehicle.name}`);
    console.log(`  Searching: ${make} ${model} ${year}`);

    if (!model) {
      console.log('  ⚠️  Could not determine model, skipping');
      errors.push({ id: vehicle.id, name: vehicle.name, error: 'Could not parse model' });
      continue;
    }

    // Fetch EPA data
    const epaData = await fetchEpaMpg(make, model, year);

    if (epaData) {
      console.log(`  ✓ EPA: ${epaData.mpgCombined} MPG combined (${epaData.mpgCity}/${epaData.mpgHighway} city/hwy)`);
      results.push({
        id: vehicle.id,
        name: vehicle.name,
        currentMpg: vehicle.mpg,
        epaMpg: epaData.mpgCombined,
        epaData,
      });
    } else {
      console.log('  ✗ EPA: No data found');
      errors.push({ id: vehicle.id, name: vehicle.name, error: 'EPA lookup failed' });
    }

    await sleep(500); // Rate limit
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nSuccessful lookups: ${results.length}/${vehicles.length}`);
  console.log(`Failed lookups: ${errors.length}/${vehicles.length}`);

  if (results.length > 0) {
    console.log('\n--- MPG Updates ---');
    for (const r of results) {
      const diff = r.epaMpg - r.currentMpg;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
      console.log(`${r.id}: ${r.currentMpg} → ${r.epaMpg} (${diffStr})`);
    }
  }

  if (errors.length > 0) {
    console.log('\n--- Errors ---');
    for (const e of errors) {
      console.log(`${e.id}: ${e.error}`);
    }
  }

  // Write results to a JSON file for review
  const outputPath = join(__dirname, 'vehicle-data-results.json');
  writeFileSync(outputPath, JSON.stringify({ results, errors }, null, 2));
  console.log(`\nResults written to: ${outputPath}`);
}

main().catch(console.error);
