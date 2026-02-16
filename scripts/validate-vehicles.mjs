#!/usr/bin/env node
/**
 * Vehicle Data Validation Script
 * Run: node scripts/validate-vehicles.mjs
 * Use --fix to auto-fix certain issues
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesPath = join(__dirname, '..', 'src', 'vehicles.json');
const vehicles = JSON.parse(readFileSync(vehiclesPath, 'utf-8'));

const CURRENT_YEAR = new Date().getFullYear();
const errors = [];
const warnings = [];

// Load supplementary data for cross-validation
const loadJson = (path) => {
  try {
    return JSON.parse(readFileSync(join(__dirname, path), 'utf-8'));
  } catch { return null; }
};

const offroadFeatures = loadJson('offroad-features.json');
const luxuryFeatures = loadJson('luxury-features.json');
const horsepowerData = loadJson('horsepower-data.json');
const manualSpecs = loadJson('manual-specs.json');
const verifiedUpdates = loadJson('verified-updates.json');

console.log('Validating vehicle data...\n');

// 1. Check for duplicate IDs
const ids = new Set();
vehicles.forEach(v => {
  if (ids.has(v.id)) {
    errors.push(`Duplicate ID: ${v.id}`);
  }
  ids.add(v.id);
});

// 2. Check for overlapping same-trim entries (potential duplicates)
const byModelTrimGen = new Map();
vehicles.forEach(v => {
  const key = `${v.make}|${v.model}|${v.trim}|${v.generation}`;
  if (!byModelTrimGen.has(key)) byModelTrimGen.set(key, []);
  byModelTrimGen.get(key).push(v);
});

byModelTrimGen.forEach((entries, key) => {
  if (entries.length > 1) {
    // Check for overlapping year ranges
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i], b = entries[j];
        const aEnd = a.yearEnd || CURRENT_YEAR + 1;
        const bEnd = b.yearEnd || CURRENT_YEAR + 1;
        const overlap = !(aEnd < b.yearStart || bEnd < a.yearStart);
        if (overlap) {
          errors.push(`Overlapping years: ${key}\n` +
            `  ${a.id} (${a.yearStart}-${a.yearEnd || 'present'})\n` +
            `  ${b.id} (${b.yearStart}-${b.yearEnd || 'present'})`);
        }
      }
    }
  }
});

// 3. Required fields validation
const required = ['id', 'make', 'model', 'yearStart', 'price', 'offroad', 'luxury', 'reliability', 'size', 'pt'];
vehicles.forEach(v => {
  required.forEach(field => {
    if (v[field] === undefined || v[field] === null || v[field] === '') {
      if (field !== 'trim') { // trim can be null
        errors.push(`${v.id}: Missing required field '${field}'`);
      }
    }
  });
});

// 4. Value range validation
vehicles.forEach(v => {
  if (v.offroad < 0 || v.offroad > 10) errors.push(`${v.id}: offroad ${v.offroad} out of range [0-10]`);
  if (v.luxury < 0 || v.luxury > 10) errors.push(`${v.id}: luxury ${v.luxury} out of range [0-10]`);
  if (v.reliability < 0 || v.reliability > 10) errors.push(`${v.id}: reliability ${v.reliability} out of range [0-10]`);
  if (v.performance && (v.performance < 0 || v.performance > 10)) errors.push(`${v.id}: performance ${v.performance} out of range [0-10]`);
  if (v.price < 0 || v.price > 500) warnings.push(`${v.id}: price $${v.price}k seems unusual`);
  if (v.yearStart < 1980 || v.yearStart > CURRENT_YEAR + 1) errors.push(`${v.id}: yearStart ${v.yearStart} seems invalid`);
  if (v.yearEnd && v.yearEnd < v.yearStart) errors.push(`${v.id}: yearEnd ${v.yearEnd} before yearStart ${v.yearStart}`);
  // condition field removed - years are sufficient
  if (!['gas', 'diesel', 'hybrid', 'phev', 'ev'].includes(v.pt)) errors.push(`${v.id}: invalid powertrain '${v.pt}'`);
  if (!['compact', 'mid', 'full'].includes(v.size)) errors.push(`${v.id}: invalid size '${v.size}'`);
});

// 5. Cross-reference with supplementary data
if (offroadFeatures?.vehicles) {
  vehicles.forEach(v => {
    if (!offroadFeatures.vehicles[v.id]) {
      warnings.push(`${v.id}: Missing from offroad-features.json`);
    }
  });
  Object.keys(offroadFeatures.vehicles).forEach(id => {
    if (!ids.has(id)) {
      warnings.push(`offroad-features.json has orphan entry: ${id}`);
    }
  });
}

if (luxuryFeatures?.vehicles) {
  vehicles.forEach(v => {
    if (!luxuryFeatures.vehicles[v.id]) {
      warnings.push(`${v.id}: Missing from luxury-features.json`);
    }
  });
}

if (horsepowerData?.vehicles) {
  vehicles.forEach(v => {
    if (!horsepowerData.vehicles[v.id]) {
      warnings.push(`${v.id}: Missing from horsepower-data.json`);
    }
  });
}

// 6. Logical consistency checks
vehicles.forEach(v => {
  // High offroad score should have supporting features
  if (offroadFeatures?.vehicles?.[v.id]) {
    const features = offroadFeatures.vehicles[v.id];
    if (v.offroad >= 8 && !features.low_range && features.system === 'awd') {
      warnings.push(`${v.id}: High offroad (${v.offroad}) but AWD-only with no low range`);
    }
  }

  // yearEnd=null means still in production
  // yearEnd set means no longer sold new (historical/used market)
});

// Summary
console.log('=' .repeat(60));
console.log('VALIDATION RESULTS');
console.log('=' .repeat(60));

if (errors.length > 0) {
  console.log(`\n${errors.length} ERROR(S):`);
  errors.forEach(e => console.log(`  [ERROR] ${e}`));
}

if (warnings.length > 0) {
  console.log(`\n${warnings.length} WARNING(S):`);
  warnings.forEach(w => console.log(`  [WARN] ${w}`));
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('\nAll checks passed!');
}

console.log(`\nTotal vehicles: ${vehicles.length}`);
console.log(`Errors: ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);

// Exit code for CI
process.exit(errors.length > 0 ? 1 : 0);
