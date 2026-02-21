# Vehicle Coverage Expansion Plan

## Progress Log

### 2026-02-21: Batch 11 Complete

- **Added 7 vehicles**: Dodge Durango R/T AWD, Ford Explorer Timberline, Nissan Armada Platinum 4WD, Nissan Rogue SL AWD, Chevrolet Equinox RS AWD, Mazda CX-5 2.5 Turbo Premium AWD, BMW X3 xDrive30i
- **Skipped**: Subaru Forester Wilderness (already exists as `forester_wilderness`)
- **Vehicle count**: 208 → 215 (+7)
- **New makes**: Dodge (first entry — R/T AWD, Hemi V8 3-row)
- **New models**: Explorer (best-selling 3-row), Armada (Patrol-based BOF), Rogue (top-selling compact CUV), Equinox (redesigned compact), CX-5 (top-rated compact turbo), X3 (compact luxury)
- **Full-size BOF added**: Armada Platinum ($73K, 425hp twin-turbo V6, air suspension, 8,500 lb tow)
- **Explorer Timberline**: Discontinued trim (2022-2024), off-road Explorer with raised suspension and all-terrain tires
- **Off-road scores**: Armada (7.5 — selectable 4WD + low range + 9.6" GC), Durango (7.0 — selectable + low range), Explorer/Rogue/X3 (3.5), Equinox/CX-5 (3.0)
- **Luxury scores**: X3 (5.7 — BMW brand tier), Armada (5.7 — premium leather + air suspension + Klipsch audio), CX-5 (4.4 — leather + Bose + HUD), Durango/Equinox (3.6), Rogue (3.1), Explorer (2.7)
- **Compact CUV surge**: +4 compact CUVs (Rogue, Equinox, CX-5, X3) — compact CUV segment well-represented
- **Dodge coverage**: 0 → 1 vehicle (only major US full-size SUV brand completely absent — now resolved)
- **Nissan coverage**: 3 → 5 vehicles (Xterra, Frontier PRO-4X + Armada, Rogue)
- **Mazda coverage**: 3 → 4 vehicles (CX-50, CX-70, CX-90 + CX-5)
- **BMW coverage**: 4 → 5 vehicles (X5 × 2, X7 × 2 + X3)
- **Ford coverage**: gained Explorer (first entry for this nameplate)
- All data files updated, validation passes (0 errors, 0 warnings), 1326 tests passing
- Data sources: Dodge.com, Ford.com, NissanUSA.com, Chevrolet.com, MazdaUSA.com, BMWUSA.com, Edmunds, KBB, CarEdge, fueleconomy.gov, JD Power, Wikipedia

### 2026-02-17: Batch 10 Complete

- **Added 5 vehicles**: Audi Q7 Premium Plus 55 Quattro, Audi Q8 e-tron Prestige Quattro, Audi A6 Allroad Premium Plus, Subaru Crosstrek Premium AWD, VW Atlas SE 4MOTION
- **Vehicle count**: 203 → 208 (+5)
- **Audi lineup**: 3 → 6 vehicles (Q5, Q7, Q8 e-tron, A6 Allroad + existing Q8/SQ8/RS Q8)
- **Wagons**: 3 → 4 (added A6 Allroad)
- **Discontinued EV**: Q8 e-tron (production ended Feb 2025, Brussels factory closed)
- **Budget entry**: Crosstrek Premium at $27K — cheapest new vehicle in inventory
- **3-row options**: Atlas SE ($40K) and Q7 ($70K) fill volume and premium 3-row gaps
- **VW coverage**: 2 → 3 vehicles (Atlas Cross Sport, Tiguan, Atlas)
- **Subaru coverage**: 4 → 5 vehicles (added gas Crosstrek alongside Wilderness)
- All data files updated, validation passes (0 errors, 0 warnings), 1284 tests passing

### 2026-02-17: Batch 9 Complete

- **Added 8 vehicles**: Ford F-150 XLT, Toyota Tacoma SR5, Chevrolet Silverado LT Trail Boss, Ram 1500 Big Horn, Honda CR-V EX-L, Honda HR-V EX-L, Honda Ridgeline RTL, Audi Q5 Premium Plus Quattro
- **Vehicle count**: 195 → 203 (+8)
- **Volume trucks filled**: F-150 XLT ($52K), Tacoma SR5 ($37K), Silverado Trail Boss ($59K), Ram Big Horn ($47K)
- **Honda gas lineup**: CR-V EX-L ($37K), HR-V EX-L ($31K), Ridgeline RTL ($43K) — Honda coverage 3 → 6
- **Ram volume trims**: TRX/Rebel/EcoDiesel → now includes Big Horn (most popular trim)
- **Audi mid-range**: Q5 Premium Plus ($57K) — first sub-$70K Audi
- **Off-road scores**: Silverado Trail Boss (9.5 — selectable 4WD + rear locker + 11.1" GC), F-150 XLT (7.0), Tacoma SR5 (7.0), Ram Big Horn (6.0)
- All data files updated, validation passes (0 errors, 0 warnings), 1284 tests passing

### 2026-02-16: Batch 8 Complete

- **Added 10 vehicles**: Ford Maverick Tremor, Hyundai Santa Cruz SEL, Nissan Frontier PRO-4X, Toyota Tacoma TRD Off-Road, Ford Ranger XLT, Subaru Ascent Onyx, Mazda CX-70 PHEV, VW Tiguan SE R-Line 4MOTION, Acura RDX A-Spec SH-AWD, Ineos Grenadier Trialmaster
- **Vehicle count**: 185 → 195 (+10)
- **New segments**: Compact trucks (Maverick, Santa Cruz), volume truck trims (Frontier, Tacoma TRD OR, Ranger XLT)
- **New makes**: Ineos, Mazda CX-70, VW Tiguan, Acura RDX now represented
- **Compact trucks**: First representation in this segment (Maverick $41K, Santa Cruz $32K)
- **Off-road scores**: Grenadier (10.0 — 3 locking diffs), Tacoma TRD OR (9.0), Frontier PRO-4X (8.0), Ranger XLT (6.0), Ascent (3.5), Maverick/Santa Cruz (3.5)
- **Purpose-built overlander**: Ineos Grenadier Trialmaster ($95K, BMW I6, 3 locking diffs)
- **Data quality fix**: Fixed 9 pre-existing `pt: "ice"` → `pt: "gas"` entries in verified-updates.json
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json, body-data.json
- All calculation scripts run successfully, validation passes (0 errors, 0 warnings)
- Data sources: [Ford](https://www.ford.com), [Toyota](https://www.toyota.com), [Nissan](https://www.nissanusa.com), [Hyundai](https://www.hyundai.com), [Subaru](https://www.subaru.com), [Mazda](https://www.mazdausa.com), [VW](https://www.vw.com), [Acura](https://www.acura.com), [Ineos](https://ineosgrenadier.com), [Edmunds](https://www.edmunds.com)

### 2026-02-16: Batch 7 Complete

- **Added 6 gap closer vehicles**: Nissan Xterra PRO-4X, Mitsubishi Montero Sport XLS, Jeep Wrangler 2-Door JL Rubicon, Jeep Wrangler 2-Door JK Rubicon, Jeep Wrangler 2-Door TJ Rubicon, Ford Bronco 2-Door Badlands
- **Vehicle count**: 179 → 185 (+6)
- **New makes**: Nissan Xterra and Mitsubishi Montero Sport now represented
- **2-door body styles**: Now includes short-wheelbase options for trail use
- **Budget used options**: Xterra ($15K), Montero Sport ($7K), Wrangler JK ($18K), Wrangler TJ ($15K)
- **Off-road scores**: Wrangler JL/JK (10.0), Wrangler TJ (9.5), Bronco Badlands (9.0), Xterra (6.5), Montero Sport (6.0)
- **Short wheelbase crawlers**: JL 2-door (93.4" wheelbase), TJ (93.4"), JK (95.4"), Bronco 2-door (100.4")
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: [Nissan](https://www.nissanusa.com), [Mitsubishi](https://www.mitsubishicars.com), [Jeep](https://www.jeep.com), [Ford](https://www.ford.com), [Quadratec](https://www.quadratec.com), [Edmunds](https://www.edmunds.com), [KBB](https://www.kbb.com), [U.S. News](https://cars.usnews.com)

### 2026-02-16: Batch 6 Complete

- **Added 9 electrified vehicles**: F-150 Lightning, F-150 PowerBoost, Silverado EV, Hummer EV Pickup, RAV4 Prime, Rivian R1T, Lexus TX 500h, Kia EV9, Wrangler 4xe Sahara
- **Vehicle count**: 170 → 179 (+9)
- **Electrified coverage**: Now 38 EVs/hybrids/PHEVs (21% of inventory)
- **Electric trucks**: F-150 Lightning (580hp), Silverado EV (760hp, 492mi range), Hummer EV Pickup (1,000hp), Rivian R1T (533hp)
- **New PHEVs**: RAV4 Prime (302hp, 42mi EV range), Wrangler 4xe Sahara (375hp)
- **New hybrids**: F-150 PowerBoost (430hp, 700+ mi range), TX 500h (366hp)
- **3-row EVs**: Kia EV9 (379hp, 304mi range)
- **Skipped**: Tundra i-Force Max (TRD Pro/1794 exist), TX 550h+ (exists), Sorento Hybrid/PHEV (exist), Santa Fe Hybrid (exists), Grand Cherokee 4xe (Summit/Overland/Trailhawk exist), Wrangler 4xe Rubicon (exists)
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: [Ford](https://www.ford.com), [Chevrolet](https://www.chevrolet.com), [GMC](https://www.gmc.com), [Toyota](https://www.toyota.com), [Rivian](https://rivian.com), [Lexus](https://www.lexus.com), [Kia](https://www.kia.com), [Jeep](https://www.jeep.com), [Edmunds](https://www.edmunds.com), [KBB](https://www.kbb.com)

### 2026-02-16: Batch 5 Complete

- **Added 4 diesel trucks**: Ram 1500 Laramie EcoDiesel, Chevrolet Silverado 1500 LT Duramax, Jeep Gladiator Rubicon EcoDiesel (used), Ford F-150 Lariat Power Stroke (used)
- **Vehicle count**: 166 → 170 (+4)
- **Diesel coverage**: Now 5 diesel vehicles total (was 1 Ford Excursion)
- **Note**: Wrangler EcoDiesel and Gladiator EcoDiesel discontinued after 2023; F-150 Power Stroke discontinued after 2021
- **Torque kings**: Ram EcoDiesel (480 lb-ft), Duramax (495 lb-ft), Gladiator (442 lb-ft), Power Stroke (440 lb-ft)
- **Off-road scores**: Gladiator EcoDiesel (10.0 - Rubicon with lockers), Ram/F-150 (7.0), Silverado (6.0)
- **Fuel economy**: All at 24-26 mpg combined - best efficiency among full-size trucks
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: [Ram Trucks](https://www.ramtrucks.com), [Chevrolet](https://www.chevrolet.com), [Jeep](https://www.jeep.com), [Ford Media](https://www.fromtheroad.ford.com), [DieselResource](https://dieselresource.com), [Edmunds](https://www.edmunds.com), [KBB](https://www.kbb.com), [UltimateSpecs](https://www.ultimatespecs.com)

### 2026-02-16: Batch 4 Complete

- **Added 5 fill-the-gap vehicles**: VW Atlas Cross Sport 4MOTION, Volvo V60 Cross Country, Volvo V90 Cross Country, GMC Canyon AT4X, GMC Sierra 1500 AT4X
- **Vehicle count**: 161 → 166 (+5)
- **Note**: Outback Wilderness and MDX Type S were already in database, skipped
- **New makes**: Volkswagen now represented
- **New body style**: Wagons (V60/V90 Cross Country)
- **Off-road range**: Canyon AT4X (9.0), Sierra AT4X (9.5) with front/rear e-lockers
- **Luxury wagons**: V60 CC (5.7), V90 CC (6.1) - Scandinavian premium
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: [Subaru USA](https://www.subaru.com), [Volkswagen USA](https://www.vw.com), [Volvo Cars](https://www.volvocars.com), [GMC](https://www.gmc.com), [Edmunds](https://www.edmunds.com), [U.S. News](https://cars.usnews.com), [KBB](https://www.kbb.com)

### 2026-02-16: Batch 3 Complete

- **Added 6 budget classics**: Land Cruiser 80 Series, Land Cruiser 100 Series, Jeep Cherokee XJ, 4Runner 4th Gen V8, Discovery 3/LR3, Ford Bronco 5th Gen
- **Vehicle count**: 155 → 161 (+6)
- **Budget/Classic coverage**: Iconic overlanders from $10-25K used market
- **New capability range**: Off-road scores from 5.2 (Bronco) to 9 (LC80 with triple-lock capability)
- **Reliability range**: 4 (LR3 known issues) to 9 (Land Cruisers legendary)
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: [CLASSIC.COM](https://www.classic.com), [FLEX Automotive](https://flexmotor.com), [Cool Cruisers](https://www.coolcruisers.com), [Edmunds](https://www.edmunds.com), [autoevolution](https://www.autoevolution.com), [CarBuzz](https://carbuzz.com), [Jeep Database](https://www.jeepdatabase.com), [Bronco Nation](https://thebronconation.com)

### 2026-02-16: Batch 2d Complete

- **Added 5 compact PHEVs**: Tucson PHEV, Sportage PHEV, Escape PHEV, NX 450h+, RX 450h+
- **Vehicle count**: 150 → 155 (+5)
- **PHEV coverage**: Now 19 PHEVs total (12% of inventory)
- **Note**: Subaru Crosstrek PHEV discontinued for 2024-2025 (returning as non-PHEV hybrid in 2026)
- **MPGe range**: 77-101 MPGe across new vehicles
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: [Hyundai USA](https://www.hyundainews.com), [Kia Media](https://www.kiamedia.com), [Ford Media](https://www.fromtheroad.ford.com), [Lexus USA](https://www.lexus.com), [Edmunds](https://www.edmunds.com), [U.S. News](https://cars.usnews.com)

### 2026-02-16: Batch 2c Complete

- **Added 11 fuel-efficient hybrids**: RAV4 Hybrid, Highlander Hybrid, Venza, CR-V Hybrid, Tucson Hybrid, Santa Fe Hybrid, Sportage Hybrid, Sorento Hybrid, Escape Hybrid, NX 350h, RX 350h
- **Vehicle count**: 139 → 150 (+11)
- **Hybrid coverage**: Now 27 hybrids total (18% of inventory)
- **MPG ≥30**: Significant boost with vehicles ranging 33-41 mpg
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: Toyota.com, Honda.com, Hyundai.com, Kia.com, Ford.com, Lexus.com, Edmunds, Car and Driver

### 2026-02-16: Batch 2b Complete

- **Added 6 classic small 4x4s**: Suzuki Samurai, Suzuki Sidekick, Geo Tracker, Suzuki Grand Vitara, Isuzu Rodeo, Isuzu Amigo
- **Vehicle count**: 133 → 139 (+6)
- **Classic/Budget coverage**: Now includes iconic lightweight crawlers and budget overlanders
- **New makes**: Suzuki, Geo, Isuzu now represented
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully
- Data sources: [Zuki Offroad](https://www.zukioffroad.com/), [Edmunds](https://www.edmunds.com/), [AutoPadre](https://www.autopadre.com/), [Cars.com](https://www.cars.com/)

### 2026-02-16: Batch 2 Complete

- **Added 8 compact off-roaders**: Renegade Trailhawk, Compass Trailhawk, RAV4 TRD Off-Road, Crosstrek Wilderness, Bronco Sport Badlands, CX-50 Meridian, Tucson XRT, Sportage X-Pro
- **Vehicle count**: 125 → 133 (+8)
- **Compact coverage**: Now includes Jeep, Toyota, Subaru, Ford, Mazda, Hyundai, Kia
- Note: Pilot TrailSport was already in the database
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully

### 2026-02-16: Batch 1 Complete

- **Added 9 trucks**: F-150 Raptor, F-150 Tremor, Tundra TRD Pro, Tundra 1794, Silverado ZR2, Colorado ZR2, Ram TRX, Ram Rebel, Ranger Raptor
- **Vehicle count**: 116 → 125 (+9)
- **Truck coverage**: Now includes Ford, Toyota, Chevrolet, Ram
- All data files updated: manual-specs.json, verified-updates.json, generation-data.json, offroad-features.json, horsepower-data.json, luxury-features.json, size-data.json
- Calculation scripts run successfully

---

## Current State (215 vehicles)

### By Size

| Size    | Count | % of total |
| ------- | ----: | ---------: |
| Mid     |   112 |        52% |
| Full    |    61 |        28% |
| Compact |    42 |        20% |

### By Powertrain

| Powertrain | Count | % of total |
| ---------- | ----: | ---------: |
| Gas        |   141 |        66% |
| Hybrid     |    31 |        14% |
| PHEV       |    22 |        10% |
| EV         |    16 |         7% |
| Diesel     |     5 |         2% |

### By Body Type

| Body  | Count | % of total |
| ----- | ----: | ---------: |
| SUV   |   133 |        62% |
| CUV   |    44 |        20% |
| Truck |    34 |        16% |
| Wagon |     4 |         2% |

### By Price

| Range      | Count |
| ---------- | ----: |
| Under $30K |    34 |
| $30-50K    |    66 |
| $50-80K    |    74 |
| $80-120K   |    34 |
| $120K+     |     7 |

### By Fuel Economy

| MPG Range | Count |
| --------- | ----: |
| <15       |    18 |
| 15-19     |    74 |
| 20-24     |    54 |
| 25-29     |    27 |
| 30+       |    42 |

### Makes with thin coverage

| Make | Count | Notes                                |
| ---- | ----: | ------------------------------------ |
| Dodge |    1 | Durango R/T only                     |
| Geo  |     1 | Only Tracker (classic)               |
| Hummer |   1 | Only H2 (classic)                    |
| Ineos |    1 | Grenadier Trialmaster only           |
| Acura |    2 | MDX Type S + RDX A-Spec              |
| Cadillac | 2 | Escalade only                        |
| Genesis |  2 | GV70/GV80                            |
| Infiniti | 2 | QX80 only (2 gens)                   |
| Lincoln |  2 | Aviator/Navigator                    |
| Isuzu |    3 | All classics                         |
| Rivian |   3 | R1S (2 gens) + R1T                   |
| Suzuki |   3 | All classics                         |
| Tesla |    3 | Cybertruck (2 gens) + Model X        |
| VW   |     3 | Atlas Cross Sport, Tiguan, Atlas     |

### Missing makes (active US-market brands with 0 coverage)

None — all major US-market brands now represented.

### Missing segments

| Segment | Impact | Notes |
| ------- | ------ | ----- |
| **Vans** | High | Zero van coverage. Sprinter 4x4, Transit Trail, VW Vanagon are core overland platforms |
| **Heavy-duty trucks** | High | Zero HD coverage. Ram 2500 Cummins, F-250 Power Stroke, Silverado HD are top expedition rigs |

### Missing mainstream models (brand present, popular model absent)

All previously missing mainstream models resolved in Batch 11:
- ~~Ford Explorer~~ ✅ Timberline added
- ~~Nissan Rogue~~ ✅ SL AWD added
- ~~Nissan Armada~~ ✅ Platinum 4WD added
- ~~Chevy Equinox~~ ✅ RS AWD added
- ~~Mazda CX-5~~ ✅ 2.5 Turbo Premium added
- ~~BMW X3~~ ✅ xDrive30i added
- ~~Subaru Forester Wilderness~~ Already existed as `forester_wilderness`

### Generation gaps (model present, popular generation missing)

| Model | Missing gen | Price range | Notes |
| ----- | ----------- | ----------- | ----- |
| Wrangler YJ | 1987-1995 | $10-20K | Extremely common in used builds; TJ/JK/JL covered |
| Tacoma 3rd Gen | 2016-2023 | $25-35K | Most common used Tacoma; only 4th gen present |
| 4Runner 3rd Gen | 1996-2002 | $10-20K | Popular budget overlander; 4th/5th/6th gen present |
| F-150 13th Gen | 2015-2020 | $20-30K | Pre-PowerBoost gen; common budget build platform |

### Price gap: $15K-$25K

Only ~9 vehicles in this range. This is the entry-level used SUV tier. Older generation entries (Tacoma 3rd Gen, 4Runner 3rd Gen, F-150 13th Gen, Explorer 5th Gen) would naturally fill it.

### Resolved gaps

- ~~**Volume truck trims**~~: ✅ Resolved — F-150 XLT, Tacoma SR5, Silverado Trail Boss, Ram Big Horn added in Batch 9
- ~~**Honda gas options**~~: ✅ Resolved — CR-V EX-L, HR-V EX-L, Ridgeline RTL added in Batch 9
- ~~**Audi mid-range**~~: ✅ Resolved — Q5, Q7, Q8 e-tron, A6 Allroad added in Batches 9-10
- ~~**Ram volume trims**~~: ✅ Resolved — Big Horn added in Batch 9
- ~~**Wagons**~~: ✅ Resolved — A6 Allroad added in Batch 10 (now 4 wagons)
- ~~**Dodge coverage**~~: ✅ Resolved — Durango R/T AWD added in Batch 11
- ~~**Missing mainstream models**~~: ✅ Resolved — Explorer, Armada, Rogue, Equinox, CX-5, X3 added in Batch 11

---

## Batch 9: Volume trucks + Honda (8 vehicles)

Fill the biggest market-share gaps: best-selling truck trims and Honda's core lineup.

| ID | Make | Model | Trim | PT | Est. Price | Notes |
|----|------|-------|------|----|-----------|-------|
| f150_xlt | Ford | F-150 | XLT 4WD | gas | $45K | America's best-selling vehicle, volume trim |
| tacoma_sr5 | Toyota | Tacoma | SR5 4WD | gas | $35K | Volume mid-size truck |
| silverado_lt_trail_boss | Chevrolet | Silverado 1500 | LT Trail Boss | gas | $52K | Volume full-size with off-road package |
| ram_1500_big_horn | Ram | 1500 | Big Horn 4WD | gas | $45K | Volume full-size truck |
| crv_exl | Honda | CR-V | EX-L AWD | gas | $37K | Best-selling non-truck in the US |
| hrv_exl | Honda | HR-V | EX-L AWD | gas | $28K | Subcompact CUV entry point |
| ridgeline_rtl | Honda | Ridgeline | RTL AWD | gas | $42K | Unibody mid-size truck |
| q5_quattro | Audi | Q5 | Premium Plus 45 Quattro | gas | $50K | Premium mid-size AWD, fills Audi gap |

## Batch 10: Premium AWD + Wagons (5 vehicles)

Fill Audi lineup and wagon body type gap.

| ID | Make | Model | Trim | PT | Est. Price | Notes |
|----|------|-------|------|----|-----------|-------|
| q7_quattro | Audi | Q7 | Premium Plus 55 Quattro | gas | $63K | Premium 3-row AWD |
| q8_etron | Audi | Q8 e-tron | Prestige Quattro | ev | $75K | Electric premium SUV |
| a6_allroad | Audi | A6 Allroad | Premium Plus | gas | $58K | Lifted wagon, fills wagon + Audi gap |
| crosstrek_premium | Subaru | Crosstrek | Premium AWD | gas | $30K | Gas base CUV (only have Wilderness) |
| atlas_peak | Volkswagen | Atlas | Peak Edition 4MOTION | gas | $45K | Mid-size 3-row, fills VW gap |

---

## Expansion Targets

### Priority 1: Trucks (High demand, underrepresented)

| Make      | Model          | Trims to add                | Generations                            | Data sources      |
| --------- | -------------- | --------------------------- | -------------------------------------- | ----------------- |
| Toyota    | Tundra         | SR5, TRD Pro, 1794          | 3rd Gen (2022+), 2nd Gen (2014-2021)   | EPA, Toyota specs |
| Ford      | F-150          | XLT, Lariat, Raptor, Tremor | 14th Gen (2021+), 13th Gen (2015-2020) | EPA, Ford specs   |
| Ford      | Ranger         | XLT, Lariat, Raptor         | Current (2024+), Previous (2019-2023)  | EPA, Ford specs   |
| Chevrolet | Silverado 1500 | LT Trail Boss, ZR2          | 4th Gen (2019+)                        | EPA, Chevy specs  |
| Chevrolet | Colorado       | Z71, ZR2, Trail Boss        | 3rd Gen (2023+), 2nd Gen (2015-2022)   | EPA, Chevy specs  |
| GMC       | Sierra 1500    | AT4, AT4X                   | 5th Gen (2019+)                        | EPA, GMC specs    |
| GMC       | Canyon         | AT4, AT4X                   | 3rd Gen (2023+)                        | EPA, GMC specs    |
| Nissan    | Frontier       | PRO-4X, PRO-X               | 3rd Gen (2022+)                        | EPA, Nissan specs |
| Ram       | 1500           | Laramie, Rebel, TRX         | 5th Gen (2019+)                        | EPA, Ram specs    |

### Priority 2: Compact/Crossover (Budget-friendly, trail-capable)

| Make       | Model        | Trims to add            | Generations                           | Data sources       |
| ---------- | ------------ | ----------------------- | ------------------------------------- | ------------------ |
| Jeep       | Renegade     | Trailhawk               | Current (2015+)                       | EPA, Jeep specs    |
| Jeep       | Compass      | Trailhawk               | Current (2017+)                       | EPA, Jeep specs    |
| Subaru     | Crosstrek    | Premium, Wilderness     | Current (2024+), Previous (2018-2023) | EPA, Subaru specs  |
| Toyota     | RAV4         | TRD Off-Road, Adventure | Current (2019+)                       | EPA, Toyota specs  |
| Ford       | Bronco Sport | Badlands, Heritage      | Current (2021+)                       | EPA, Ford specs    |
| Jeep       | Cherokee     | Trailhawk               | KL (2014-2023)                        | EPA, Jeep specs    |
| Honda      | CR-V         | EX-L, Sport-L           | 6th Gen (2023+)                       | EPA, Honda specs   |
| Mazda      | CX-50        | Premium Plus, Meridian  | Current (2023+)                       | EPA, Mazda specs   |
| Hyundai    | Tucson       | XRT, Limited            | Current (2022+)                       | EPA, Hyundai specs |
| Kia        | Sportage     | X-Pro, X-Line           | Current (2023+)                       | EPA, Kia specs     |
| Volkswagen | Atlas        | Peak, Cross Sport       | Current (2024+)                       | EPA, VW specs      |
| Volkswagen | Tiguan       | SE R-Line               | 2nd Gen (2018+)                       | EPA, VW specs      |

### Priority 2b: Classic small 4x4s (Cult favorites, budget entry)

| Make      | Model               | Years                | Price target | Notes                         |
| --------- | ------------------- | -------------------- | ------------ | ----------------------------- |
| Suzuki    | Samurai             | 1986-1995            | $8-20K       | Legendary lightweight crawler |
| Suzuki    | Sidekick            | 1989-1998            | $5-12K       | Soft-top and hardtop          |
| Geo/Chevy | Tracker             | 1989-2004            | $4-10K       | Rebadged Sidekick/Vitara      |
| Suzuki    | Vitara/Grand Vitara | 1999-2013            | $5-15K       | More refined than Sidekick    |
| Isuzu     | Amigo               | 1989-1994, 1998-2000 | $5-12K       | Compact 2-door                |
| Isuzu     | Rodeo               | 1991-2004            | $4-10K       | Mid-size, V6 available        |
| Suzuki    | Jimny               | 2018+                | $20-30K      | Import only (JDM/global)      |
| Daihatsu  | Rocky               | 1990-1999            | $8-15K       | Rare but capable              |

### Priority 2c: Fuel-Efficient Hybrids (30+ mpg, AWD capable)

Addresses the gap: only 24 vehicles currently have mpg >= 23, and most are EVs/PHEVs.

| Make    | Model             | Powertrain  | MPG      | Notes                                  |
| ------- | ----------------- | ----------- | -------- | -------------------------------------- |
| Toyota  | RAV4 Hybrid       | Hybrid      | 40-41    | Best-selling hybrid SUV, AWD standard  |
| Toyota  | RAV4 Prime        | PHEV        | 94 MPGe  | 42 mi EV range, 302 hp (already in P6) |
| Toyota  | Highlander Hybrid | Hybrid      | 35-36    | 3-row, AWD available                   |
| Toyota  | Venza             | Hybrid      | 39-40    | AWD standard, coupe-like styling       |
| Honda   | CR-V Hybrid       | Hybrid      | 40       | AWD available, practical               |
| Honda   | CR-V FHEV         | Hybrid      | 40       | Fuel cell variant if available         |
| Subaru  | Crosstrek Hybrid  | PHEV        | 90 MPGe  | 17 mi EV range, Wilderness styling     |
| Hyundai | Tucson Hybrid     | Hybrid      | 37-38    | AWD available, XRT-style possible      |
| Hyundai | Tucson PHEV       | PHEV        | 80 MPGe  | 33 mi EV range                         |
| Hyundai | Santa Fe Hybrid   | Hybrid      | 34-36    | AWD, XRT trim                          |
| Kia     | Sportage Hybrid   | Hybrid      | 39       | AWD, X-Line available                  |
| Kia     | Sportage PHEV     | PHEV        | 84 MPGe  | 34 mi EV range                         |
| Kia     | Sorento Hybrid    | Hybrid      | 35-37    | 3-row, AWD                             |
| Ford    | Escape Hybrid     | Hybrid      | 41       | AWD available, best-in-class mpg       |
| Ford    | Escape PHEV       | PHEV        | 102 MPGe | 37 mi EV range                         |
| Lexus   | NX 350h           | Hybrid      | 39-41    | Luxury compact, AWD                    |
| Lexus   | NX 450h+          | PHEV        | 84 MPGe  | 37 mi EV range                         |
| Lexus   | RX 350h/450h+     | Hybrid/PHEV | 33-36    | Luxury midsize                         |

### Priority 3: Fill gaps in existing coverage

| Make   | Model                                | Trims to add              | Notes                             |
| ------ | ------------------------------------ | ------------------------- | --------------------------------- |
| Honda  | Pilot                                | TrailSport, Black Edition | TrailSport is their off-road trim |
| Acura  | MDX                                  | Type S, A-Spec            | Add more trims                    |
| Subaru | Outback                              | Onyx, Wilderness          | Wilderness is the off-road star   |
| Mazda  | CX-70, CX-80                         | PHEV variants             | New larger Mazdas                 |
| Volvo  | V60 Cross Country, V90 Cross Country | -                         | Wagon alternatives                |
| Audi   | Q5, e-tron                           | Quattro variants          | Fill mid-size gap                 |

### Priority 4: Used/Classic (Budget segment)

| Make       | Model            | Generations | Price target | Notes                  |
| ---------- | ---------------- | ----------- | ------------ | ---------------------- |
| Toyota     | Land Cruiser 80  | 1990-1997   | $15-35K      | Legendary overlander   |
| Toyota     | Land Cruiser 100 | 1998-2007   | $15-30K      | V8, available lockers  |
| Jeep       | Cherokee XJ      | 1984-2001   | $8-20K       | Cult classic           |
| Nissan     | Patrol Y61       | 1997-2010   | $20-40K      | If available in market |
| Land Rover | Discovery 3/LR3  | 2005-2009   | $10-20K      | Capable when working   |
| Toyota     | 4Runner 4th Gen  | 2003-2009   | $15-25K      | V8 option              |
| Ford       | Bronco (classic) | 1966-1996   | $20-80K      | Resurgent popularity   |

### Priority 5: Diesel options

| Make      | Model               | Notes                              |
| --------- | ------------------- | ---------------------------------- |
| Ram       | 1500 EcoDiesel      | 3.0L V6 diesel                     |
| Chevrolet | Silverado Duramax   | 3.0L diesel                        |
| Ford      | F-150 Power Stroke  | 3.0L V6 diesel                     |
| Jeep      | Wrangler EcoDiesel  | 3.0L V6 diesel (discontinued 2024) |
| Jeep      | Gladiator EcoDiesel | 3.0L V6 diesel                     |

### Priority 6: Electrified expansion (Hybrid/PHEV/EV gap)

| Make      | Model                   | Powertrain  | Notes                                      |
| --------- | ----------------------- | ----------- | ------------------------------------------ |
| Ford      | F-150 Lightning         | EV          | Electric truck, 300+ mile range            |
| Ford      | F-150 PowerBoost        | Hybrid      | 430 hp hybrid, 700+ mile range             |
| Chevrolet | Silverado EV            | EV          | Electric truck, RST & Trail Boss trims     |
| GMC       | Hummer EV Pickup        | EV          | Extreme capability, CrabWalk               |
| Ram       | 1500 REV                | EV          | Coming 2025                                |
| Toyota    | Tundra i-Force Max      | Hybrid      | 437 hp hybrid                              |
| Toyota    | Grand Highlander Hybrid | Hybrid      | 3-row hybrid                               |
| Lexus     | TX 500h/550h+           | Hybrid/PHEV | New 3-row, hybrid & PHEV                   |
| Hyundai   | Santa Fe Hybrid/PHEV    | Hybrid/PHEV | Updated 2024+                              |
| Kia       | Sorento Hybrid/PHEV     | Hybrid/PHEV | X-Line available                           |
| Toyota    | RAV4 Prime              | PHEV        | 42 miles EV range, TRD coming              |
| Subaru    | Crosstrek PHEV          | PHEV        | Wilderness-style possible                  |
| Volvo     | XC60 Recharge           | PHEV        | Off-road capable                           |
| Rivian    | R1T                     | EV          | Already have R1S, add truck                |
| Ford      | Mustang Mach-E Rally    | EV          | Performance + light off-road               |
| Kia       | EV9                     | EV          | 3-row electric SUV                         |
| Jeep      | Grand Cherokee 4xe      | PHEV        | Base trim (have Summit/Overland/Trailhawk) |
| Jeep      | Wrangler 4xe Sahara     | PHEV        | Non-Rubicon PHEV option                    |

### Priority 7: Gap closers (budget, body styles)

| Make       | Model           | Category    | Price   | Notes                                   |
| ---------- | --------------- | ----------- | ------- | --------------------------------------- |
| Nissan     | Xterra 2nd Gen  | Budget used | $8-15K  | 2005-2015, PRO-4X trim                  |
| Mitsubishi | Montero Sport   | Budget used | $6-12K  | 1997-2004, solid axle                   |
| Jeep       | Wrangler 2-door | Body style  | $35-50K | JL 2-door, shorter wheelbase for trails |
| Jeep       | Wrangler 2-door | Body style  | $20-35K | JK 2-door                               |
| Jeep       | Wrangler 2-door | Body style  | $12-25K | TJ 2-door                               |
| Ford       | Bronco 2-door   | Body style  | $35-55K | Sasquatch, Wildtrak                     |

---

## Data Collection Workflow

### For each new vehicle, collect:

#### 1. EPA Data (automated via existing scripts)

```bash
# Fetch from fueleconomy.gov API
node scripts/fetch-vehicle-data.mjs
```

- `mpg` - Combined fuel economy
- VClass for size classification

#### 2. NHTSA Data (automated)

```bash
node scripts/fetch-nhtsa-specs.mjs
```

- `weight` - Curb weight (verify against manufacturer)

#### 3. Manual Research (add to scripts/\*.json)

**manual-specs.json** - Manufacturer spec sheets, Car and Driver, MotorTrend:

- `tow` - Towing capacity
- `cargo` - Cargo volume (behind 2nd row)
- `gc` - Ground clearance
- `weight` - Curb weight (if NHTSA unavailable)

**verified-updates.json** - KBB, Edmunds, manufacturer sites:

- `price` - MSRP (new) or typical market price (used)
- `pt` - Powertrain type

**generation-data.json** - Wikipedia, manufacturer archives:

- `yearStart`, `yearEnd` - Production years
- `generation` - Generation identifier

**offroad-features.json** - Manufacturer specs, off-road reviews:

- 4WD system type (AWD, full-time, part-time, selectable)
- Low range availability
- Locker configuration (front/center/rear)

**horsepower-data.json** - Manufacturer specs:

- Horsepower for performance calculation

**luxury-features.json** - Build & price tools, reviews:

- Brand tier, interior materials, features, tech, quietness

#### 4. Calculate derived scores

```bash
node scripts/calculate-offroad-scores.mjs
node scripts/calculate-performance-scores.mjs
node scripts/calculate-luxury-scores.mjs
```

---

## Data Sources Reference

| Field            | Primary Source             | Backup Source                 |
| ---------------- | -------------------------- | ----------------------------- |
| mpg              | EPA fueleconomy.gov API    | Manufacturer specs            |
| weight           | NHTSA API                  | Manufacturer specs            |
| tow              | Manufacturer towing guides | Car and Driver                |
| cargo            | Manufacturer specs         | MotorTrend tests              |
| gc               | Manufacturer specs         | Off-road reviews              |
| price (new)      | Manufacturer MSRP          | KBB, Edmunds                  |
| price (used)     | KBB, Edmunds               | Cars.com, Autotrader          |
| reliability      | JD Power VDS               | Consumer Reports              |
| year/gen         | Wikipedia                  | Manufacturer archives         |
| offroad features | Manufacturer specs         | Forum research (IH8MUD, etc.) |

See the **Web Research Guide** in [README.md](README.md#web-research-guide-for-llm-agents) for search strategy.

---

## Suggested Batch Order

### Batch 1: Core trucks (8-10 vehicles) ✅ COMPLETE

- ✅ F-150 Raptor, F-150 Tremor
- ✅ Tundra TRD Pro, Tundra 1794
- ✅ Silverado ZR2, Colorado ZR2
- ✅ Ram TRX, Ram Rebel
- ✅ Ranger Raptor

### Batch 2: Compact off-roaders (8 vehicles) ✅ COMPLETE

- ✅ Jeep Renegade Trailhawk
- ✅ Jeep Compass Trailhawk
- ✅ RAV4 TRD Off-Road
- ✅ Crosstrek Wilderness
- ✅ Bronco Sport Badlands
- ✅ CX-50 Meridian
- ✅ Tucson XRT
- ✅ Sportage X-Pro
- ✅ Pilot TrailSport (already existed)

### Batch 2b: Classic small 4x4s (6 vehicles) ✅ COMPLETE

- ✅ Suzuki Samurai
- ✅ Suzuki Sidekick
- ✅ Geo Tracker
- ✅ Suzuki Grand Vitara
- ✅ Isuzu Rodeo
- ✅ Isuzu Amigo

### Batch 2c: Fuel-efficient hybrids (11 vehicles) ✅ COMPLETE

- ✅ RAV4 Hybrid, Highlander Hybrid, Venza
- ✅ CR-V Hybrid
- ✅ Tucson Hybrid, Santa Fe Hybrid
- ✅ Sportage Hybrid, Sorento Hybrid
- ✅ Escape Hybrid
- ✅ NX 350h, RX 350h

### Batch 2d: Compact PHEVs (5 vehicles) ✅ COMPLETE

- ✅ Tucson PHEV, Sportage PHEV
- ✅ Escape PHEV
- ⏭️ Crosstrek Hybrid (PHEV) - SKIPPED: Discontinued for 2024-2025
- ✅ NX 450h+, RX 450h+

### Batch 3: Budget classics (6 vehicles) ✅ COMPLETE

- ✅ Land Cruiser 80 Series
- ✅ Land Cruiser 100 Series
- ✅ Jeep Cherokee XJ
- ✅ Toyota 4Runner 4th Gen V8
- ✅ Land Rover Discovery 3/LR3
- ✅ Ford Bronco 5th Gen (1992-1996)

### Batch 4: Fill coverage gaps (6-8 vehicles) ✅ COMPLETE

- ⏭️ Outback Wilderness - SKIPPED: Already in database
- ✅ Atlas Cross Sport 4MOTION
- ✅ V60 Cross Country, V90 Cross Country
- ✅ Canyon AT4X
- ✅ Sierra AT4X
- ⏭️ MDX Type S - SKIPPED: Already in database

### Batch 5: Diesel variants (4 vehicles) ✅ COMPLETE

- ✅ Ram 1500 Laramie EcoDiesel
- ✅ Chevrolet Silverado 1500 LT Duramax
- ✅ Jeep Gladiator Rubicon EcoDiesel (used - discontinued 2023)
- ✅ Ford F-150 Lariat Power Stroke (used - discontinued 2021)
- ⏭️ Jeep Wrangler EcoDiesel - SKIPPED: Discontinued 2023, Rubicon gas already in database

### Batch 6: Electrified (9 vehicles) ✅ COMPLETE

- ✅ F-150 Lightning, F-150 PowerBoost
- ✅ Silverado EV, Hummer EV Pickup
- ⏭️ Tundra i-Force Max - SKIPPED: TRD Pro and 1794 (both hybrid) already exist
- ✅ RAV4 Prime
- ⏭️ Santa Fe Hybrid/PHEV - SKIPPED: Santa Fe Hybrid exists, no 2025 PHEV variant
- ⏭️ Sorento Hybrid/PHEV - SKIPPED: Both already in database
- ✅ Rivian R1T
- ✅ TX 500h (⏭️ TX 550h+ already exists)
- ✅ Kia EV9
- ⏭️ Grand Cherokee 4xe base - SKIPPED: Summit/Overland/Trailhawk exist
- ✅ Wrangler 4xe Sahara

### Batch 7: Gap closers (6 vehicles) ✅ COMPLETE

- ✅ Xterra PRO-4X (used)
- ✅ Montero Sport XLS (used)
- ✅ Wrangler 2-door JL Rubicon
- ✅ Wrangler 2-door JK Rubicon (used)
- ✅ Wrangler 2-door TJ Rubicon (used)
- ✅ Bronco 2-door Badlands

### Batch 8: Mainstream gaps & compact trucks (10 vehicles) ✅ COMPLETE

- ✅ Ford Maverick Tremor (compact truck, gas 2.0T, $41K)
- ✅ Hyundai Santa Cruz SEL AWD (compact truck, gas 2.5L, $32K)
- ✅ Nissan Frontier PRO-4X (mid truck, gas 3.8L V6, $42K)
- ✅ Toyota Tacoma TRD Off-Road (mid truck, gas 2.4T, $43K)
- ✅ Ford Ranger XLT 4WD (mid truck, gas 2.7L V6, $35K)
- ✅ Subaru Ascent Onyx Edition (mid SUV, gas 2.4T boxer, $44K)
- ✅ Mazda CX-70 PHEV (mid CUV, PHEV 2.5T, $54K)
- ✅ VW Tiguan SE R-Line 4MOTION (compact CUV, gas 2.0T, $39K)
- ✅ Acura RDX A-Spec SH-AWD (compact CUV, gas 2.0T, $48K)
- ✅ Ineos Grenadier Trialmaster (mid SUV, gas BMW I6, $95K)

### Batch 9: Volume trucks + Honda (8 vehicles) ✅ COMPLETE

- ✅ Ford F-150 XLT 4WD (full truck, gas, $52K)
- ✅ Toyota Tacoma SR5 4WD (mid truck, gas, $37K)
- ✅ Chevrolet Silverado 1500 LT Trail Boss (full truck, gas, $59K)
- ✅ Ram 1500 Big Horn 4WD (full truck, gas, $47K)
- ✅ Honda CR-V EX-L AWD (compact CUV, gas, $37K)
- ✅ Honda HR-V EX-L AWD (compact CUV, gas, $31K)
- ✅ Honda Ridgeline RTL AWD (mid truck, gas, $43K)
- ✅ Audi Q5 Premium Plus 45 Quattro (mid CUV, gas, $57K)

### Batch 10: Premium AWD + Wagons (5 vehicles) ✅ COMPLETE

- ✅ Audi Q7 Premium Plus 55 Quattro (full SUV, gas, $70K)
- ✅ Audi Q8 e-tron Prestige Quattro (mid SUV, ev, $75K — discontinued 2024)
- ✅ Audi A6 Allroad Premium Plus (mid wagon, gas, $58K)
- ✅ Subaru Crosstrek Premium AWD (compact CUV, gas, $27K)
- ✅ Volkswagen Atlas SE 4MOTION (mid SUV, gas, $40K)

### Batch 11: Missing mainstream models (7 vehicles) ✅ COMPLETE

- ✅ Dodge Durango R/T AWD (full SUV, gas, $54K — first Dodge entry)
- ✅ Ford Explorer Timberline 4WD (mid SUV, gas, $49K — discontinued 2024)
- ✅ Nissan Armada Platinum 4WD (full SUV, gas, $73K — redesigned 2025, Patrol-based)
- ✅ Nissan Rogue SL AWD (compact CUV, gas, $37K — top-selling compact)
- ✅ Chevrolet Equinox RS AWD (compact CUV, gas, $35K — redesigned 2025)
- ✅ Mazda CX-5 2.5 Turbo Premium AWD (compact CUV, gas, $38K — final year of 2nd gen)
- ✅ BMW X3 xDrive30i (compact CUV, gas, $50K — redesigned 2025 G45)
- ⏭️ Subaru Forester Wilderness — SKIPPED: Already in database as `forester_wilderness`

### Batch 12: Heavy-duty trucks + overland vans (8 vehicles)

Two entirely missing segments: HD trucks (expedition towing/diesel) and vans (van-life/overland).

| ID | Make | Model | Trim | PT | Est. Price | Body | Notes |
|----|------|-------|------|----|-----------|------|-------|
| ram_2500_cummins | Ram | 2500 | Laramie 4WD Cummins | diesel | $65K | truck | 6.7L Cummins, #1 HD expedition truck |
| f250_lariat | Ford | F-250 | Lariat 4WD Power Stroke | diesel | $70K | truck | 6.7L Power Stroke diesel |
| silverado_2500hd | Chevrolet | Silverado 2500HD | LT 4WD Duramax | diesel | $65K | truck | 6.6L Duramax diesel |
| sierra_2500hd_at4 | GMC | Sierra 2500HD | AT4 Duramax | diesel | $75K | truck | 6.6L Duramax, off-road package |
| sprinter_4x4 | Mercedes-Benz | Sprinter | 2500 4x4 Cargo | diesel | $65K | van | The defining overland van platform |
| transit_trail | Ford | Transit | Trail AWD | gas | $55K | van | Factory off-road van, EcoBoost |
| promaster_cargo | Ram | ProMaster | 2500 High Roof | gas | $45K | van | Popular van-life base; FWD only |
| vanagon_syncro | Volkswagen | Vanagon | Syncro GL | gas | $45K | van | Classic 1986-1991; cult overland icon (used) |

### Batch 13: Popular older generations (8 vehicles)

Fill the $15K-$30K used-market price gap with the most popular older generations.

| ID | Make | Model | Trim | PT | Est. Price | Body | Notes |
|----|------|-------|------|----|-----------|------|-------|
| wrangler_yj | Jeep | Wrangler | YJ Sahara | gas | $15K | suv | 1987-1995; extremely common used build; missing gen |
| tacoma_3rd_gen | Toyota | Tacoma | TRD Off-Road 3rd Gen | gas | $30K | truck | 2016-2023; most common used Tacoma |
| 4runner_3rd_gen | Toyota | 4Runner | SR5 3rd Gen | gas | $15K | suv | 1996-2002; popular budget overlander |
| f150_13th_gen | Ford | F-150 | XLT 4WD 13th Gen | gas | $25K | truck | 2015-2020; common budget build platform |
| explorer_5th_gen | Ford | Explorer | XLT 4WD 5th Gen | gas | $20K | suv | 2011-2019; last BOF Explorer is 2010 but 5th gen very common |
| highlander_3rd_gen | Toyota | Highlander | XLE AWD 3rd Gen | gas | $22K | suv | 2014-2019; popular used 3-row; only current gen present |
| discovery_4_lr4 | Land Rover | Discovery | 4/LR4 HSE | gas | $20K | suv | 2010-2016; more reliable than LR3, popular overlander |
| gx460 | Lexus | GX | 460 Premium | gas | $30K | suv | 2010-2023; Prado-based, legendary reliability; only GX 550 present |

### Batch 14: Segment fill + emerging (8 vehicles)

Round out thin coverage areas and add emerging/notable models.

| ID | Make | Model | Trim | PT | Est. Price | Body | Notes |
|----|------|-------|------|----|-----------|------|-------|
| durango_srt | Dodge | Durango | SRT 392 AWD | gas | $70K | suv | 475hp Hemi, performance full-size; complements R/T |
| hummer_h1 | Hummer | H1 | Alpha | diesel | $80K | suv | 2006 Alpha; iconic original; only H2 + EV present (used) |
| ioniq5_n | Hyundai | Ioniq 5 | N AWD | ev | $67K | cuv | 641hp performance EV; growing overland EV interest |
| wrangler_392 | Jeep | Wrangler | Rubicon 392 | gas | $80K | suv | 470hp V8 Wrangler; discontinued 2024, collector demand |
| outback_wilderness | Subaru | Outback | Wilderness | gas | $42K | wagon | Key trail wagon; verify not already in DB under different ID |
| glb_4matic | Mercedes-Benz | GLB | 250 4MATIC | gas | $45K | cuv | 7-seat compact luxury SUV; no small Mercedes CUV in inventory |
| cayenne_ehybrid | Porsche | Cayenne | E-Hybrid | phev | $90K | suv | Fill Porsche PHEV gap; 4 gas Cayennes but no electrified |
| bronco_raptor | Ford | Bronco | Raptor | gas | $88K | suv | 418hp twin-turbo; most extreme factory Bronco |

---

## Estimated Effort

| Batch | Vehicles | Est. time | Notes                                                                                                                              |
| ----- | -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1     | 9        | ✅ DONE   | Trucks have extensive spec data                                                                                                    |
| 2     | 8        | ✅ DONE   | Compact off-roaders (+1 already existed)                                                                                           |
| 2b    | 6        | ✅ DONE   | Classic 4x4s: Samurai, Sidekick, Tracker, Grand Vitara, Rodeo, Amigo                                                               |
| 2c    | 11       | ✅ DONE   | Fuel-efficient hybrids (RAV4, Highlander, Venza, CR-V, Tucson, Santa Fe, Sportage, Sorento, Escape, NX, RX)                        |
| 2d    | 5        | ✅ DONE   | Compact PHEVs (Crosstrek PHEV discontinued, skipped)                                                                               |
| 3     | 6        | ✅ DONE   | Budget classics: LC80, LC100, Cherokee XJ, 4Runner V8, LR3, Bronco 5th Gen                                                         |
| 4     | 5        | ✅ DONE   | Fill coverage gaps: Atlas Cross Sport, V60/V90 CC, Canyon/Sierra AT4X (+2 already existed)                                         |
| 5     | 4        | ✅ DONE   | Diesel variants: Ram EcoDiesel, Silverado Duramax, Gladiator EcoDiesel, F-150 Power Stroke                                         |
| 6     | 9        | ✅ DONE   | Electrified: F-150 Lightning/PowerBoost, Silverado EV, Hummer EV Pickup, RAV4 Prime, R1T, TX 500h, EV9, Wrangler 4xe Sahara        |
| 7     | 6        | ✅ DONE   | Gap closers: Xterra PRO-4X, Montero Sport, Wrangler 2-door JL/JK/TJ, Bronco 2-door                                                 |
| 8     | 10       | ✅ DONE   | Compact trucks (Maverick, Santa Cruz), volume trims (Frontier, Tacoma, Ranger), thin makes (Ascent, CX-70, Tiguan, RDX), Grenadier |
| 9     | 8        | ✅ DONE   | Volume trucks (F-150 XLT, Tacoma SR5, Silverado Trail Boss, Ram Big Horn), Honda gas (CR-V, HR-V, Ridgeline), Audi Q5 |
| 10    | 5        | ✅ DONE   | Premium AWD + Wagons: Audi Q7, Q8 e-tron, A6 Allroad, Crosstrek Premium, Atlas SE |
| 11    | 7        | ✅ DONE   | Missing mainstream: Durango R/T, Explorer Timberline, Armada Platinum, Rogue SL, Equinox RS, CX-5 Turbo, X3 (+1 already existed) |
| 12    | 8        | PLANNED   | HD trucks + vans: Ram 2500, F-250, Silverado HD, Sierra HD, Sprinter, Transit, ProMaster, Vanagon |
| 13    | 8        | PLANNED   | Older generations: Wrangler YJ, Tacoma 3rd, 4Runner 3rd, F-150 13th, Explorer 5th, Highlander 3rd, LR4, GX 460 |
| 14    | 8        | PLANNED   | Segment fill: Durango SRT, Hummer H1, Ioniq 5 N, Wrangler 392, Outback Wilderness, GLB, Cayenne E-Hybrid, Bronco Raptor |

**Batches 1-11: 99 vehicles added (116 → 215)**
**Batches 12-14: 24 vehicles planned (215 → 239)**

---

## Batch 8 Results

### Batch 8 (185 → 195) ✅ COMPLETE

```
NEW SEGMENTS FILLED
─────────────────────
Compact trucks:       0 →  2 (Maverick Tremor, Santa Cruz SEL)
Volume truck trims:   0 →  3 (Frontier PRO-4X, Tacoma TRD OR, Ranger XLT)
Total trucks:        24 → 29

THIN MAKES IMPROVED
─────────────────────
Subaru:       3 →  4 (+Ascent Onyx)
Mazda:        2 →  3 (+CX-70 PHEV)
Volkswagen:   1 →  2 (+Tiguan SE R-Line)
Acura:        1 →  2 (+RDX A-Spec)

NEW MAKE
─────────────────────
Ineos:        0 →  1 (Grenadier Trialmaster — purpose-built overlander)
```

---

## Success Metrics

### Batches 1-11 (complete)

- [x] At least 15 compact vehicles → 42
- [x] At least 20 trucks → 34
- [x] At least 30 vehicles under $30K → 34
- [x] At least 5 diesel options → 5
- [x] At least 30 hybrids → 31
- [x] At least 20 PHEVs → 22
- [x] At least 15 EVs → 16
- [x] At least 50 vehicles with mpg >= 23 → 69+
- [x] At least 25 vehicles with mpg >= 30 → 42
- [x] Coverage from all major US brands (VW, Ram, Suzuki, Nissan, Mitsubishi, Ineos, Dodge, Mazda, BMW added)
- [x] Better representation of Subaru (+Ascent, +Crosstrek Premium), Mazda (+CX-70, +CX-5), Acura (+RDX), VW (+Tiguan, +Atlas)
- [x] Classic/cult 4x4 representation (Samurai, Tracker, XJ, Xterra, Montero Sport)
- [x] 2-door body styles (Wrangler JL/JK/TJ, Bronco 2-door)
- [x] Compact truck segment (Maverick Tremor, Santa Cruz SEL)
- [x] Volume truck trims (F-150 XLT, Tacoma SR5, Silverado Trail Boss, Ram Big Horn, Frontier PRO-4X, Tacoma TRD OR, Ranger XLT)
- [x] Purpose-built overlander (Ineos Grenadier Trialmaster)
- [x] Honda gas lineup (CR-V EX-L, HR-V EX-L, Ridgeline RTL)
- [x] Audi coverage from $57K-$75K (Q5, Q7, Q8 e-tron, A6 Allroad)
- [x] Wagon body type (4 total: Outback, V60 CC, V90 CC, A6 Allroad)
- [x] Dodge coverage (Durango R/T AWD)
- [x] Every top-10 US-selling SUV/CUV nameplate represented (Explorer, Rogue, Equinox added)
- [x] Every body-on-frame full-size SUV represented (Armada added)

### Batches 12-14 (targets)

- [ ] Van body type (currently 0 → at least 3)
- [ ] Heavy-duty trucks (currently 0 → at least 4)
- [ ] At least 9 diesel options (currently 5 → add HD diesel trucks + Sprinter)
- [ ] $15K-$25K price range (currently ~9 → at least 15 with older gen entries)
- [ ] All Wrangler generations covered (add YJ)
- [ ] At least 240 total vehicles
- [ ] Older generation coverage for Tacoma, 4Runner, F-150, Highlander, GX

### Data quality fixes

- [x] Batch 7 missing body field — fixed 2026-02-16 (6 vehicles: Xterra, Montero Sport, Wrangler 2dr x3, Bronco 2dr)
- [x] Fixed 9 pre-existing `pt: "ice"` → `pt: "gas"` entries in verified-updates.json (land_cruiser_80, land_cruiser_100, cherokee_xj, 4runner_4th_gen_v8, discovery_3_lr3, bronco_5th_gen, atlas_cross_sport_4motion, canyon_at4x, sierra_at4x)
- [x] Apply-batch script should include `body` field when importing — resolved: `apply:all` includes `apply:body`, and README documents adding to `body-data.json`
