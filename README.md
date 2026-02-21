# Overland Finder

A React app for comparing overlanding SUVs. Filter by budget, MPG, off-road capability, luxury, reliability, and cargo space. Adjust priority weighting to find your ideal rig.

**Live demo:** https://overland-finder.vercel.app

## Development

```bash
pnpm install
pnpm dev
```

Opens at http://localhost:5173

## Build

```bash
pnpm build
pnpm preview  # preview production build
```

## Vehicle Data

Vehicle specs are stored in `src/vehicles.json` (215+ vehicles).

### Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `make` | string | Manufacturer (e.g., "Toyota") |
| `model` | string | Model name (e.g., "4Runner") |
| `trim` | string \| null | Trim level (e.g., "TRD Pro") |
| `generation` | string | Generation name (e.g., "6th Gen", "JL") |
| `yearStart` | number | Generation start year |
| `yearEnd` | number \| null | Generation end year (null = current) |
| `price` | number | Price in $K (thousands USD) |
| `mpg` | number | Combined MPG (MPGe for EVs) |
| `offroad` | number | Off-road capability (1-10) |
| `luxury` | number | Interior/comfort (1-10) |
| `cargo` | number | Cargo space in cubic feet |
| `reliability` | number | Reliability rating (1-10) |
| `performance` | number | Performance rating (1-10) |
| `size` | enum | "compact", "mid", or "full" |
| `body` | enum | Body type: "suv", "truck", "cuv", "wagon" |
| `pt` | enum | Powertrain: "gas", "diesel", "hybrid", "phev", "ev" |
| `tow` | number | Towing capacity in pounds |
| `weight` | number | Curb weight in pounds |
| `gc` | number | Ground clearance in inches |
| `note` | string | Editorial description |
| `url` | string | Wikipedia article URL |

### Data Sources

| Field | Source |
|-------|--------|
| `mpg` | EPA fueleconomy.gov REST API |
| `weight` | NHTSA Canadian Vehicle Specifications API |
| `tow`, `cargo`, `gc` | Manufacturer specs (manually researched) |
| `size` | EPA VClass + interior volume |
| `price` | Kelley Blue Book, Edmunds, manufacturer sites |
| `reliability` | JD Power ratings |
| `offroad` | Feature-based formula (4WD system, lockers, ground clearance) |
| `performance` | Power-to-weight formula (hp/weight normalized) |
| `luxury` | Feature-based formula (brand tier, interior, features, tech, quietness) |
| `yearStart`, `yearEnd`, `generation` | Wikipedia vehicle infoboxes |

### Scales

| Field | Unit/Scale | Notes |
|-------|------------|-------|
| `price` | $K (thousands USD) | MSRP for new; typical used price for used |
| `mpg` | Miles per gallon | Combined city/highway; MPGe for EVs |
| `cargo` | Cubic feet | Behind 2nd row, seats up |
| `tow` | Pounds | Maximum towing capacity |
| `weight` | Pounds | Curb weight |
| `gc` | Inches | Ground clearance |
| `reliability` | 1-10 | Based on JD Power (10 = best) |
| `offroad` | 1-10 | Capability rating (10 = best) |
| `luxury` | 1-10 | Interior/comfort rating (10 = best) |
| `performance` | 1-10 | Power/handling rating (10 = best) |
| `yearStart` | Year | Generation start year |

### Derived Score Formulas

**Performance** (power-to-weight):
```
PTW = (hp / weight_lbs) * 1000
score = 1 + ((PTW - 25) / (125 - 25)) * 9   // Normalized to 1-10
```

**Off-road** (feature-based):
```
raw = system_score     // awd=1, full_time=2, part_time=2, selectable=3
    + (2 if low_range)
    + (1 if locker_front) + (1 if locker_center) + (1.5 if locker_rear)
    + gc_bonus          // <8"=0, 8-9"=1, 9-10"=2, 10-11"=2.5, 11+"=3
score = 2 + (raw / 10) * 8   // Normalized to ~3-10
```

**Luxury** (feature-based):
```
raw = brand_tier + interior + features + tech + quietness
score = 1 + (raw / 10.5) * 9   // Normalized to 1-10

Brand tiers: mainstream=0, premium=1.5, luxury=3
  - Luxury: Land Rover, Mercedes, BMW, Porsche, Lexus, Lincoln, Genesis, Cadillac
  - Premium: Audi, Volvo, Acura, Infiniti, Rivian, Tesla
  - Mainstream: Toyota, Ford, Jeep, Chevrolet, GMC, Honda, Nissan, Subaru, etc.
Interior: cloth=0, leatherette=0.5, leather=1, premium_leather=1.5
Features: ventilated_seats=0.5, massage=0.5, premium_audio=0.5, air_suspension=1, pano_roof=0.5
Tech: large_display=0.5, digital_cluster=0.5, HUD=0.5
Quietness: loud=0, average=0.5, quiet=1, very_quiet=1.5
```

**Size classification** (EPA VClass mapping):
- Small Sport Utility Vehicle 4WD → mid
- Standard Sport Utility Vehicle 4WD → mid (<100 cu ft interior) or full (>100 cu ft)
- Standard Pickup Trucks 4WD → full

### Powertrain Types

| Value | Description |
|-------|-------------|
| `gas` | Gasoline internal combustion |
| `diesel` | Diesel internal combustion |
| `hybrid` | Full hybrid (gas + electric) |
| `phev` | Plug-in hybrid |
| `ev` | Fully electric |

### Body Types

| Value | Description |
|-------|-------------|
| `suv` | Body-on-frame SUVs and larger unibody SUVs (4Runner, Land Cruiser, Defender, Tahoe) |
| `truck` | Pickup trucks (F-150, Tacoma, Gladiator, Cybertruck) |
| `cuv` | Compact crossovers and unibody crossover SUVs (RAV4, CR-V, Tucson, Bronco Sport) |
| `wagon` | Station wagons and lifted wagons (V60 CC, V90 CC, Outback) |

### Scripts Reference

All scripts support `--dry-run` to preview changes without writing.

#### Fetch Scripts (External APIs)

| Script | Source | Output |
|--------|--------|--------|
| `fetch-vehicle-data.mjs` | EPA fueleconomy.gov | `vehicle-data-results.json` |
| `fetch-nhtsa-specs.mjs` | NHTSA Canadian Vehicle Specs | `nhtsa-results.json` |
| `fetch-epa-vclass.mjs` | EPA VClass | `epa-vclass-data.json` |
| `generate-wikipedia-urls.mjs` | Wikipedia | `wikipedia-urls.json` |

#### Apply Scripts (Update vehicles.json)

| Script | Source JSON | Fields Updated |
|--------|-------------|----------------|
| `update-vehicle-mpg.mjs` | `vehicle-data-results.json` | `mpg` |
| `update-vehicle-specs.mjs` | `manual-specs.json` | `weight`, `tow`, `cargo`, `gc` |
| `apply-verified-updates.mjs` | `verified-updates.json` | `price`, `pt`, `reliability` |
| `apply-generation-data.mjs` | `generation-data.json` | `yearStart`, `yearEnd`, `generation` |
| `apply-size-data.mjs` | `size-data.json` | `size` |
| `apply-body-data.mjs` | `body-data.json` | `body` |
| `apply-wikipedia-urls.mjs` | `wikipedia-urls.json` | `url` |

#### Calculate Scripts (Derived Scores)

| Script | Inputs | Output Field |
|--------|--------|--------------|
| `calculate-offroad-scores.mjs` | `offroad-features.json` + `gc` | `offroad` |
| `calculate-performance-scores.mjs` | `horsepower-data.json` + `weight` | `performance` |
| `calculate-luxury-scores.mjs` | `luxury-features.json` + `make` | `luxury` |

#### Utility Scripts

| Script | Purpose |
|--------|---------|
| `validate-vehicles.mjs` | Validate data integrity (run before commits) |
| `extract-years.mjs` | Extract year ranges from names (one-time migration) |
| `clean-vehicle-names.mjs` | Remove redundant year/gen info from names |

### JSON Data Files

| File | Fields | How to Populate |
|------|--------|-----------------|
| `manual-specs.json` | `weight`, `tow`, `cargo`, `gc`, `source` | Manual research from manufacturer specs |
| `verified-updates.json` | `price`, `pt`, `reliability` | Manual research (KBB, JD Power) |
| `generation-data.json` | `yearStart`, `yearEnd`, `generation` | Wikipedia vehicle infoboxes |
| `offroad-features.json` | `system`, `low_range`, `locker_*` | Manual research from spec sheets |
| `horsepower-data.json` | `hp` | Manual research or EPA data |
| `luxury-features.json` | `interior`, `features`, `tech`, `quietness` | Manual research |
| `size-data.json` | `size`, `source` | EPA VClass or interior volume |
| `body-data.json` | `body` | Body type classification (suv/truck/cuv/wagon) |

### Updating Data (Full Procedure)

For an LLM agent maintaining this data:

```bash
# 1. Validate current data
node scripts/validate-vehicles.mjs

# 2. Fetch external API data (if updating from canonical sources)
node scripts/fetch-vehicle-data.mjs    # EPA MPG
node scripts/fetch-nhtsa-specs.mjs     # NHTSA weight
node scripts/fetch-epa-vclass.mjs      # EPA size class
node scripts/generate-wikipedia-urls.mjs  # Wikipedia URLs

# 3. Apply API data to vehicles.json
node scripts/update-vehicle-mpg.mjs
node scripts/apply-size-data.mjs
node scripts/apply-body-data.mjs
node scripts/apply-wikipedia-urls.mjs

# 4. Apply manually researched data (edit JSON files first)
node scripts/update-vehicle-specs.mjs      # weight, tow, cargo, gc
node scripts/apply-verified-updates.mjs    # price, pt, reliability
node scripts/apply-generation-data.mjs     # year ranges

# 5. Recalculate derived scores (after base data is updated)
node scripts/calculate-offroad-scores.mjs
node scripts/calculate-performance-scores.mjs
node scripts/calculate-luxury-scores.mjs

# 6. Validate final result
node scripts/validate-vehicles.mjs
```

### Adding a New Vehicle (Single)

1. **Research specs via web search** (do NOT use LLM knowledge — it may be outdated):
   - See the **Web Research Guide** below for which sources are reliable vs. blocked
   - Run parallel searches: `"{year} {make} {model} {trim} MSRP specs horsepower"` and `"{year} {make} {model} weight towing ground clearance cargo"` and `"{year} {make} {model} MPG interior features 4WD"`
   - For full spec tables, WebFetch `auto123.com` or `caredge.com`; for MSRP, fetch manufacturer root model page
   - Verify the vehicle is still in production (some trims get discontinued mid-cycle)
   - Note discontinuation dates in `generation-data.json` if applicable
2. Add entry to `src/vehicles.json` with all required fields
3. Add entries to these JSON files in `scripts/`:
   - `manual-specs.json` (weight, tow, cargo, gc)
   - `verified-updates.json` (price, pt, reliability)
   - `generation-data.json` (yearStart, yearEnd, generation)
   - `offroad-features.json` (system, lockers, low_range)
   - `horsepower-data.json` (hp)
   - `luxury-features.json` (interior, features, tech, quietness)
   - `size-data.json` (size)
4. Run apply scripts to update `vehicles.json` from the data files
5. Run calculate scripts to compute derived scores
6. Run `validate-vehicles.mjs` to verify

### Adding Multiple Vehicles (Batch)

For adding multiple vehicles at once, follow the same process as single vehicles but write a temporary script to insert data into all JSON files at once:

1. **Research specs** for all vehicles via web search (can be done in parallel)
2. Write a temporary Node.js script that adds entries to `vehicles.json` and all auxiliary JSON files (`manual-specs.json`, `verified-updates.json`, `generation-data.json`, `offroad-features.json`, `horsepower-data.json`, `luxury-features.json`, `size-data.json`, `body-data.json`)
3. Run the script, then apply and calculate:
   ```bash
   node scripts/add-batch-N.mjs     # Run your temporary script
   pnpm apply:all                    # Apply all data + calculate scores
   pnpm validate                     # Verify data integrity
   pnpm test                         # Run tests
   rm scripts/add-batch-N.mjs        # Clean up
   ```

### NPM Scripts Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Data management
pnpm validate         # Validate vehicle data
pnpm apply:all        # Apply all data files + calculate scores
pnpm calc:all         # Recalculate all derived scores

# Individual operations
pnpm apply:specs      # Apply manual-specs.json
pnpm apply:updates    # Apply verified-updates.json
pnpm apply:gen        # Apply generation-data.json
pnpm apply:size       # Apply size-data.json
pnpm apply:body       # Apply body-data.json
pnpm calc:offroad     # Calculate offroad scores
pnpm calc:performance # Calculate performance scores
pnpm calc:luxury      # Calculate luxury scores

# Testing
pnpm test             # Run tests
pnpm test:watch       # Run tests in watch mode
pnpm precommit        # Validate + test (run before commits)
```

### Data Source APIs

**EPA fueleconomy.gov** (MPG, VClass):
```
GET https://www.fueleconomy.gov/ws/rest/vehicle/menu/model?year={year}&make={make}
GET https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year={year}&make={make}&model={model}
GET https://www.fueleconomy.gov/ws/rest/vehicle/{id}
```

**NHTSA Canadian Vehicle Specs** (curb weight):
```
GET https://vpic.nhtsa.dot.gov/api/vehicles/GetCanadianVehicleSpecifications/?Year={year}&Make={make}&Model={model}&format=json
```

**Wikipedia** (generation info, URLs):
- Article URLs validated via HEAD requests
- Generation-specific articles for some vehicles (e.g., `Jeep_Wrangler_(JL)`)

### Web Research Guide (for LLM agents)

**Use WebSearch for everything.** Search result summaries aggregate data from Edmunds, KBB, manufacturer sites, and other canonical sources — and typically contain exact spec numbers without needing to fetch any page directly. Most major automotive sites (edmunds.com, kbb.com, caranddriver.com, jdpower.com, manufacturer spec pages) block direct WebFetch via bot detection, JS rendering, or paywalls, so don't bother trying.

**When you do need to fetch a page** (e.g. for a complete spec table), `auto123.com` and `caredge.com` are reliable. The government APIs (`fueleconomy.gov`, `vpic.nhtsa.dot.gov`) always work for MPG and weight.

#### Rules

1. **WebSearch first** — run 3-4 parallel queries (MSRP/HP, weight/tow/cargo/GC, MPG/generation, drivetrain/features). Mine the excerpts.
2. **Cross-check** — verify any single-source number against a second source.
3. **Disambiguate by config** — tow/weight/GC vary by cab, bed, and engine. Confirm you have the right configuration.
4. **Towing = base 4WD + standard engine** — not the max-tow-package figure.
5. **Lockers are rarely standard** — volume trims (XLT, SR5, LT) almost never include lockers.
6. **Watch for mid-year redesigns** — some years sell two generations simultaneously.
7. **JD Power → 1-10 scale**: segment winner = 8-9, average = 6, below average = 4-5.

## Tech

- React 18
- Vite
