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

Vehicle specs are stored in `src/vehicles.json` (91 vehicles: 58 new, 33 used).

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
| `condition` | enum | "new" or "used" |
| `price` | number | Price in $K (thousands USD) |
| `mpg` | number | Combined MPG (MPGe for EVs) |
| `offroad` | number | Off-road capability (1-10) |
| `luxury` | number | Interior/comfort (1-10) |
| `cargo` | number | Cargo space in cubic feet |
| `reliability` | number | Reliability rating (1-10) |
| `performance` | number | Performance rating (1-10) |
| `size` | enum | "mid" or "full" |
| `pt` | enum | Powertrain: "ice", "hybrid", "phev", "ev" |
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
| `yearEnd` | Year or null | Generation end year (null = current) |
| `generation` | String | e.g., "JK", "6th Gen", "L663" |

### Powertrain Types

| Value | Description |
|-------|-------------|
| `ice` | Internal combustion (gas/diesel) |
| `hybrid` | Full hybrid (gas + electric) |
| `phev` | Plug-in hybrid |
| `ev` | Fully electric |

### Updating Data

```bash
# Fetch latest MPG from EPA
node scripts/fetch-vehicle-data.mjs
node scripts/update-vehicle-mpg.mjs

# Update specs (weight, tow, cargo, gc) from manual-specs.json
node scripts/update-vehicle-specs.mjs

# Update price, powertrain, reliability from verified-updates.json
node scripts/apply-verified-updates.mjs

# Update year/generation data
node scripts/apply-generation-data.mjs

# Update size classification (if needed)
node scripts/fetch-epa-vclass.mjs  # Fetch EPA data
node scripts/apply-size-data.mjs   # Apply size

# Recalculate derived scores
node scripts/calculate-offroad-scores.mjs
node scripts/calculate-performance-scores.mjs
node scripts/calculate-luxury-scores.mjs

# Fetch weight data from NHTSA (for verification)
node scripts/fetch-nhtsa-specs.mjs
```

Manually researched data is stored in:
- `scripts/manual-specs.json` - weight, tow, cargo, gc
- `scripts/verified-updates.json` - price, powertrain, reliability
- `scripts/generation-data.json` - year ranges, generation names
- `scripts/offroad-features.json` - 4WD system, lockers, low range
- `scripts/horsepower-data.json` - horsepower values
- `scripts/luxury-features.json` - interior, features, tech, quietness

## Tech

- React 18
- Vite
