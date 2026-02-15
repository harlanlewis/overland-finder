import { useState, useMemo, useCallback } from "react";

const V = [
  // Toyota / Lexus
  { id: "4runner", name: "2025-26 Toyota 4Runner TRD Pro", price: 66, mpg: 21, offroad: 9, luxury: 6.5, cargo: 40, reliability: 9.5, size: "mid", pt: "hybrid", tow: 6000, weight: 4600, gc: 9.3, make: "Toyota", note: "New gen hybrid. Legendary aftermarket. Best resale." },
  { id: "4runner_ltd", name: "2025-26 Toyota 4Runner Limited", price: 56, mpg: 22, offroad: 6, luxury: 7.5, cargo: 40, reliability: 9.5, size: "mid", pt: "hybrid", tow: 6000, weight: 4500, gc: 8.7, make: "Toyota", note: "Same platform as TRD Pro, more comfort-oriented, cheaper." },
  { id: "4runner_trd_orp", name: "2025-26 Toyota 4Runner TRD Off-Road Premium", price: 51, mpg: 22, offroad: 7.5, luxury: 6.5, cargo: 40, reliability: 9.5, size: "mid", pt: "hybrid", tow: 6000, weight: 4500, gc: 9.0, make: "Toyota", note: "Sweet spot 4Runner. Crawl control & multi-terrain without TRD Pro price." },
  { id: "runner_sr5", name: "2025-26 Toyota 4Runner SR5", price: 45, mpg: 23, offroad: 5.5, luxury: 5.5, cargo: 40, reliability: 9.5, size: "mid", pt: "hybrid", tow: 6000, weight: 4400, gc: 8.5, make: "Toyota", note: "Base 4Runner. Still hybrid, still capable. Huge value." },
  { id: "runner_venture", name: "2025-26 Toyota 4Runner Trailhunter", price: 59, mpg: 22, offroad: 8.5, luxury: 6, cargo: 40, reliability: 9.5, size: "mid", pt: "hybrid", tow: 6000, weight: 4700, gc: 9.1, make: "Toyota", note: "Factory overlanding trim. ARB bumper, snorkel-ready, Old Man Emu suspension." },
  { id: "gx", name: "2024-26 Lexus GX 550 Overtrail", price: 75, mpg: 21, offroad: 8, luxury: 9.5, cargo: 39, reliability: 9.5, size: "mid", pt: "ice", tow: 6000, weight: 5500, gc: 8.5, make: "Lexus", note: "Luxury 4Runner. E-locker, crawl control. Best interior of the Toyotas." },
  { id: "gx_prem", name: "2024-26 Lexus GX 550 Premium+", price: 70, mpg: 21, offroad: 6.5, luxury: 10, cargo: 39, reliability: 9.5, size: "mid", pt: "ice", tow: 6000, weight: 5500, gc: 8.0, make: "Lexus", note: "Less off-road gear than Overtrail but even more luxurious." },
  { id: "lc", name: "2024-26 Toyota Land Cruiser", price: 62, mpg: 21, offroad: 8.5, luxury: 7, cargo: 38, reliability: 9.5, size: "mid", pt: "hybrid", tow: 6000, weight: 5300, gc: 8.7, make: "Toyota", note: "Heritage nameplate reborn. Shares platform with GX. Hybrid." },
  { id: "sequoia", name: "2024-26 Toyota Sequoia TRD Pro", price: 78, mpg: 21, offroad: 7.5, luxury: 7, cargo: 42, reliability: 9, size: "full", pt: "hybrid", tow: 9520, weight: 6300, gc: 9.5, make: "Toyota", note: "Full-size Toyota hybrid. Massive cargo with 3rd row folded." },
  { id: "sequoia_ltd", name: "2024-26 Toyota Sequoia Limited", price: 70, mpg: 21, offroad: 5.5, luxury: 8, cargo: 42, reliability: 9, size: "full", pt: "hybrid", tow: 9520, weight: 6100, gc: 8.0, make: "Toyota", note: "Same big body, more comfort trim, less trail gear." },
  { id: "lx", name: "2024-26 Lexus LX 600", price: 98, mpg: 17, offroad: 7.5, luxury: 10, cargo: 41, reliability: 9, size: "full", pt: "ice", tow: 8000, weight: 6000, gc: 8.9, make: "Lexus", note: "Ultimate Toyota luxury. V8 twin-turbo, incredible build quality." },

  // Land Rover
  { id: "defender", name: "2024-26 Land Rover Defender 110 V8/P400", price: 82, mpg: 18, offroad: 10, luxury: 8, cargo: 34, reliability: 3.5, size: "mid", pt: "mhybrid", tow: 8201, weight: 5300, gc: 11.5, make: "Land Rover", note: "Best off-road tech. Air suspension, wade sensing. Reliability is the catch." },
  { id: "defender_s", name: "2024-26 Land Rover Defender 110 S/SE", price: 60, mpg: 20, offroad: 8.5, luxury: 7, cargo: 34, reliability: 3.5, size: "mid", pt: "mhybrid", tow: 8201, weight: 5000, gc: 11.5, make: "Land Rover", note: "Same bones as P400, less power but more affordable. Still has air suspension." },
  { id: "defender_130", name: "2024-26 Land Rover Defender 130", price: 85, mpg: 18, offroad: 8, luxury: 8, cargo: 43, reliability: 3.5, size: "full", pt: "mhybrid", tow: 8201, weight: 5800, gc: 10.0, make: "Land Rover", note: "8-seat Defender. More cargo, slightly less agile off-road." },
  { id: "rr_sport", name: "2024-26 Range Rover Sport P400", price: 90, mpg: 20, offroad: 6, luxury: 9.5, cargo: 27, reliability: 4, size: "mid", pt: "mhybrid", tow: 7716, weight: 5400, gc: 8.7, make: "Land Rover", note: "Sporty luxury. Air suspension, good capability but road-focused." },
  { id: "rr_full", name: "2024-26 Range Rover P530", price: 120, mpg: 17, offroad: 6.5, luxury: 10, cargo: 31, reliability: 4, size: "full", pt: "ice", tow: 7716, weight: 5800, gc: 11.6, make: "Land Rover", note: "Ultimate luxury SUV. V8 twin-turbo, waftability supreme." },

  // Jeep
  { id: "gc4xe", name: "2024-26 Jeep Grand Cherokee 4xe Summit", price: 74, mpg: 23, offroad: 7, luxury: 8.5, cargo: 37, reliability: 5.5, size: "mid", pt: "phev", tow: 6000, weight: 5300, gc: 8.6, make: "Jeep", note: "PHEV with 25-mi EV range. Summit trim is genuinely luxurious." },
  { id: "gc4xe_ol", name: "2024-26 Jeep GC 4xe Overland", price: 64, mpg: 23, offroad: 7, luxury: 7.5, cargo: 37, reliability: 5.5, size: "mid", pt: "phev", tow: 6000, weight: 5200, gc: 8.6, make: "Jeep", note: "Same PHEV, less luxury trim, better value." },
  { id: "gc_trailhawk", name: "2024-26 Jeep GC Trailhawk 4xe", price: 69, mpg: 22, offroad: 8.5, luxury: 7, cargo: 37, reliability: 5.5, size: "mid", pt: "phev", tow: 6000, weight: 5300, gc: 10.9, make: "Jeep", note: "Off-road focused GC. Skid plates, Selec-Speed Control, extra clearance." },
  { id: "wagoneer", name: "2024-26 Jeep Wagoneer", price: 74, mpg: 18, offroad: 5.5, luxury: 9, cargo: 67, reliability: 6, size: "full", pt: "ice", tow: 10000, weight: 6000, gc: 8.0, make: "Jeep", note: "Massive. 67 cu ft cargo. American luxury. No gear Tetris." },
  { id: "gwagoneer", name: "2024-26 Jeep Grand Wagoneer", price: 95, mpg: 17, offroad: 5.5, luxury: 10, cargo: 67, reliability: 6, size: "full", pt: "ice", tow: 10000, weight: 6400, gc: 8.0, make: "Jeep", note: "Full-blown luxury. McIntosh audio, quilted leather, massive space." },
  { id: "wrangler_rubicon", name: "2024-26 Jeep Wrangler Rubicon 4xe", price: 62, mpg: 21, offroad: 9.5, luxury: 5, cargo: 31, reliability: 5.5, size: "mid", pt: "phev", tow: 3500, weight: 5100, gc: 10.8, make: "Jeep", note: "Icon. Dana 44 axles, lockers, disconnecting sway bar. 4xe adds torque." },

  // Ford
  { id: "bronco", name: "2024-26 Ford Bronco Badlands", price: 49, mpg: 20, offroad: 9.5, luxury: 4.5, cargo: 32, reliability: 6.5, size: "mid", pt: "ice", tow: 3500, weight: 4700, gc: 9.8, make: "Ford", note: "Sasquatch pkg: 35\" tires, lockers, Dana axles. Best bang/buck off-road." },
  { id: "bronco_ob", name: "2024-26 Ford Bronco Outer Banks", price: 44, mpg: 21, offroad: 7, luxury: 6, cargo: 32, reliability: 6.5, size: "mid", pt: "ice", tow: 3500, weight: 4500, gc: 8.4, make: "Ford", note: "More street-friendly Bronco. Still capable, nicer interior." },
  { id: "bronco_raptor", name: "2024-26 Ford Bronco Raptor", price: 87, mpg: 15, offroad: 10, luxury: 6, cargo: 32, reliability: 6, size: "mid", pt: "ice", tow: 4500, weight: 5700, gc: 13.1, make: "Ford", note: "Desert runner. 418 hp twin-turbo, FOX Live Valve shocks, 37\" tires." },
  { id: "expedition", name: "2024-26 Ford Expedition Timberline", price: 74, mpg: 18, offroad: 6.5, luxury: 7.5, cargo: 56, reliability: 6, size: "full", pt: "ice", tow: 9300, weight: 5900, gc: 10.6, make: "Ford", note: "Off-road Expedition. Big cargo, high clearance, trail turn assist." },

  // GM
  { id: "tahoe_z71", name: "2024-26 Chevy Tahoe Z71", price: 67, mpg: 18, offroad: 6, luxury: 7, cargo: 53, reliability: 6.5, size: "full", pt: "ice", tow: 8400, weight: 5700, gc: 8.0, make: "Chevrolet", note: "Classic full-size SUV. Huge cargo. Magnetic ride control." },
  { id: "yukon_at4", name: "2024-26 GMC Yukon AT4", price: 74, mpg: 18, offroad: 6.5, luxury: 8, cargo: 53, reliability: 6.5, size: "full", pt: "ice", tow: 8400, weight: 5800, gc: 9.0, make: "GMC", note: "Premium Tahoe with off-road gear. Air suspension available." },
  { id: "escalade_v", name: "2024-26 Cadillac Escalade V", price: 155, mpg: 14, offroad: 4, luxury: 10, cargo: 52, reliability: 6, size: "full", pt: "ice", tow: 7000, weight: 6200, gc: 7.9, make: "Cadillac", note: "682 hp supercharged V8. Ultimate American luxury performance." },

  // Mercedes
  { id: "gle", name: "2024-26 Mercedes GLE 450 4MATIC", price: 70, mpg: 23, offroad: 4.5, luxury: 9.5, cargo: 33, reliability: 5.5, size: "mid", pt: "mhybrid", tow: 7700, weight: 5200, gc: 8.0, make: "Mercedes", note: "Highway comfort king. Air suspension handles moderate trails." },
  { id: "gle350de", name: "2024-26 Mercedes GLE 350de", price: 74, mpg: 28, offroad: 4, luxury: 9.5, cargo: 31, reliability: 5.5, size: "mid", pt: "phev", tow: 5500, weight: 5500, gc: 7.8, make: "Mercedes", note: "Diesel PHEV. Extraordinary range. Less off-road but max efficiency." },
  { id: "gls", name: "2024-26 Mercedes GLS 580 4MATIC", price: 105, mpg: 18, offroad: 4.5, luxury: 10, cargo: 43, reliability: 5.5, size: "full", pt: "mhybrid", tow: 7500, weight: 6000, gc: 9.4, make: "Mercedes", note: "S-Class of SUVs. E-Active Body Control, incredible luxury." },
  { id: "gwagen", name: "2024-26 Mercedes G 550", price: 145, mpg: 15, offroad: 9, luxury: 9.5, cargo: 19, reliability: 5, size: "mid", pt: "ice", tow: 7000, weight: 5800, gc: 9.5, make: "Mercedes", note: "Icon. Three locking diffs, solid axles. Small cargo but ultimate capability." },
  { id: "gwagen_amg", name: "2024-26 Mercedes-AMG G 63", price: 185, mpg: 14, offroad: 8.5, luxury: 10, cargo: 19, reliability: 4.5, size: "mid", pt: "ice", tow: 7000, weight: 6100, gc: 9.5, make: "Mercedes", note: "577 hp hand-built V8. Performance G-Wagon. Statement vehicle." },

  // BMW
  { id: "x5", name: "2024-26 BMW X5 xDrive50e", price: 80, mpg: 40, offroad: 3.5, luxury: 9, cargo: 33, reliability: 6.5, size: "mid", pt: "phev", tow: 7200, weight: 5500, gc: 8.2, make: "BMW", note: "30+ mi EV range. Best highway manners. Moderate trails only." },
  { id: "x7", name: "2024-26 BMW X7 xDrive40i", price: 85, mpg: 22, offroad: 3.5, luxury: 9.5, cargo: 48, reliability: 6.5, size: "full", pt: "mhybrid", tow: 7500, weight: 5600, gc: 8.7, make: "BMW", note: "Massive BMW luxury. 3rd row, huge presence, highway queen." },
  { id: "xm", name: "2024-26 BMW XM", price: 160, mpg: 21, offroad: 3.5, luxury: 9, cargo: 27, reliability: 5, size: "mid", pt: "phev", tow: 6000, weight: 6100, gc: 8.2, make: "BMW", note: "738 hp PHEV performance SUV. Controversial styling, extreme capability." },

  // Porsche
  { id: "cayenne", name: "2024-26 Porsche Cayenne", price: 82, mpg: 21, offroad: 4.5, luxury: 9, cargo: 27, reliability: 7, size: "mid", pt: "ice", tow: 7700, weight: 4800, gc: 8.3, make: "Porsche", note: "Sports car handling in SUV form. Surprisingly capable off-road with air suspension." },
  { id: "cayenne_ehybrid", name: "2024-26 Porsche Cayenne E-Hybrid", price: 95, mpg: 46, offroad: 4, luxury: 9, cargo: 26, reliability: 7, size: "mid", pt: "phev", tow: 7700, weight: 5300, gc: 8.0, make: "Porsche", note: "470 hp PHEV. 25+ mi EV range. Best driving dynamics in class." },
  { id: "cayenne_turbo", name: "2024-26 Porsche Cayenne Turbo E-Hybrid", price: 140, mpg: 38, offroad: 4, luxury: 9.5, cargo: 26, reliability: 7, size: "mid", pt: "phev", tow: 7700, weight: 5500, gc: 8.0, make: "Porsche", note: "729 hp. Fastest SUV around a track. PHEV efficiency when you want it." },
  { id: "cayenne_coupe", name: "2024-26 Porsche Cayenne Coupe", price: 88, mpg: 20, offroad: 4, luxury: 9, cargo: 22, reliability: 7, size: "mid", pt: "ice", tow: 7700, weight: 4900, gc: 8.0, make: "Porsche", note: "Sportier roofline, less cargo. Style over practicality." },

  // Audi
  { id: "q8", name: "2024-26 Audi Q8", price: 78, mpg: 20, offroad: 4, luxury: 9, cargo: 30, reliability: 6.5, size: "mid", pt: "mhybrid", tow: 7700, weight: 5100, gc: 9.6, make: "Audi", note: "Coupe-style luxury SUV. Quattro AWD, air suspension available." },
  { id: "sq8", name: "2024-26 Audi SQ8", price: 98, mpg: 18, offroad: 4, luxury: 9.5, cargo: 30, reliability: 6, size: "mid", pt: "ice", tow: 7700, weight: 5400, gc: 9.6, make: "Audi", note: "500 hp V8. Performance-focused Q8 with sport exhaust." },
  { id: "rsq8", name: "2024-26 Audi RS Q8", price: 125, mpg: 15, offroad: 3.5, luxury: 9.5, cargo: 30, reliability: 5.5, size: "mid", pt: "ice", tow: 7700, weight: 5600, gc: 9.4, make: "Audi", note: "591 hp. Fastest SUV around Nurburgring. Ridiculous performance." },

  // Rivian
  { id: "r1s", name: "2024-26 Rivian R1S Adventure", price: 82, mpg: 33, offroad: 8.5, luxury: 8, cargo: 40, reliability: 5.5, size: "mid", pt: "ev", tow: 7700, weight: 7050, gc: 14.9, make: "Rivian", note: "Best EV for off-road. Quad motors, 14.9\" clearance, air suspension. 260+ mi range." },
  { id: "r1s_perf", name: "2024-26 Rivian R1S Dual Max", price: 87, mpg: 38, offroad: 7.5, luxury: 8.5, cargo: 40, reliability: 5.5, size: "mid", pt: "ev", tow: 7700, weight: 6900, gc: 14.9, make: "Rivian", note: "Range-focused R1S. 400+ mi range. Dual motor but still very capable." },

  // GMC EV
  { id: "hummer_ev", name: "2024-26 GMC Hummer EV SUV", price: 100, mpg: 25, offroad: 9, luxury: 8, cargo: 35, reliability: 4.5, size: "full", pt: "ev", tow: 7500, weight: 9000, gc: 16.0, make: "GMC", note: "Extreme capability. CrabWalk, Extract Mode, 16\" clearance. Heavy but unstoppable." },

  // Tesla
  { id: "cybertruck", name: "2024-26 Tesla Cybertruck AWD", price: 82, mpg: 35, offroad: 6.5, luxury: 6.5, cargo: 68, reliability: 4.5, size: "full", pt: "ev", tow: 11000, weight: 6600, gc: 17.0, make: "Tesla", note: "Polarizing but capable. Huge bed, 11K tow. Trail mode via OTA. 300+ mi range." },
  { id: "cybertruck_beast", name: "2024-26 Tesla Cybertruck Cyberbeast", price: 102, mpg: 28, offroad: 7, luxury: 7, cargo: 68, reliability: 4.5, size: "full", pt: "ev", tow: 11000, weight: 6800, gc: 17.0, make: "Tesla", note: "Tri-motor Cybertruck. 845 hp, faster but shorter range. Same massive utility." },
  { id: "model_x", name: "2024-26 Tesla Model X", price: 85, mpg: 37, offroad: 3.5, luxury: 8, cargo: 44, reliability: 5.5, size: "mid", pt: "ev", tow: 5000, weight: 5400, gc: 6.6, make: "Tesla", note: "Falcon wing doors, huge glass roof. Road-focused but EV torque helps." },

  // BMW EV
  { id: "ix_xdrive50", name: "2024-26 BMW iX xDrive50", price: 89, mpg: 36, offroad: 4, luxury: 9.5, cargo: 35, reliability: 6, size: "mid", pt: "ev", tow: 6000, weight: 5700, gc: 7.9, make: "BMW", note: "Luxury EV SUV. 300+ mi range. Incredible interior. Light trails only." },

  // Mercedes EV
  { id: "eqs_suv", name: "2024-26 Mercedes EQS SUV 450+", price: 108, mpg: 37, offroad: 3.5, luxury: 10, cargo: 36, reliability: 5.5, size: "full", pt: "ev", tow: 3500, weight: 6100, gc: 7.3, make: "Mercedes", note: "Ultimate luxury EV. Hyperscreen, 300+ mi range. Pavement-focused." },
  { id: "g580_eq", name: "2025-26 Mercedes G 580 EQ", price: 175, mpg: 28, offroad: 9.5, luxury: 9.5, cargo: 19, reliability: 5, size: "mid", pt: "ev", tow: 6000, weight: 7300, gc: 10.0, make: "Mercedes", note: "Electric G-Wagen. Tank turn capability, quad motors. Ultimate off-road EV." },

  // Mitsubishi
  { id: "montero", name: "2024-26 Mitsubishi Outlander PHEV", price: 44, mpg: 26, offroad: 5, luxury: 6, cargo: 34, reliability: 7, size: "mid", pt: "phev", tow: 2000, weight: 4400, gc: 8.2, make: "Mitsubishi", note: "Budget PHEV with S-AWC. Surprisingly capable. Low towing." },

  // Volvo
  { id: "xc90_recharge", name: "2024-26 Volvo XC90 Recharge", price: 78, mpg: 27, offroad: 4, luxury: 9, cargo: 41, reliability: 6.5, size: "mid", pt: "phev", tow: 5000, weight: 5200, gc: 9.3, make: "Volvo", note: "Scandinavian luxury PHEV. Best safety tech, beautiful interior." },
  { id: "ex90", name: "2024-26 Volvo EX90", price: 82, mpg: 35, offroad: 3.5, luxury: 9, cargo: 44, reliability: 6, size: "mid", pt: "ev", tow: 5500, weight: 5700, gc: 9.3, make: "Volvo", note: "New flagship EV. 300+ mi range, stunning design, Lidar standard." },

  // Genesis
  { id: "gv80", name: "2024-26 Genesis GV80", price: 62, mpg: 21, offroad: 4, luxury: 9, cargo: 35, reliability: 7.5, size: "mid", pt: "ice", tow: 6000, weight: 4900, gc: 7.8, make: "Genesis", note: "Korean luxury bargain. Excellent value, great warranty, refined ride." },
];

// Extract unique manufacturers
const MAKES = [...new Set(V.map(v => v.make))].sort();

const ptLabels = { hybrid: "Hybrid", ice: "ICE", phev: "PHEV", mhybrid: "Mild Hybrid", ev: "EV" };
const ptColors = { hybrid: "#2ecc71", ice: "#e67e22", phev: "#3498db", mhybrid: "#9b59b6", ev: "#1abc9c" };
const sizeLabels = { mid: "Midsize", full: "Full-size" };

// Default priorities - stable across all presets
const DEFAULT_PRIORITIES = { offroad: 4, luxury: 4, reliability: 4, mpg: 3, value: 2, cargo: 2 };

const PRESETS = [
  {
    id: "your_brief", label: "Your Brief", emoji: "🎯",
    description: "Family of 4 + dog · real off-road · luxury · 20+ mpg · reliable · ≤$100K",
    budget: 100, minMpg: 20, offroadMin: 7, luxuryMin: 6.5, reliabilityMin: 6, cargoMin: 34,
    pt: ["hybrid", "ice", "phev", "mhybrid", "ev"], size: ["mid", "full"], sortBy: "score",
  },
  {
    id: "toyota_only", label: "Toyota Faithful", emoji: "⛰️",
    description: "Reliability above all · Toyota/Lexus only · any budget",
    budget: 125, minMpg: 15, offroadMin: 5, luxuryMin: 3, reliabilityMin: 8.5, cargoMin: 30,
    pt: ["hybrid", "ice", "phev", "mhybrid"], size: ["mid", "full"], sortBy: "score",
    makes: ["Toyota", "Lexus"],
  },
  {
    id: "budget", label: "Under $60K", emoji: "💰",
    description: "Best value · still capable · keep it affordable",
    budget: 60, minMpg: 18, offroadMin: 5, luxuryMin: 3, reliabilityMin: 3, cargoMin: 30,
    pt: ["hybrid", "ice", "phev", "mhybrid", "ev"], size: ["mid", "full"], sortBy: "price",
  },
  {
    id: "trail_hardcore", label: "Trail First", emoji: "🪨",
    description: "Maximum off-road · lockers & clearance · comfort secondary",
    budget: 125, minMpg: 15, offroadMin: 8, luxuryMin: 3, reliabilityMin: 3, cargoMin: 30,
    pt: ["hybrid", "ice", "phev", "mhybrid", "ev"], size: ["mid", "full"], sortBy: "offroad",
  },
  {
    id: "highway_lux", label: "Highway Luxury", emoji: "🛣️",
    description: "Comfort & refinement first · moderate trails only · premium interior",
    budget: 125, minMpg: 20, offroadMin: 3, luxuryMin: 8, reliabilityMin: 3, cargoMin: 30,
    pt: ["hybrid", "ice", "phev", "mhybrid", "ev"], size: ["mid", "full"], sortBy: "luxury",
  },
  {
    id: "efficiency", label: "Eco Overlander", emoji: "⚡",
    description: "Best MPG · EV/PHEV/hybrid · still trail-capable",
    budget: 125, minMpg: 21, offroadMin: 5, luxuryMin: 3, reliabilityMin: 3, cargoMin: 30,
    pt: ["hybrid", "phev", "ev"], size: ["mid", "full"], sortBy: "mpg",
  },
  {
    id: "big_family", label: "Big Family Hauler", emoji: "👨‍👩‍👧‍👦",
    description: "Max cargo & space · full-size preferred · room for everything",
    budget: 125, minMpg: 15, offroadMin: 3, luxuryMin: 3, reliabilityMin: 3, cargoMin: 42,
    pt: ["hybrid", "ice", "phev", "mhybrid", "ev"], size: ["full"], sortBy: "score",
  },
  {
    id: "open", label: "Wide Open", emoji: "🔓",
    description: "No filters · show everything · I want to explore",
    budget: 200, minMpg: 14, offroadMin: 3, luxuryMin: 3, reliabilityMin: 3, cargoMin: 19,
    pt: ["hybrid", "ice", "phev", "mhybrid", "ev"], size: ["mid", "full"], sortBy: "score",
  },
];

const DEFAULT_PRESET = PRESETS[0];

export default function OverlandFinder() {
  const [budget, setBudget] = useState(DEFAULT_PRESET.budget);
  const [minMpg, setMinMpg] = useState(DEFAULT_PRESET.minMpg);
  const [offroadMin, setOffroadMin] = useState(DEFAULT_PRESET.offroadMin);
  const [luxuryMin, setLuxuryMin] = useState(DEFAULT_PRESET.luxuryMin);
  const [reliabilityMin, setReliabilityMin] = useState(DEFAULT_PRESET.reliabilityMin);
  const [cargoMin, setCargoMin] = useState(DEFAULT_PRESET.cargoMin);
  const [ptFilter, setPtFilter] = useState(DEFAULT_PRESET.pt);
  const [sizeFilter, setSizeFilter] = useState(DEFAULT_PRESET.size);
  const [makeFilter, setMakeFilter] = useState("all");
  const [sortBy, setSortBy] = useState(DEFAULT_PRESET.sortBy);
  const [sortAsc, setSortAsc] = useState(false); // false = descending (default for most), true = ascending
  const [expanded, setExpanded] = useState(null);
  const [priorities, setPriorities] = useState(DEFAULT_PRIORITIES);
  const [activePreset, setActivePreset] = useState(DEFAULT_PRESET.id);
  const [hoveredVehicle, setHoveredVehicle] = useState(null);
  const [showWeightsPopover, setShowWeightsPopover] = useState(false);

  const applyPreset = useCallback((preset) => {
    setBudget(preset.budget);
    setMinMpg(preset.minMpg);
    setOffroadMin(preset.offroadMin);
    setLuxuryMin(preset.luxuryMin);
    setReliabilityMin(preset.reliabilityMin);
    setCargoMin(preset.cargoMin);
    setPtFilter([...preset.pt]);
    setSizeFilter([...preset.size]);
    setSortBy(preset.sortBy);
    // Only set make filter if preset specifies it
    if (preset.makes) {
      setMakeFilter(preset.makes[0]);
    } else {
      setMakeFilter("all");
    }
    // DON'T change priorities - they stay stable
    setActivePreset(preset.id);
    setExpanded(null);
  }, []);

  const clearPreset = useCallback(() => setActivePreset(null), []);

  const resetAllFilters = useCallback(() => {
    const openPreset = PRESETS.find(p => p.id === "open");
    if (openPreset) {
      setBudget(openPreset.budget);
      setMinMpg(openPreset.minMpg);
      setOffroadMin(openPreset.offroadMin);
      setLuxuryMin(openPreset.luxuryMin);
      setReliabilityMin(openPreset.reliabilityMin);
      setCargoMin(openPreset.cargoMin);
      setPtFilter([...openPreset.pt]);
      setSizeFilter([...openPreset.size]);
      setMakeFilter("all");
      setSortBy(openPreset.sortBy);
    }
    setActivePreset("open");
    setExpanded(null);
  }, []);

  const togglePt = useCallback((pt) => {
    setPtFilter(prev => prev.includes(pt) ? prev.filter(p => p !== pt) : [...prev, pt]);
    clearPreset();
  }, [clearPreset]);

  const toggleSize = useCallback((s) => {
    setSizeFilter(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    clearPreset();
  }, [clearPreset]);

  const adjPriority = useCallback((key, delta) => {
    setPriorities(prev => ({ ...prev, [key]: Math.max(0, Math.min(5, prev[key] + delta)) }));
  }, []);

  const scored = useMemo(() => {
    const totalWeight = Object.values(priorities).reduce((a, b) => a + b, 0) || 1;
    return V.map(v => {
      const passesFilters = v.price <= budget && v.mpg >= minMpg && v.offroad >= offroadMin && v.luxury >= luxuryMin && v.reliability >= reliabilityMin && v.cargo >= cargoMin && ptFilter.includes(v.pt) && sizeFilter.includes(v.size) && (makeFilter === "all" || v.make === makeFilter);
      const offroadScore = (v.offroad / 10) * priorities.offroad;
      const luxuryScore = (v.luxury / 10) * priorities.luxury;
      const reliabilityScore = (v.reliability / 10) * priorities.reliability;
      const mpgScore = (Math.min(v.mpg, 40) / 40) * priorities.mpg;
      const valueScore = ((125 - v.price) / 125) * priorities.value;
      const cargoScore = (v.cargo / 70) * priorities.cargo;
      const score = ((offroadScore + luxuryScore + reliabilityScore + mpgScore + valueScore + cargoScore) / totalWeight) * 100;
      return { ...v, pass: passesFilters, score: Math.round(score) };
    });
  }, [budget, minMpg, offroadMin, luxuryMin, reliabilityMin, cargoMin, ptFilter, sizeFilter, makeFilter, priorities]);

  const filtered = useMemo(() => {
    const f = scored.filter(v => v.pass);
    const dir = sortAsc ? 1 : -1;
    const sortFn = sortBy === "score" ? (a, b) => dir * (a.score - b.score)
      : sortBy === "price" ? (a, b) => dir * (a.price - b.price)
      : sortBy === "mpg" ? (a, b) => dir * (a.mpg - b.mpg)
      : sortBy === "offroad" ? (a, b) => dir * (a.offroad - b.offroad)
      : sortBy === "luxury" ? (a, b) => dir * (a.luxury - b.luxury)
      : sortBy === "reliability" ? (a, b) => dir * (a.reliability - b.reliability)
      : (a, b) => dir * (a.score - b.score);
    return f.sort(sortFn);
  }, [scored, sortBy, sortAsc]);

  const eliminated = scored.filter(v => !v.pass).sort((a, b) => b.score - a.score);

  const SliderControl = ({ label, value, setValue, min, max, step, unit, stops, description }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, fontFamily: "var(--font-mono)" }}>{label}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#c8d6c3", fontFamily: "var(--font-mono)" }}>{value}{unit}</span>
      </div>
      {description && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 6, lineHeight: 1.4 }}>{description}</div>}
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => { setValue(Number(e.target.value)); clearPreset(); }}
        style={{ width: "100%" }} />
      {stops && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
          {stops.map((s, i) => (
            <button key={i} onClick={() => { setValue(s.value); clearPreset(); }}
              style={{ background: value === s.value ? "rgba(122,158,109,0.3)" : "transparent", border: value === s.value ? "1px solid rgba(122,158,109,0.5)" : "1px solid rgba(255,255,255,0.06)", color: value === s.value ? "#c8d6c3" : "rgba(255,255,255,0.25)", fontSize: 10, padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }}>
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const ToggleGroup = ({ label, options, active, toggle }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontFamily: "var(--font-mono)" }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {options.map(opt => {
          const isActive = active.includes(opt.value);
          return (
            <button key={opt.value} onClick={() => toggle(opt.value)}
              style={{
                padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: isActive ? (opt.color || "rgba(122,158,109,0.2)") : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? (opt.borderColor || "rgba(122,158,109,0.4)") : "rgba(255,255,255,0.08)"}`,
                color: isActive ? "#fff" : "rgba(255,255,255,0.3)",
                fontFamily: "var(--font-body)",
                transition: "all 0.2s ease",
              }}>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );

  const Bar = ({ val, max, color, width }) => (
    <div style={{ width: width || 80, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${(val / max) * 100}%`, height: "100%", background: color || "#7a9e6d", borderRadius: 3, transition: "width 0.4s ease" }} />
    </div>
  );

  const PriorityControl = ({ label, value, pKey }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <span style={{ width: 80, fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>{label}</span>
      <button onClick={() => adjPriority(pKey, -1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontSize: 14 }}>−</button>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: i <= value ? "#7a9e6d" : "rgba(255,255,255,0.06)", border: `1px solid ${i <= value ? "rgba(122,158,109,0.5)" : "rgba(255,255,255,0.08)"}`, transition: "all 0.2s", cursor: "pointer" }} onClick={() => setPriorities(prev => ({ ...prev, [pKey]: i }))} />
        ))}
      </div>
      <button onClick={() => adjPriority(pKey, 1)} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.4)", width: 24, height: 24, borderRadius: 4, cursor: "pointer", fontSize: 14 }}>+</button>
      {value === 0 && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}>off</span>}
    </div>
  );

  // Chart dimensions - X axis: price (scales to budget), Y axis: score
  const chartPadding = { left: 35, right: 10, top: 10, bottom: 25 };
  const priceMin = 40;
  const priceMax = Math.max(budget + 20, 80); // Scale to budget with padding, minimum 80
  const scoreMin = 30, scoreMax = 100;

  return (
    <div style={{
      "--font-body": "'Barlow', sans-serif",
      "--font-mono": "'IBM Plex Mono', monospace",
      "--bg": "#0b100e",
      "--card": "rgba(255,255,255,0.025)",
      "--border": "rgba(255,255,255,0.07)",
      "--accent": "#7a9e6d",
      "--accent2": "#c8d6c3",
      minHeight: "100vh",
      background: "var(--bg)",
      color: "#e8ebe6",
      fontFamily: "var(--font-body)",
    }}>
      <style>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          height: 6px;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7a9e6d;
          cursor: grab;
          border: 2px solid #c8d6c3;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          transition: transform 0.1s ease;
        }
        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type="range"]::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.1);
        }
        input[type="range"]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #7a9e6d;
          cursor: grab;
          border: 2px solid #c8d6c3;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }
        input[type="range"]::-moz-range-track {
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          height: 6px;
        }
      `}</style>
      {/* Topo texture overlay */}
      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: `repeating-conic-gradient(rgba(122,158,109,0.3) 0% 25%, transparent 0% 50%)`,
        backgroundSize: "60px 60px",
      }} />

      <div style={{ position: "relative", maxWidth: 1100, margin: "0 auto", padding: "28px 16px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--accent2)", letterSpacing: -0.5 }}>Vehicle Finder</h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 320px) 1fr", gap: 24, alignItems: "start" }}>
          {/* Left panel - controls */}
          <div style={{ position: "sticky", top: 16 }}>
            {/* Presets */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--accent)", marginBottom: 12, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Quick Presets</span>
                {activePreset && activePreset !== "open" && <span style={{ fontSize: 9, fontWeight: 500, color: "rgba(255,255,255,0.3)", textTransform: "none", letterSpacing: 0 }}>active: {PRESETS.find(p => p.id === activePreset)?.label}</span>}
              </div>

              {/* Your Brief - full width at top */}
              {(() => {
                const preset = PRESETS.find(p => p.id === "your_brief");
                const isActive = activePreset === "your_brief";
                return (
                  <button onClick={() => applyPreset(preset)}
                    style={{
                      width: "100%", padding: "12px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                      background: isActive ? "rgba(122,158,109,0.15)" : "rgba(122,158,109,0.05)",
                      border: `1.5px solid ${isActive ? "rgba(122,158,109,0.5)" : "rgba(122,158,109,0.15)"}`,
                      transition: "all 0.2s ease", marginBottom: 10,
                      display: "flex", flexDirection: "column", gap: 3,
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(122,158,109,0.1)"; e.currentTarget.style.borderColor = "rgba(122,158,109,0.3)"; }}}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(122,158,109,0.05)"; e.currentTarget.style.borderColor = "rgba(122,158,109,0.15)"; }}}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>{preset.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "var(--accent2)" : "var(--accent)", fontFamily: "var(--font-body)" }}>{preset.label}</span>
                    </div>
                    <span style={{ fontSize: 10, color: isActive ? "rgba(200,214,195,0.6)" : "rgba(122,158,109,0.6)", lineHeight: 1.3, fontFamily: "var(--font-body)" }}>{preset.description}</span>
                  </button>
                );
              })()}

              {/* Other presets in 2-column grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                {PRESETS.filter(p => p.id !== "your_brief" && p.id !== "open").map(preset => {
                  const isActive = activePreset === preset.id;
                  return (
                    <button key={preset.id} onClick={() => applyPreset(preset)}
                      style={{
                        padding: "10px 10px 8px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                        background: isActive ? "rgba(122,158,109,0.12)" : "rgba(255,255,255,0.02)",
                        border: `1.5px solid ${isActive ? "rgba(122,158,109,0.45)" : "rgba(255,255,255,0.06)"}`,
                        transition: "all 0.2s ease",
                        display: "flex", flexDirection: "column", gap: 2,
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 13 }}>{preset.emoji}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>{preset.label}</span>
                      </div>
                      <span style={{ fontSize: 9.5, color: isActive ? "rgba(200,214,195,0.5)" : "rgba(255,255,255,0.22)", lineHeight: 1.3, fontFamily: "var(--font-body)" }}>{preset.description}</span>
                    </button>
                  );
                })}
              </div>

              {/* Wide Open / Reset - full width at bottom */}
              <button onClick={resetAllFilters}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "center",
                  background: activePreset === "open" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                  border: `1px solid ${activePreset === "open" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"}`,
                  transition: "all 0.2s ease",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = activePreset === "open" ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)"; e.currentTarget.style.borderColor = activePreset === "open" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)"; }}
              >
                <span style={{ fontSize: 12 }}>🔓</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-body)" }}>Reset All Filters</span>
              </button>
            </div>

            {/* Budget - separate section */}
            <div style={{ background: "linear-gradient(135deg, rgba(122,158,109,0.08) 0%, rgba(122,158,109,0.02) 100%)", border: "1px solid rgba(122,158,109,0.2)", borderRadius: 12, padding: 20, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--accent)", marginBottom: 16, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 8 }}>
                <span>💰</span>
                <span>Budget</span>
              </div>

              <SliderControl label="Max Price" value={budget} setValue={setBudget} min={40} max={200} step={5} unit="K"
                stops={[{ label: "$60K", value: 60 }, { label: "$85K", value: 85 }, { label: "$100K", value: 100 }, { label: "Any", value: 200 }]} />
            </div>

            {/* Requirements filters */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--accent)", marginBottom: 16, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Requirements</span>
                {!activePreset && <span style={{ fontSize: 9, fontWeight: 500, padding: "2px 7px", borderRadius: 4, background: "rgba(230,126,34,0.15)", border: "1px solid rgba(230,126,34,0.3)", color: "#e67e22", textTransform: "none", letterSpacing: 0 }}>customized</span>}
              </div>

              <SliderControl label="Min Combined MPG" value={minMpg} setValue={setMinMpg} min={14} max={30} step={1} unit=" mpg"
                description="15 = no filter · 20 = your target · 25+ = PHEV territory"
                stops={[{ label: "Any", value: 15 }, { label: "18+", value: 18 }, { label: "20+", value: 20 }, { label: "23+", value: 23 }]} />

              <SliderControl label="Min Off-Road" value={offroadMin} setValue={setOffroadMin} min={3} max={9} step={0.5} unit="/10"
                description="3 = gravel roads · 6 = moderate trails · 8 = serious"
                stops={[{ label: "Any", value: 3 }, { label: "6+", value: 6 }, { label: "7.5+", value: 7.5 }, { label: "9+", value: 9 }]} />

              <SliderControl label="Min Luxury" value={luxuryMin} setValue={setLuxuryMin} min={3} max={9} step={0.5} unit="/10"
                stops={[{ label: "Any", value: 3 }, { label: "6+", value: 6 }, { label: "8+", value: 8 }]} />

              <SliderControl label="Min Reliability" value={reliabilityMin} setValue={setReliabilityMin} min={3} max={9} step={0.5} unit="/10"
                stops={[{ label: "Any", value: 3 }, { label: "6+", value: 6 }, { label: "8+", value: 8 }]} />

              <SliderControl label="Min Cargo" value={cargoMin} setValue={setCargoMin} min={30} max={55} step={1} unit=" cu ft"
                stops={[{ label: "30+", value: 30 }, { label: "37+", value: 37 }, { label: "42+", value: 42 }, { label: "50+", value: 50 }]} />

              <ToggleGroup label="Powertrain" active={ptFilter} toggle={togglePt}
                options={[
                  { value: "hybrid", label: "Hybrid", color: "rgba(46,204,113,0.15)", borderColor: "rgba(46,204,113,0.4)" },
                  { value: "ice", label: "ICE", color: "rgba(230,126,34,0.15)", borderColor: "rgba(230,126,34,0.4)" },
                  { value: "phev", label: "PHEV", color: "rgba(52,152,219,0.15)", borderColor: "rgba(52,152,219,0.4)" },
                  { value: "mhybrid", label: "Mild Hybrid", color: "rgba(155,89,182,0.15)", borderColor: "rgba(155,89,182,0.4)" },
                  { value: "ev", label: "EV", color: "rgba(26,188,156,0.15)", borderColor: "rgba(26,188,156,0.4)" },
                ]} />

              <ToggleGroup label="Size" active={sizeFilter} toggle={toggleSize}
                options={[
                  { value: "mid", label: "Midsize" },
                  { value: "full", label: "Full-size" },
                ]} />
            </div>

          </div>

          {/* Right panel - results */}
          <div>
            {/* Scatter plot */}
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1.5, color: "rgba(255,255,255,0.3)", marginBottom: 12, fontFamily: "var(--font-mono)", display: "flex", justifyContent: "space-between" }}>
                <span>Price vs Score</span>
                <span><span style={{ color: "var(--accent)", fontWeight: 700, fontSize: 14 }}>{filtered.length}</span><span style={{ color: "rgba(255,255,255,0.35)" }}> / {V.length} match</span></span>
              </div>
              <div style={{ position: "relative", height: 220, paddingLeft: chartPadding.left, paddingBottom: chartPadding.bottom, paddingRight: chartPadding.right, paddingTop: chartPadding.top }}>
                {/* Y axis labels (Score) */}
                {[40, 55, 70, 85, 100].map(score => {
                  const yPercent = ((scoreMax - score) / (scoreMax - scoreMin)) * 100;
                  const chartAreaHeight = 220 - chartPadding.top - chartPadding.bottom;
                  const topPx = chartPadding.top + (yPercent / 100) * chartAreaHeight;
                  return (
                    <div key={score} style={{
                      position: "absolute",
                      left: 0,
                      top: topPx,
                      transform: "translateY(-50%)",
                      fontSize: 9,
                      color: "rgba(255,255,255,0.25)",
                      fontFamily: "var(--font-mono)",
                      width: chartPadding.left - 5,
                      textAlign: "right",
                    }}>
                      {score}
                    </div>
                  );
                })}
                {/* X axis labels (Price) - dynamic based on price range */}
                {(() => {
                  const range = priceMax - priceMin;
                  const step = range <= 60 ? 10 : range <= 100 ? 20 : 40;
                  const labels = [];
                  for (let p = Math.ceil(priceMin / step) * step; p <= priceMax; p += step) {
                    labels.push(p);
                  }
                  return labels.map(price => {
                    const xFraction = (price - priceMin) / (priceMax - priceMin);
                    return (
                      <div key={price} style={{
                        position: "absolute",
                        left: `calc(${chartPadding.left}px + ${xFraction} * (100% - ${chartPadding.left + chartPadding.right}px))`,
                        bottom: 0,
                        transform: "translateX(-50%)",
                        fontSize: 9,
                        color: "rgba(255,255,255,0.25)",
                        fontFamily: "var(--font-mono)",
                      }}>
                        ${price}K
                      </div>
                    );
                  });
                })()}
                {/* Chart area */}
                <div style={{ position: "absolute", left: chartPadding.left, right: chartPadding.right, top: chartPadding.top, bottom: chartPadding.bottom, background: "rgba(0,0,0,0.15)", borderRadius: 4, border: "1px solid rgba(255,255,255,0.04)" }}>
                  {/* Grid lines */}
                  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                    {[20, 40, 60, 80].map(pct => (
                      <line key={`h${pct}`} x1="0%" y1={`${pct}%`} x2="100%" y2={`${pct}%`} stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
                    ))}
                    {[20, 40, 60, 80].map(pct => (
                      <line key={`v${pct}`} x1={`${pct}%`} y1="0%" x2={`${pct}%`} y2="100%" stroke="rgba(255,255,255,0.04)" strokeDasharray="2,4" />
                    ))}
                  </svg>
                  {/* Plot all vehicles */}
                  {scored.map(v => {
                    const x = ((v.price - priceMin) / (priceMax - priceMin)) * 100; // higher price = right
                    const y = ((scoreMax - v.score) / (scoreMax - scoreMin)) * 100; // higher score = top
                    const isFiltered = !v.pass;
                    const isHovered = hoveredVehicle === v.id;
                    const ptColor = ptColors[v.pt] || "#888";
                    return (
                      <div
                        key={v.id}
                        onMouseEnter={() => setHoveredVehicle(v.id)}
                        onMouseLeave={() => setHoveredVehicle(null)}
                        onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                        style={{
                          position: "absolute",
                          left: `calc(${Math.max(2, Math.min(98, x))}% - 6px)`,
                          top: `calc(${Math.max(2, Math.min(98, y))}% - 6px)`,
                          width: isHovered ? 14 : 12,
                          height: isHovered ? 14 : 12,
                          borderRadius: "50%",
                          background: ptColor,
                          border: `2px solid ${isHovered ? "#fff" : ptColor}`,
                          opacity: isFiltered ? 0.15 : (isHovered ? 1 : 0.8),
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          zIndex: isHovered ? 100 : (isFiltered ? 1 : 10),
                          transform: isHovered ? "scale(1.3)" : "scale(1)",
                        }}
                        title={`${v.name}\nScore: ${v.score} · $${v.price}K`}
                      />
                    );
                  })}
                  {/* Hover tooltip */}
                  {hoveredVehicle && (() => {
                    const v = scored.find(x => x.id === hoveredVehicle);
                    if (!v) return null;
                    const x = ((v.price - priceMin) / (priceMax - priceMin)) * 100;
                    const y = ((scoreMax - v.score) / (scoreMax - scoreMin)) * 100;
                    return (
                      <div style={{
                        position: "absolute",
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: x > 50 ? "translate(-100%, -120%)" : "translate(10%, -120%)",
                        background: "rgba(0,0,0,0.95)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: 11,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        zIndex: 200,
                        pointerEvents: "none",
                      }}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>{v.name}</div>
                        <div style={{ color: "rgba(255,255,255,0.6)" }}>Score: <span style={{ color: "var(--accent)" }}>{v.score}</span> · ${v.price}K</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Sort bar with Make filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              {/* Make dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1.5 }}>Make:</span>
                <select
                  value={makeFilter}
                  onChange={e => { setMakeFilter(e.target.value); clearPreset(); }}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 5,
                    fontSize: 11,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#c8d6c3",
                    fontFamily: "var(--font-mono)",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  <option value="all">All Makes</option>
                  {MAKES.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                </select>
              </div>

              <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />

              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: 1.5 }}>Sort:</span>
              {/* Match Score with weights popover */}
              <div style={{ position: "relative" }}>
                <button onClick={() => {
                  if (sortBy === "score") {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortBy("score");
                    setSortAsc(false);
                  }
                }}
                  style={{
                    padding: "4px 12px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                    background: sortBy === "score" ? "rgba(122,158,109,0.2)" : "transparent",
                    border: `1px solid ${sortBy === "score" ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.06)"}`,
                    color: sortBy === "score" ? "var(--accent2)" : "rgba(255,255,255,0.35)",
                    fontFamily: "var(--font-mono)", fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  Match Score{sortBy === "score" ? (sortAsc ? " ↑" : " ↓") : ""}
                  <span onClick={(e) => { e.stopPropagation(); setShowWeightsPopover(!showWeightsPopover); }}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: 3, background: showWeightsPopover ? "rgba(122,158,109,0.3)" : "rgba(255,255,255,0.1)", fontSize: 10, marginLeft: 2 }}>
                    ⚙
                  </span>
                </button>
                {showWeightsPopover && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 1000,
                    background: "rgba(11,16,14,0.98)", border: "1px solid rgba(122,158,109,0.3)",
                    borderRadius: 10, padding: 16, minWidth: 280,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>Score Weights</span>
                      <button onClick={() => setShowWeightsPopover(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>×</button>
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12, lineHeight: 1.4 }}>
                      Adjust how much each attribute affects the Match Score.
                    </div>
                    <PriorityControl label="Off-Road" value={priorities.offroad} pKey="offroad" />
                    <PriorityControl label="Luxury" value={priorities.luxury} pKey="luxury" />
                    <PriorityControl label="Reliability" value={priorities.reliability} pKey="reliability" />
                    <PriorityControl label="Fuel Econ" value={priorities.mpg} pKey="mpg" />
                    <PriorityControl label="Value" value={priorities.value} pKey="value" />
                    <PriorityControl label="Cargo" value={priorities.cargo} pKey="cargo" />
                  </div>
                )}
              </div>
              {[
                { key: "price", label: "Price" },
                { key: "mpg", label: "MPG" },
                { key: "offroad", label: "Off-Road" },
                { key: "luxury", label: "Luxury" },
                { key: "reliability", label: "Reliability" },
              ].map(s => {
                const isActive = sortBy === s.key;
                return (
                  <button key={s.key} onClick={() => {
                    if (sortBy === s.key) {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortBy(s.key);
                      // Default: price ascending (low first), others descending (high first)
                      setSortAsc(s.key === "price");
                    }
                    setShowWeightsPopover(false);
                  }}
                    style={{
                      padding: "4px 12px", borderRadius: 5, fontSize: 11, cursor: "pointer",
                      background: isActive ? "rgba(122,158,109,0.2)" : "transparent",
                      border: `1px solid ${isActive ? "rgba(122,158,109,0.4)" : "rgba(255,255,255,0.06)"}`,
                      color: isActive ? "var(--accent2)" : "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-mono)", fontWeight: 500,
                    }}>
                    {s.label}{isActive ? (sortAsc ? " ↑" : " ↓") : ""}
                  </button>
                );
              })}
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🏜️</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--accent2)", marginBottom: 6 }}>No vehicles match</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Try loosening your filters — your requirements may be too restrictive.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {filtered.map((v, idx) => {
                  const isExpanded = expanded === v.id;
                  const ptColor = ptColors[v.pt] || "#888";
                  const isTop = idx === 0 && sortBy === "score";
                  const isHovered = hoveredVehicle === v.id;
                  return (
                    <div key={v.id}
                      onClick={() => setExpanded(isExpanded ? null : v.id)}
                      onMouseEnter={() => setHoveredVehicle(v.id)}
                      onMouseLeave={() => setHoveredVehicle(null)}
                      style={{
                        background: isHovered ? "rgba(122,158,109,0.1)" : (isTop ? "rgba(122,158,109,0.05)" : "var(--card)"),
                        border: `1px solid ${isHovered ? "rgba(122,158,109,0.4)" : (isTop ? "rgba(122,158,109,0.2)" : "var(--border)")}`,
                        borderRadius: 10, padding: "14px 16px", cursor: "pointer",
                        transition: "all 0.15s ease",
                        transform: isHovered ? "translateX(4px)" : "none",
                      }}>
                      {/* Main row */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        {/* Rank */}
                        <div style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", background: isTop ? "rgba(122,158,109,0.2)" : "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-mono)", color: isTop ? "var(--accent)" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                          {idx + 1}
                        </div>
                        {/* Name + tags */}
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 3, lineHeight: 1.2 }}>{v.name}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: ptColor + "20", color: ptColor, border: `1px solid ${ptColor}44`, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{ptLabels[v.pt]}</span>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>{sizeLabels[v.size]}</span>
                            <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 3, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "var(--font-mono)" }}>{v.make}</span>
                          </div>
                        </div>
                        {/* Key stats */}
                        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                          {[
                            { label: "Score", val: v.score, color: v.score >= 70 ? "var(--accent)" : v.score >= 50 ? "#c8d6c3" : "rgba(255,255,255,0.4)" },
                            { label: "Price", val: `$${v.price}K` },
                            { label: "MPG", val: v.mpg },
                            { label: "Off-Rd", val: v.offroad },
                            { label: "Lux", val: v.luxury },
                            { label: "Rel", val: v.reliability },
                          ].map((s, i) => (
                            <div key={i} style={{ textAlign: "center", minWidth: 36 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: s.color || "rgba(255,255,255,0.7)", fontFamily: "var(--font-mono)" }}>{s.val}</div>
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)", flexShrink: 0 }}>▼</span>
                      </div>
                      {/* Expanded detail */}
                      {isExpanded && (
                        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}
                          onClick={e => e.stopPropagation()}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                            {[
                              { label: "Off-Road", val: v.offroad, max: 10 },
                              { label: "Luxury", val: v.luxury, max: 10 },
                              { label: "Reliability", val: v.reliability, max: 10 },
                              { label: "Cargo", val: v.cargo, max: 70, unit: " cu ft" },
                              { label: "Towing", val: v.tow.toLocaleString(), raw: v.tow, max: 12000, unit: " lbs" },
                              { label: "Ground Clear.", val: v.gc, max: 18, unit: "\"" },
                            ].map((s, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ width: 85, fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{s.label}</span>
                                <Bar val={s.raw || (typeof s.val === "number" ? s.val : 0)} max={s.max} width={80} />
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{s.val}{s.unit || ""}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, background: "rgba(255,255,255,0.02)", padding: "10px 12px", borderRadius: 6 }}>
                            💡 {v.note}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Eliminated */}
            {eliminated.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "rgba(255,255,255,0.2)", marginBottom: 10, fontFamily: "var(--font-mono)" }}>
                  Filtered out ({eliminated.length})
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {eliminated.map(v => {
                    const reasons = [];
                    if (v.price > budget) reasons.push("budget");
                    if (v.mpg < minMpg) reasons.push("mpg");
                    if (v.offroad < offroadMin) reasons.push("off-road");
                    if (v.luxury < luxuryMin) reasons.push("luxury");
                    if (v.reliability < reliabilityMin) reasons.push("reliability");
                    if (v.cargo < cargoMin) reasons.push("cargo");
                    if (!ptFilter.includes(v.pt)) reasons.push("powertrain");
                    if (!sizeFilter.includes(v.size)) reasons.push("size");
                    if (makeFilter !== "all" && v.make !== makeFilter) reasons.push("make");
                    return (
                      <div key={v.id} title={`Eliminated: ${reasons.join(", ")}`}
                        onMouseEnter={() => setHoveredVehicle(v.id)}
                        onMouseLeave={() => setHoveredVehicle(null)}
                        style={{ fontSize: 11, padding: "4px 10px", borderRadius: 6, background: hoveredVehicle === v.id ? "rgba(122,158,109,0.1)" : "rgba(255,255,255,0.02)", border: `1px solid ${hoveredVehicle === v.id ? "rgba(122,158,109,0.3)" : "rgba(255,255,255,0.04)"}`, color: hoveredVehicle === v.id ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", fontFamily: "var(--font-body)", cursor: "default", transition: "all 0.15s" }}>
                        {v.name} <span style={{ fontSize: 9, color: "rgba(231,76,60,0.5)" }}>({reasons.join(", ")})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
