#!/usr/bin/env node

/**
 * Generate and validate Wikipedia URLs for all vehicles.
 *
 * Wikipedia URL patterns:
 * - Base model: https://en.wikipedia.org/wiki/Toyota_4Runner
 * - Generation-specific: https://en.wikipedia.org/wiki/Jeep_Wrangler_(JL)
 *
 * Strategy:
 * 1. Map each vehicle to candidate Wikipedia article names
 * 2. Validate with HEAD requests (no bot detection)
 * 3. Output best URL for each vehicle
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const vehiclesPath = join(__dirname, "../src/vehicles.json");
const outputPath = join(__dirname, "wikipedia-urls.json");

const vehicles = JSON.parse(readFileSync(vehiclesPath, "utf-8"));

// Manual mappings for vehicles where the Wikipedia article name differs from the vehicle name
// Key: make + "|" + base model (lowercase, simplified)
// Value: Wikipedia article name (without URL prefix)
const ARTICLE_OVERRIDES = {
  // Toyota/Lexus
  "toyota|4runner": "Toyota_4Runner",
  "toyota|land cruiser": "Toyota_Land_Cruiser",
  "toyota|sequoia": "Toyota_Sequoia",
  "toyota|fj cruiser": "Toyota_FJ_Cruiser",
  "lexus|gx": "Lexus_GX",
  "lexus|lx": "Lexus_LX",

  // Land Rover
  "land rover|defender": "Land_Rover_Defender",
  "land rover|discovery": "Land_Rover_Discovery",
  "land rover|range rover": "Range_Rover",
  "land rover|range rover sport": "Range_Rover_Sport",
  "land rover|lr4": "Land_Rover_Discovery",

  // Jeep
  "jeep|wrangler": "Jeep_Wrangler",
  "jeep|grand cherokee": "Jeep_Grand_Cherokee",
  "jeep|wagoneer": "Jeep_Wagoneer_(WS)",
  "jeep|grand wagoneer": "Jeep_Wagoneer_(WS)",

  // GM - note: some vehicles use "Chevy" in name but make is "Chevrolet"
  "chevrolet|tahoe": "Chevrolet_Tahoe",
  "chevrolet|chevy tahoe": "Chevrolet_Tahoe",
  "chevrolet|suburban": "Chevrolet_Suburban",
  "chevrolet|chevy suburban": "Chevrolet_Suburban",
  "gmc|yukon": "GMC_Yukon",
  "gmc|hummer ev": "GMC_Hummer_EV",
  "cadillac|escalade": "Cadillac_Escalade",

  // Ford
  "ford|bronco": "Ford_Bronco_(sixth_generation)",
  "ford|expedition": "Ford_Expedition",
  "ford|excursion": "Ford_Excursion",

  // Mercedes
  "mercedes-benz|g-class": "Mercedes-Benz_G-Class",
  "mercedes-benz|mercedes-amg g": "Mercedes-Benz_G-Class",
  "mercedes-benz|gle": "Mercedes-Benz_GLE-Class",
  "mercedes-benz|gls": "Mercedes-Benz_GLS-Class",
  "mercedes-benz|eqs suv": "Mercedes-Benz_EQS_SUV",

  // BMW
  "bmw|x5": "BMW_X5",
  "bmw|x7": "BMW_X7",
  "bmw|xm": "BMW_XM",
  "bmw|ix": "BMW_iX",

  // Porsche
  "porsche|cayenne": "Porsche_Cayenne",

  // Audi - RS Q8 is covered in the main Q8 article
  "audi|q8": "Audi_Q8",
  "audi|sq8": "Audi_Q8",
  "audi|rs q8": "Audi_Q8",

  // Rivian
  "rivian|r1s": "Rivian_R1S",

  // Tesla
  "tesla|cybertruck": "Tesla_Cybertruck",
  "tesla|model x": "Tesla_Model_X",

  // Others
  "mitsubishi|outlander": "Mitsubishi_Outlander",
  "mitsubishi|montero": "Mitsubishi_Pajero",
  "mitsubishi|montero sport": "Mitsubishi_Challenger",
  "volvo|xc90": "Volvo_XC90",
  "volvo|ex90": "Volvo_EX90",
  "genesis|gv80": "Genesis_GV80",
  "nissan|xterra": "Nissan_Xterra",
  "nissan|pathfinder": "Nissan_Pathfinder",
  "nissan|patrol": "Nissan_Patrol",
  "hummer|h2": "Hummer_H2",
  "isuzu|trooper": "Isuzu_Trooper",
};

// Generation-specific article suffixes
// Some vehicles have separate Wikipedia articles per generation
const GENERATION_ARTICLES = {
  // Jeep Wrangler has generation-specific articles
  "jeep|wrangler|JL": "Jeep_Wrangler_(JL)",
  "jeep|wrangler|JK": "Jeep_Wrangler_(JK)",
  "jeep|wrangler|TJ": "Jeep_Wrangler_(TJ)",

  // Jeep Grand Cherokee
  "jeep|grand cherokee|WL": "Jeep_Grand_Cherokee_(WL)",
  "jeep|grand cherokee|WK2": "Jeep_Grand_Cherokee_(WK2)",

  // Toyota Land Cruiser series
  "toyota|land cruiser|J250": "Toyota_Land_Cruiser_(J250)",
  "toyota|land cruiser|200 Series": "Toyota_Land_Cruiser_(J200)",
  "toyota|land cruiser|100 Series": "Toyota_Land_Cruiser_(J100)",
  "toyota|land cruiser|80 Series": "Toyota_Land_Cruiser_(J80)",

  // Lexus GX
  "lexus|gx|GX 550": "Lexus_GX_(AL30)",
  "lexus|gx|J150": "Lexus_GX",
  "lexus|gx|J120": "Lexus_GX",

  // Lexus LX
  "lexus|lx|J300": "Lexus_LX_(J300)",
  "lexus|lx|200 Series": "Lexus_LX",

  // Land Rover Defender
  "land rover|defender|L663": "Land_Rover_Defender_(L663)",
  "land rover|defender|Defender 110": "Land_Rover_Defender_(L316)",

  // Land Rover Discovery
  "land rover|discovery|L462": "Land_Rover_Discovery_(L462)",
  "land rover|lr4|LR4/L319": "Land_Rover_Discovery_(L319)",

  // Mercedes G-Class - all generations use the same article
  "mercedes-benz|g-class|W463A": "Mercedes-Benz_G-Class",
  "mercedes-benz|g-class|W463A EQ": "Mercedes-Benz_G-Class",
  "mercedes-benz|g-class|W463": "Mercedes-Benz_G-Class",

  // Ford Bronco - all 6th gen trims use same article
  "ford|bronco|6th Gen": "Ford_Bronco_(sixth_generation)",
};

/**
 * Extract base model name from vehicle name (remove trim/variant info)
 */
function extractBaseModel(name, make) {
  // Remove make from start if present (but keep "Chevy" for lookup purposes)
  let model = name;

  // Handle "Mercedes-AMG" as a make variant
  if (model.startsWith("Mercedes-AMG")) {
    model = model.replace("Mercedes-AMG", "Mercedes-AMG");
    // Don't strip make, keep "Mercedes-AMG G" for lookup
  } else if (model.toLowerCase().startsWith(make.toLowerCase())) {
    model = model.slice(make.length).trim();
  }

  // Common trim/variant patterns to remove
  const trimPatterns = [
    /\s+(TRD\s+)?(Pro|Off-Road|Off Road|Sport|Limited|Premium|SR5|Trailhunter|Overtrail|Badlands|Outer Banks|Raptor|Timberline|Rubicon|Sahara|Overland|Summit|Trailhawk|AT4|Z71|V8|S|Adventure|Dual Max|AWD|Cyberbeast|xDrive\d+\w*|E-Hybrid|Recharge|4xe|EQ|550|580|450|460|470|570|600|350de)\b.*$/i,
    /\s+\d{2,4}$/,  // Trailing 2-4 digit numbers (63, 550, 2024)
    /\s+R51$/i,   // Pathfinder generation suffix
    /\s+Y61$/i,   // Patrol generation suffix
    /\s+4WD$/i,   // Suburban 4WD
    /\s+\d+\s*\/.*$/i, // Discovery "5" or "4 / Discovery 4" suffix
    /\s+Classic$/i, // Defender Classic
    /\s+110$/i,   // Defender 110
    /\s+130$/i,   // Defender 130
    /\s+PHEV$/i,  // Outlander PHEV
    /\s+SUV$/i,   // Hummer EV SUV
  ];

  for (const pattern of trimPatterns) {
    model = model.replace(pattern, "");
  }

  // Special cases - order matters! More specific patterns first
  model = model
    .replace(/^4Runner.*$/i, "4Runner")
    .replace(/^Grand Cherokee.*$/i, "Grand Cherokee")
    .replace(/^Grand Wagoneer.*$/i, "Grand Wagoneer")
    .replace(/^Wagoneer.*$/i, "Wagoneer")
    .replace(/^Wrangler.*$/i, "Wrangler")
    .replace(/^Land Cruiser.*$/i, "Land Cruiser")
    .replace(/^Defender.*$/i, "Defender")
    .replace(/^Discovery.*$/i, "Discovery")
    .replace(/^Range Rover Sport.*$/i, "Range Rover Sport")
    .replace(/^Range Rover.*$/i, "Range Rover")
    .replace(/^Bronco.*$/i, "Bronco")
    .replace(/^Tahoe.*$/i, "Tahoe")
    .replace(/^Yukon.*$/i, "Yukon")
    .replace(/^Escalade.*$/i, "Escalade")
    .replace(/^Sequoia.*$/i, "Sequoia")
    .replace(/^Expedition.*$/i, "Expedition")
    .replace(/^Suburban.*$/i, "Suburban")
    .replace(/^GX\s*\d*.*$/i, "GX")
    .replace(/^LX\s*\d*.*$/i, "LX")
    .replace(/^GV\d+.*$/i, "GV80") // Genesis GV80
    .replace(/^GLE.*$/i, "GLE")
    .replace(/^GLS.*$/i, "GLS")
    // Mercedes G-Class - be specific to avoid matching GX, GV80, Grand, etc.
    .replace(/^G-Class$/i, "G-Class")
    .replace(/^G-Wagen$/i, "G-Class")
    .replace(/^G$/i, "G-Class") // Bare "G" after trim patterns stripped numbers
    .replace(/^Cayenne.*$/i, "Cayenne")
    .replace(/^Outlander.*$/i, "Outlander")
    .replace(/^Montero Sport.*$/i, "Montero Sport")
    .replace(/^Montero.*$/i, "Montero")
    .replace(/^Hummer EV.*$/i, "Hummer EV")
    .replace(/^Cybertruck.*$/i, "Cybertruck")
    .replace(/^Model X.*$/i, "Model X")
    .replace(/^R1S.*$/i, "R1S")
    .replace(/^LR4.*$/i, "LR4")
    .replace(/^Pathfinder.*$/i, "Pathfinder")
    .replace(/^Q8.*$/i, "Q8")
    .replace(/^SQ8.*$/i, "SQ8")
    .replace(/^RS Q8.*$/i, "RS Q8");

  return model.trim();
}

/**
 * Get Wikipedia URL candidates for a vehicle
 */
function getWikipediaCandidates(vehicle) {
  const { make, name, generation } = vehicle;
  const baseModel = extractBaseModel(name, make);
  const key = `${make.toLowerCase()}|${baseModel.toLowerCase()}`;
  const genKey = `${key}|${generation}`;

  const candidates = [];

  // Check for generation-specific article first
  if (GENERATION_ARTICLES[genKey]) {
    candidates.push(GENERATION_ARTICLES[genKey]);
  }

  // Check for base model override
  if (ARTICLE_OVERRIDES[key]) {
    candidates.push(ARTICLE_OVERRIDES[key]);
  }

  // Generate default article name
  const defaultArticle = `${make.replace(/ /g, "_")}_${baseModel.replace(/ /g, "_")}`;
  if (!candidates.includes(defaultArticle)) {
    candidates.push(defaultArticle);
  }

  return candidates;
}

/**
 * Validate a Wikipedia URL exists (returns true/false)
 */
async function validateWikipediaUrl(articleName) {
  const url = `https://en.wikipedia.org/wiki/${articleName}`;
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" });
    // Wikipedia returns 200 for existing articles, redirects for alternate names
    return response.ok;
  } catch (error) {
    console.error(`Error checking ${url}:`, error.message);
    return false;
  }
}

/**
 * Find best Wikipedia URL for a vehicle
 */
async function findBestUrl(vehicle, candidates) {
  for (const candidate of candidates) {
    const isValid = await validateWikipediaUrl(candidate);
    if (isValid) {
      return `https://en.wikipedia.org/wiki/${candidate}`;
    }
  }
  return null;
}

/**
 * Main function
 */
async function main() {
  console.log(`Processing ${vehicles.length} vehicles...\n`);

  const results = [];
  const urlMap = new Map(); // Track unique URLs to avoid duplicate validations

  // First pass: generate candidates and dedupe
  for (const vehicle of vehicles) {
    const candidates = getWikipediaCandidates(vehicle);
    results.push({
      id: vehicle.id,
      name: vehicle.name,
      make: vehicle.make,
      generation: vehicle.generation,
      candidates,
      url: null,
    });

    for (const candidate of candidates) {
      if (!urlMap.has(candidate)) {
        urlMap.set(candidate, null); // Will be validated
      }
    }
  }

  console.log(`Found ${urlMap.size} unique Wikipedia article candidates to validate.\n`);

  // Validate all unique URLs
  let validated = 0;
  for (const [articleName] of urlMap) {
    const isValid = await validateWikipediaUrl(articleName);
    urlMap.set(articleName, isValid);
    validated++;
    const status = isValid ? "✓" : "✗";
    console.log(`[${validated}/${urlMap.size}] ${status} ${articleName}`);

    // Small delay to be nice to Wikipedia
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log("\n");

  // Second pass: assign best URL to each vehicle
  let found = 0;
  let notFound = 0;

  for (const result of results) {
    for (const candidate of result.candidates) {
      if (urlMap.get(candidate)) {
        result.url = `https://en.wikipedia.org/wiki/${candidate}`;
        found++;
        break;
      }
    }
    if (!result.url) {
      notFound++;
      console.log(`⚠️  No URL found: ${result.name} (${result.generation})`);
      console.log(`   Tried: ${result.candidates.join(", ")}`);
    }
  }

  console.log(`\n✓ Found URLs for ${found}/${vehicles.length} vehicles`);
  if (notFound > 0) {
    console.log(`✗ Missing URLs for ${notFound} vehicles`);
  }

  // Write results
  const output = {};
  for (const result of results) {
    output[result.id] = {
      name: result.name,
      generation: result.generation,
      url: result.url,
      candidates: result.candidates,
    };
  }

  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote results to ${outputPath}`);
}

main().catch(console.error);
