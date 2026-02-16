#!/usr/bin/env node
/**
 * Fetch vehicle specs from NHTSA Canadian Vehicle Specifications API
 *
 * Retrieves: Curb weight (most reliable), dimensions
 * API: https://vpic.nhtsa.dot.gov/api/
 *
 * Usage: node scripts/fetch-nhtsa-specs.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');
const RESULTS_PATH = join(__dirname, 'nhtsa-results.json');

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Map our vehicle data to NHTSA search params
const VEHICLE_NHTSA_MAP = {
  // Toyota
  '4runner': { make: 'Toyota', model: '4Runner', year: 2025 },
  '4runner_ltd': { make: 'Toyota', model: '4Runner', year: 2025 },
  '4runner_trd_orp': { make: 'Toyota', model: '4Runner', year: 2025 },
  'runner_sr5': { make: 'Toyota', model: '4Runner', year: 2025 },
  'runner_venture': { make: 'Toyota', model: '4Runner', year: 2025 },
  'land_cruiser': { make: 'Toyota', model: 'Land Cruiser', year: 2025 },
  'sequoia': { make: 'Toyota', model: 'Sequoia', year: 2025 },

  // Lexus
  'gx550': { make: 'Lexus', model: 'GX', year: 2025 },
  'gx550_ot': { make: 'Lexus', model: 'GX', year: 2025 },
  'gx460': { make: 'Lexus', model: 'GX 460', year: 2023 },
  'lx600': { make: 'Lexus', model: 'LX', year: 2025 },
  'lx570': { make: 'Lexus', model: 'LX 570', year: 2021 },

  // Jeep
  'wrangler_jl': { make: 'Jeep', model: 'Wrangler', year: 2025 },
  'wrangler_4xe': { make: 'Jeep', model: 'Wrangler', year: 2025 },
  'wrangler_jk': { make: 'Jeep', model: 'Wrangler', year: 2018 },
  'grand_cherokee': { make: 'Jeep', model: 'Grand Cherokee', year: 2025 },
  'grand_cherokee_4xe': { make: 'Jeep', model: 'Grand Cherokee', year: 2025 },
  'grand_wagoneer': { make: 'Jeep', model: 'Grand Wagoneer', year: 2025 },
  'wagoneer': { make: 'Jeep', model: 'Wagoneer', year: 2025 },

  // Ford
  'bronco': { make: 'Ford', model: 'Bronco', year: 2025 },
  'bronco_raptor': { make: 'Ford', model: 'Bronco', year: 2025 },
  'expedition': { make: 'Ford', model: 'Expedition', year: 2025 },

  // Chevrolet/GMC/Cadillac
  'tahoe': { make: 'Chevrolet', model: 'Tahoe', year: 2025 },
  'suburban': { make: 'Chevrolet', model: 'Suburban', year: 2025 },
  'yukon': { make: 'GMC', model: 'Yukon', year: 2025 },
  'yukon_at4': { make: 'GMC', model: 'Yukon', year: 2025 },
  'escalade': { make: 'Cadillac', model: 'Escalade', year: 2025 },

  // Land Rover
  'defender': { make: 'Land Rover', model: 'Defender', year: 2025 },
  'defender_130': { make: 'Land Rover', model: 'Defender', year: 2025 },
  'discovery': { make: 'Land Rover', model: 'Discovery', year: 2025 },
  'rr_sport': { make: 'Land Rover', model: 'Range Rover Sport', year: 2025 },
  'rr_full': { make: 'Land Rover', model: 'Range Rover', year: 2025 },

  // Mercedes
  'gls': { make: 'Mercedes-Benz', model: 'GLS', year: 2025 },
  'gle': { make: 'Mercedes-Benz', model: 'GLE', year: 2025 },
  'gwagen': { make: 'Mercedes-Benz', model: 'G', year: 2025 },

  // BMW
  'x5': { make: 'BMW', model: 'X5', year: 2025 },
  'x7': { make: 'BMW', model: 'X7', year: 2025 },
  'ix': { make: 'BMW', model: 'iX', year: 2025 },

  // Porsche
  'cayenne': { make: 'Porsche', model: 'Cayenne', year: 2025 },
  'cayenne_ehybrid': { make: 'Porsche', model: 'Cayenne', year: 2025 },

  // Audi
  'q8': { make: 'Audi', model: 'Q8', year: 2025 },
  'sq8': { make: 'Audi', model: 'SQ8', year: 2025 },
  'rsq8': { make: 'Audi', model: 'RS Q8', year: 2025 },

  // Rivian
  'r1s': { make: 'Rivian', model: 'R1S', year: 2025 },

  // Volvo
  'xc90': { make: 'Volvo', model: 'XC90', year: 2025 },

  // Genesis
  'gv80': { make: 'Genesis', model: 'GV80', year: 2025 },

  // Nissan
  'pathfinder': { make: 'Nissan', model: 'Pathfinder', year: 2025 },

  // Mitsubishi
  'outlander': { make: 'Mitsubishi', model: 'Outlander', year: 2025 },

  // Tesla
  'model_x': { make: 'Tesla', model: 'Model X', year: 2025 },
  'cybertruck': { make: 'Tesla', model: 'Cybertruck', year: 2025 },

  // GMC Hummer
  'hummer_ev': { make: 'GMC', model: 'Hummer EV', year: 2025 },
};

/**
 * Fetch specs from NHTSA Canadian Vehicle Specifications API
 */
async function fetchNhtsaSpecs(make, model, year) {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/GetCanadianVehicleSpecifications/?Year=${year}&Make=${encodeURIComponent(make)}&Model=${encodeURIComponent(model)}&format=json`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.Results || data.Results.length === 0) return null;

    // Get first result (usually base model)
    const specs = data.Results[0].Specs;
    const result = {};

    for (const spec of specs) {
      result[spec.Name] = spec.Value;
    }

    // Convert curb weight from kg to lbs
    if (result.CW) {
      result.curbWeightKg = parseInt(result.CW);
      result.curbWeightLbs = Math.round(parseInt(result.CW) * 2.20462);
    }

    return result;
  } catch (err) {
    console.error(`NHTSA error for ${make} ${model} ${year}:`, err.message);
    return null;
  }
}

async function main() {
  console.log('Loading vehicles...');
  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));

  console.log(`Processing ${vehicles.length} vehicles...\n`);

  const results = [];
  const errors = [];

  for (const vehicle of vehicles) {
    const mapping = VEHICLE_NHTSA_MAP[vehicle.id];

    console.log(`\n[${vehicle.id}] ${vehicle.name}`);

    if (!mapping) {
      console.log('  ⚠️  No NHTSA mapping, skipping');
      errors.push({ id: vehicle.id, name: vehicle.name, error: 'No mapping' });
      continue;
    }

    console.log(`  Searching: ${mapping.make} ${mapping.model} ${mapping.year}`);

    const specs = await fetchNhtsaSpecs(mapping.make, mapping.model, mapping.year);

    if (specs && specs.curbWeightLbs) {
      const diff = specs.curbWeightLbs - vehicle.weight;
      const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
      console.log(`  ✓ Weight: ${specs.curbWeightLbs} lbs (current: ${vehicle.weight}, diff: ${diffStr})`);

      results.push({
        id: vehicle.id,
        name: vehicle.name,
        currentWeight: vehicle.weight,
        nhtsaWeight: specs.curbWeightLbs,
        diff,
        rawSpecs: specs,
      });
    } else {
      console.log('  ✗ No data found');
      errors.push({ id: vehicle.id, name: vehicle.name, error: 'No NHTSA data', mapping });
    }

    await sleep(300); // Rate limit
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nSuccessful: ${results.length}/${vehicles.length}`);
  console.log(`Missing mapping or data: ${errors.length}/${vehicles.length}`);

  if (results.length > 0) {
    console.log('\n--- Weight Updates (>100 lbs diff) ---');
    const significant = results.filter(r => Math.abs(r.diff) > 100);
    for (const r of significant.slice(0, 20)) {
      const diffStr = r.diff > 0 ? `+${r.diff}` : `${r.diff}`;
      console.log(`${r.id}: ${r.currentWeight} → ${r.nhtsaWeight} (${diffStr})`);
    }
  }

  // Write results
  writeFileSync(RESULTS_PATH, JSON.stringify({ results, errors }, null, 2));
  console.log(`\nResults written to: ${RESULTS_PATH}`);
}

main().catch(console.error);
