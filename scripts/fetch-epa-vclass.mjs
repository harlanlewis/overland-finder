#!/usr/bin/env node
/**
 * Fetch EPA VClass (vehicle class) data for size classification
 *
 * Usage: node scripts/fetch-epa-vclass.mjs
 *
 * Saves results to scripts/epa-vclass-data.json
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const OUTPUT_PATH = join(__dirname, 'epa-vclass-data.json');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Model name mappings for EPA API
const modelMappings = {
  '4Runner': '4Runner',
  'Land Cruiser': 'Land Cruiser',
  'GX 550': 'GX',
  'GX 460': 'GX 460',
  'GX 470': 'GX 470',
  'Sequoia': 'Sequoia',
  'LX 600': 'LX',
  'LX 570': 'LX 570',
  'FJ Cruiser': 'FJ Cruiser',
  'Defender': 'Defender',
  'LR4': 'LR4',
  'Discovery': 'Discovery',
  'Range Rover Sport': 'Range Rover Sport',
  'Range Rover': 'Range Rover',
  'Grand Cherokee': 'Grand Cherokee',
  'Grand Wagoneer': 'Grand Wagoneer',
  'Wagoneer': 'Wagoneer',
  'Wrangler': 'Wrangler',
  'Bronco': 'Bronco',
  'Expedition': 'Expedition',
  'Excursion': 'Excursion',
  'Tahoe': 'Tahoe',
  'Yukon': 'Yukon',
  'Suburban': 'Suburban',
  'Escalade': 'Escalade',
  'GLE': 'GLE-Class',
  'GLS': 'GLS-Class',
  'G 550': 'G-Class',
  'G 580': 'G-Class',
  'G 63': 'G-Class',
  'G-Wagen': 'G-Class',
  'X5': 'X5',
  'X7': 'X7',
  'XM': 'XM',
  'iX': 'iX',
  'Cayenne': 'Cayenne',
  'RS Q8': 'RS Q8',
  'SQ8': 'SQ8',
  'Q8': 'Q8',
  'R1S': 'R1S',
  'Hummer EV': 'Hummer EV',
  'Cybertruck': 'Cybertruck',
  'Model X': 'Model X',
  'EQS SUV': 'EQS SUV',
  'Outlander': 'Outlander',
  'Montero Sport': 'Montero Sport',
  'Montero': 'Montero',
  'XC90': 'XC90',
  'EX90': 'EX90',
  'GV80': 'GV80',
  'Xterra': 'Xterra',
  'Pathfinder': 'Pathfinder',
  'Patrol': 'Patrol',
  'H2': 'H2',
  'Trooper': 'Trooper',
};

function extractModel(name) {
  for (const [pattern, epaModel] of Object.entries(modelMappings)) {
    if (name.includes(pattern)) {
      return epaModel;
    }
  }
  return null;
}

function extractYear(vehicle) {
  // Use yearStart for current production, or yearEnd for used
  if (vehicle.yearEnd === null) {
    // Current production - use a recent year
    return vehicle.yearStart || 2024;
  }
  // Used vehicle - use last year of production
  return vehicle.yearEnd || vehicle.yearStart || 2020;
}

async function fetchVClass(make, model, year) {
  try {
    // Get model variations for this year
    const modelsUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year=${year}&make=${encodeURIComponent(make)}`;
    const modelsRes = await fetch(modelsUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!modelsRes.ok) return null;

    const modelsData = await modelsRes.json();
    if (!modelsData.menuItem) return null;

    const items = Array.isArray(modelsData.menuItem) ? modelsData.menuItem : [modelsData.menuItem];

    // Find matching model (prefer 4WD/AWD)
    const variants = items.filter(item =>
      item.value.toLowerCase().includes(model.toLowerCase())
    );

    if (variants.length === 0) return null;

    const preferredVariant = variants.find(v =>
      v.value.includes('4WD') || v.value.includes('AWD')
    ) || variants[0];

    // Get vehicle options
    const optionsUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(preferredVariant.value)}`;
    const optionsRes = await fetch(optionsUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!optionsRes.ok) return null;

    const optionsData = await optionsRes.json();
    if (!optionsData.menuItem) return null;

    const options = Array.isArray(optionsData.menuItem) ? optionsData.menuItem : [optionsData.menuItem];
    if (options.length === 0) return null;

    // Get first vehicle's full data
    const vehicleId = options[0].value;
    const vehicleUrl = `https://www.fueleconomy.gov/ws/rest/vehicle/${vehicleId}`;
    const vehicleRes = await fetch(vehicleUrl, {
      headers: { 'Accept': 'application/json' }
    });

    if (!vehicleRes.ok) return null;

    const data = await vehicleRes.json();

    return {
      vclass: data.VClass,
      make: data.make,
      model: data.model,
      year: data.year,
      epaId: vehicleId,
    };
  } catch (err) {
    console.error(`  Error: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('Fetching EPA VClass data for size classification...\n');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));
  const results = {};
  const errors = [];

  for (const vehicle of vehicles) {
    const model = extractModel(vehicle.name);
    const year = extractYear(vehicle);

    console.log(`[${vehicle.id}] ${vehicle.name}`);

    if (!model) {
      console.log('  ⚠️  Could not extract model');
      errors.push({ id: vehicle.id, error: 'No model mapping' });
      continue;
    }

    console.log(`  Searching: ${vehicle.make} ${model} ${year}`);

    const data = await fetchVClass(vehicle.make, model, year);

    if (data) {
      console.log(`  ✓ VClass: ${data.vclass}`);
      results[vehicle.id] = {
        vclass: data.vclass,
        epaModel: data.model,
        epaYear: data.year,
        currentSize: vehicle.size,
      };
    } else {
      console.log('  ✗ No EPA data found');
      errors.push({ id: vehicle.id, error: 'EPA lookup failed' });
    }

    await sleep(300); // Rate limit
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Found: ${Object.keys(results).length}/${vehicles.length}`);
  console.log(`Missing: ${errors.length}/${vehicles.length}`);

  // Show VClass distribution
  const vclassCounts = {};
  for (const r of Object.values(results)) {
    vclassCounts[r.vclass] = (vclassCounts[r.vclass] || 0) + 1;
  }
  console.log('\nVClass distribution:');
  for (const [vclass, count] of Object.entries(vclassCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${vclass}: ${count}`);
  }

  // Save results
  writeFileSync(OUTPUT_PATH, JSON.stringify({ results, errors, vclassCounts }, null, 2));
  console.log(`\nResults saved to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
