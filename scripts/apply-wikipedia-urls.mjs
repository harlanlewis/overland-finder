#!/usr/bin/env node

/**
 * Apply Wikipedia URLs to vehicles.json
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesPath = join(__dirname, "../src/vehicles.json");
const urlsPath = join(__dirname, "wikipedia-urls.json");

const vehicles = JSON.parse(readFileSync(vehiclesPath, "utf-8"));
const urls = JSON.parse(readFileSync(urlsPath, "utf-8"));

let updated = 0;
let missing = 0;

for (const vehicle of vehicles) {
  const urlData = urls[vehicle.id];
  if (urlData && urlData.url) {
    if (vehicle.url !== urlData.url) {
      console.log(`${vehicle.id}: ${vehicle.url} -> ${urlData.url}`);
      vehicle.url = urlData.url;
      updated++;
    }
  } else {
    console.log(`⚠️  No URL for ${vehicle.id}`);
    missing++;
  }
}

writeFileSync(vehiclesPath, JSON.stringify(vehicles, null, 2) + "\n");

console.log(`\nUpdated ${updated} URLs`);
if (missing > 0) {
  console.log(`Missing ${missing} URLs`);
}
