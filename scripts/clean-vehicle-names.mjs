#!/usr/bin/env node
/**
 * Clean up vehicle names to remove redundant year/generation info
 * that now exists in structured fields (yearStart, yearEnd, generation)
 *
 * Usage: node scripts/clean-vehicle-names.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VEHICLES_PATH = join(__dirname, '../src/vehicles.json');

const dryRun = process.argv.includes('--dry-run');

function cleanName(vehicle) {
  let name = vehicle.name;
  const original = name;

  // Pattern 1: Remove leading year from new vehicles (e.g., "2025 Toyota 4Runner")
  // Match: 4-digit year followed by space at start
  name = name.replace(/^20\d{2}\s+/, '');

  // Pattern 2: Remove trailing year range in parentheses (e.g., "(2015-2024)")
  name = name.replace(/\s*\(\d{4}-\d{4}\)$/, '');

  // Pattern 3: Remove generation prefix for used vehicles (e.g., "5th Gen ")
  // But only if the vehicle has a generation field set
  if (vehicle.generation) {
    // Match patterns like "5th Gen ", "2nd Gen ", "4th Gen "
    const genPrefixMatch = name.match(/^(\d+(?:st|nd|rd|th)\s+Gen)\s+/i);
    if (genPrefixMatch) {
      name = name.replace(genPrefixMatch[0], '');
    }
  }

  // Pattern 4: Remove trailing "Nth Gen" if it matches the generation field exactly
  // e.g., "Tahoe 5th Gen Z71" with generation "5th Gen" -> "Tahoe Z71"
  // But keep model-specific codes (WK2, JL, JK, 200 Series, etc.)
  if (vehicle.generation) {
    const genPattern = vehicle.generation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Only remove if it's a generic "Nth Gen" pattern
    if (/^\d+(?:st|nd|rd|th)\s+Gen$/i.test(vehicle.generation)) {
      // Remove from anywhere in the name, accounting for word boundaries
      const regex = new RegExp(`\\s*${genPattern}(?=\\s|$)`, 'i');
      name = name.replace(regex, '');
    }
  }

  // Trim any extra whitespace
  name = name.replace(/\s+/g, ' ').trim();

  return { original, cleaned: name, changed: original !== name };
}

function main() {
  console.log(dryRun ? 'DRY RUN - no changes will be written\n' : '');

  const vehicles = JSON.parse(readFileSync(VEHICLES_PATH, 'utf-8'));

  let changed = 0;
  let unchanged = 0;

  for (const vehicle of vehicles) {
    const { original, cleaned, changed: wasChanged } = cleanName(vehicle);

    if (wasChanged) {
      console.log(`[${vehicle.id}]`);
      console.log(`  OLD: ${original}`);
      console.log(`  NEW: ${cleaned}`);
      console.log(`  GEN: ${vehicle.generation} (${vehicle.yearStart}${vehicle.yearEnd ? `-${vehicle.yearEnd}` : '-present'})`);
      console.log();
      vehicle.name = cleaned;
      changed++;
    } else {
      unchanged++;
    }
  }

  console.log(`${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`Changed:   ${changed}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Total:     ${vehicles.length}`);

  if (!dryRun && changed > 0) {
    writeFileSync(VEHICLES_PATH, JSON.stringify(vehicles, null, 2) + '\n');
    console.log(`\nWrote changes to ${VEHICLES_PATH}`);
  }
}

main();
