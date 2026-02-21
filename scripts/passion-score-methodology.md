# Passion Score — Methodology

## The Problem

Some vehicles inspire devotion that defies their spec sheets. The Land Rover
Defender is objectively less reliable than a 4Runner, but people cross continents
in them by choice. Alfa Romeo owners know they'll be on a first-name basis with
their mechanic, yet they wouldn't trade for anything. The Wrangler outsells
vehicles with better ride quality, fuel economy, and noise levels because
something about it transcends the spreadsheet.

The existing scoring system captures what a vehicle **is** — how capable,
luxurious, efficient, reliable, and powerful. The passion score captures what a
vehicle **means** — the community, culture, heritage, and identity that owners
build around it.

## Approach

Passion is subjective, but it manifests in observable, measurable behaviors. The
method: identify behaviors that passionate owners exhibit at higher rates than
the general car-buying population, and use those as quantifiable proxies.

Five sub-factors, each researchable from public sources, each capturing a
different facet of enthusiasm.

---

## Sub-factors

### 1. Community Scale (0–2.5 points)

**What it measures:** The size and activity of dedicated enthusiast communities,
considered relative to sales volume.

**Research sources:**
- Reddit subscriber counts for dedicated subreddits (r/4Runner, r/LandRover,
  r/Wrangler, r/LandCruisers, etc.)
- Dedicated forums and their activity (ih8mud.com, wranglerforum.com,
  expeditionportal.com vehicle-specific sections)
- Facebook group membership for vehicle-specific groups

**Scoring tiers:**
| Points | Criteria |
|--------|----------|
| 0 | No meaningful dedicated community beyond generic owner groups |
| 1 | Active subreddit or forum with moderate engagement |
| 2 | Multiple thriving communities across platforms |
| 2.5 | Legendary community presence — the vehicle defines a subculture |

**Why this works:** Every vehicle has *some* online presence. But when a Land
Cruiser has 50K dedicated forum members and a comparably-selling SUV has 2K,
that delta is passion. Normalizing mentally against sales volume avoids just
measuring market share.

**How to research:** Manual survey per vehicle. Count Reddit subscribers, check
forum post frequency (posts/week), tally Facebook group sizes. A niche vehicle
with 20K Reddit subscribers is more impressive than a mainstream vehicle with
50K.

### 2. Aftermarket Depth (0–2 points)

**What it measures:** The breadth of the aftermarket parts and accessories
ecosystem.

**Research sources:**
- Count of dedicated aftermarket brands (ARB, Old Man Emu, Warn, Icon, CBI,
  Goose Gear — who makes parts for this specific platform?)
- Parts catalog depth on aggregators (ExtremeTerrain, 4WheelParts, RealTruck)
- Existence of vehicle-specific aftermarket companies

**Scoring tiers:**
| Points | Criteria |
|--------|----------|
| 0 | OEM parts only, minimal aftermarket |
| 0.5 | Basic aftermarket (lift kits or bumpers from 1–2 brands) |
| 1 | Healthy ecosystem (multiple brands, variety of categories) |
| 1.5 | Deep aftermarket (dozens of brands, full build-out possible) |
| 2 | Industry unto itself (entire companies exist for this platform) |

**Why this works:** Aftermarket companies are profit-driven. They invest in
tooling and inventory only when they know passionate owners will buy. A deep
aftermarket is the market's verdict on owner enthusiasm.

**How to research:** Search major aftermarket retailers for each platform. Count
distinct brands offering parts. Check if vehicle-specific companies exist.

### 3. Heritage & Icon Status (0–2 points)

**What it measures:** Cultural significance, nameplate longevity, and
recognition beyond the automotive world.

**Research sources:**
- Nameplate age and continuity of production
- Appearances in film, TV, journalism, expedition history
- Recognition by non-car people ("even your neighbor knows what a Wrangler is")
- Use by notable organizations (UN, Red Cross, Camel Trophy, military)

**Scoring tiers:**
| Points | Criteria |
|--------|----------|
| 0 | No particular cultural resonance; a transportation appliance |
| 0.5 | Some heritage; recognized within the automotive community |
| 1 | Strong heritage; the nameplate carries weight and history |
| 1.5 | Cultural icon; recognized well beyond car enthusiasts |
| 2 | Legendary; the vehicle is synonymous with a concept |

**Why this works:** Heritage isn't just nostalgia — it's proof that a vehicle
has inspired people across generations. When a vehicle becomes a *symbol*
(Defender = exploration, Wrangler = freedom, Land Cruiser = go-anywhere), that's
the highest expression of passion.

**How to research:** Editorial judgment based on years in continuous production,
major film/TV appearances, use by expeditions or humanitarian organizations, and
general public recognition. This is the most editorial sub-factor, but the
calibration anchors keep it grounded.

### 4. Owner Identity (0–2 points)

**What it measures:** How strongly owners identify *with* the vehicle as a
lifestyle, not just *as owners of* a vehicle.

**Research sources:**
- Dedicated owner signals (Jeep wave, Land Cruiser wave)
- Bumper sticker and decal culture
- Owner club formality and activity (local chapters, annual meetups, trail runs)
- "I'd never sell it" sentiment in forums and communities

**Scoring tiers:**
| Points | Criteria |
|--------|----------|
| 0 | Owners view it as transportation; no tribal identity |
| 0.5 | Mild affinity; owners appreciate it but don't build identity around it |
| 1 | Visible owner community with signals and moderate loyalty |
| 1.5 | Strong tribal identity; owners wave, gather, and advocate |
| 2 | The vehicle is a lifestyle; owners organize their lives around it |

**Why this works:** When people wave at strangers because they drive the same
vehicle, that's passion you can't manufacture with marketing. Owner identity
signals are the behavioral manifestation of enthusiasm.

**How to research:** Look for dedicated hand signals/waves, active local club
chapters, annual gatherings (Jeep Jamboree, Overland Expo representation,
Toyota Cruiser meetups), and the general "would you sell it?" sentiment in owner
forums.

### 5. Irrational Resale Premium (0–1.5 points)

**What it measures:** Whether a vehicle retains value beyond what its objective
qualities (reliability, brand, segment) would predict.

**Research sources:**
- 5-year depreciation rates from KBB or Edmunds
- Compare actual resale against expected resale for the segment and reliability
  tier
- Dealer markup and waitlist data for new vehicles

**Scoring tiers:**
| Points | Criteria |
|--------|----------|
| 0 | Depreciates as expected or worse given its specs |
| 0.5 | Holds value slightly better than specs predict |
| 1 | Notable premium — commands prices reliability/specs don't explain |
| 1.5 | Extreme premium — used prices near MSRP; waitlists; market markup |

**Why this works:** This is passion expressed in dollars. When a 15-year-old
Land Cruiser costs more than a 5-year-old Tahoe with similar capability, the
market is literally pricing in the intangible. It's the most "objective" measure
of an inherently subjective quality.

**How to research:** Compare KBB/Edmunds 5-year depreciation against vehicles
of similar age, reliability, and segment. Flag outliers. Vehicles with multi-year
waitlists or persistent dealer markups get top marks.

---

## Formula

```
raw = community + aftermarket + heritage + identity + resale_premium
max_raw = 2.5 + 2 + 2 + 2 + 1.5 = 10

score = 1 + (raw / 10) * 9    // Normalized to 1–10
```

Rounded to nearest 0.5 (consistent with off-road score).

The formula intentionally uses a simple weighted sum rather than anything
multiplicative — a vehicle can score high by being exceptional on a few axes
without needing to be strong on all of them. A classic Defender with massive
heritage and identity but no Reddit presence still scores well.

---

## Calibration Anchors

These reference vehicles establish the range before scoring the full dataset.
If the formula doesn't produce these approximate results, adjust the data, not
the formula.

| Vehicle | Expected | Rationale |
|---------|----------|-----------|
| Jeep Wrangler | 9.5–10 | Maximum on every axis. Defines "passion vehicle." |
| Toyota Land Cruiser (100/200) | 9–9.5 | ih8mud, global heritage, absurd resale, "go-anywhere" icon |
| Land Rover Defender (classic) | 9–9.5 | Camel Trophy, Africa, exploration incarnate |
| Toyota 4Runner | 7.5–8.5 | Massive mod community, strong resale, trail culture staple |
| Ford Bronco (new) | 7–8 | Heritage revival, strong early community, growing aftermarket |
| Jeep Grand Cherokee | 5–6 | Some Jeep halo, but more mainstream than tribal |
| Subaru Outback | 4–5 | Liked but not loved; practical choice, not a passion project |
| Chevrolet Tahoe | 2–3 | Respected workhorse, minimal enthusiast culture |
| Hyundai Tucson | 1.5–2 | Competent appliance; no community, heritage, or identity |

---

## Edge Cases

**New vehicles** (Rivian R1S, Hyundai Ioniq 5, etc.): Can score on early
community enthusiasm and aftermarket trajectory, but heritage and identity are
nascent. Score conservatively and note for future revision.

**Heritage revivals** (new Bronco, new Defender): Score heritage based on the
*nameplate's* history, but community, aftermarket, and identity based on the
*current* generation's owner base. The new Defender inherits the name's legend
but its owner culture is still forming.

**Defunct models** (FJ Cruiser, Hummer H1, 5th-gen 4Runner): Can score very
high on heritage and resale. Community may be smaller in absolute terms but
extremely dedicated per capita.

**Luxury overlanders** (G-Wagon, Range Rover): May have passionate followings
but for different reasons (status vs. capability). Score based on the same
criteria — if G-Wagon owners don't have trail meetups and aftermarket build
culture, score accordingly.

---

## Research Plan

### Phase 1: Anchor vehicles
Score the ~10 calibration anchors above plus 5–10 additional well-known
platforms. Validate the formula produces a sensible ranking. Adjust tier
definitions if needed.

### Phase 2: Full dataset
Score all 114 vehicles. Most will cluster in the 1–4 range — a quick Reddit
search, aftermarket catalog check, and heritage assessment per vehicle. Budget
~5 minutes per obscure vehicle, ~15 for well-known ones.

### Phase 3: Sanity check
Review the full ranked list. Look for anything that feels wrong — a vehicle
ranked higher or lower than gut instinct suggests. Investigate and adjust
individual scores where the data supports it. The goal is a list where any
knowledgeable overlander would look at the top 10 and bottom 10 and nod.

---

## Integration

Once data is populated in `passion-data.json`:

1. Run `node scripts/calculate-passion-scores.mjs` to compute scores
2. Add `passion` as a scoring dimension in `OverlandFinder.jsx`
3. Add passion as a user-adjustable priority weight (default: 2)
4. Add passion to the filter panel (1–10 range slider)
5. Update tests for the new field
