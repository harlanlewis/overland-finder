export type Powertrain = "hybrid" | "gas" | "diesel" | "phev" | "ev";
export type Size = "mid" | "full" | "compact";
export type Body = "suv" | "truck" | "cuv" | "wagon";

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  trim: string | null;        // e.g., "TRD Pro", "Rubicon", "Z71"
  generation: string;         // e.g., "JK", "6th Gen", "L663"
  yearStart: number;          // Generation start year
  yearEnd: number | null;     // Generation end year, null = current production
  price: number;
  mpg: number;
  offroad: number;
  luxury: number;
  cargo: number;
  reliability: number;
  performance: number;
  size: Size;
  body: Body;
  pt: Powertrain;
  tow: number;
  weight: number;
  gc: number;
  note: string;
  url: string;
}

export interface ScoredVehicle extends Vehicle {
  pass: boolean;
  score: number;
}

export interface Weights {
  mpg: number;
  offroad: number;
  luxury: number;
  reliability: number;
  cargo: number;
  performance: number;
  towing: number;
}

export interface ScenarioFilters {
  // Range filters [min, max] - null means no limit
  mpg?: [number | null, number | null];
  offroad?: [number | null, number | null];
  luxury?: [number | null, number | null];
  reliability?: [number | null, number | null];
  cargo?: [number | null, number | null];
  performance?: [number | null, number | null];
  price?: [number | null, number | null];      // in $k
  tow?: [number | null, number | null];        // towing capacity in lbs
  gc?: [number | null, number | null];         // ground clearance in inches
  // Enum filters - array of allowed values (empty/undefined = all allowed)
  size?: Size[];
  body?: Body[];
  pt?: Powertrain[];
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  filters: ScenarioFilters;
  weights: Weights;
  builtIn: boolean;
  createdAt?: number;
  modifiedAt?: number;
  basedOn?: string;
}

export interface ScenarioState {
  custom: Scenario[];
  hidden: string[];
  activeId: string | null;
  order: string[] | null;
  customState?: {
    weights: Weights;
    filters: ScenarioFilters;
  };
}

// Legacy - keep for migration
export interface Preset {
  id: string;
  label: string;
  description: string;
  price: [number, number];
  mpg: [number, number];
  offroad: [number, number];
  luxury: [number, number];
  reliability: [number, number];
  performance: [number, number];
  cargo: [number, number];
  towing: [number, number];
  size: Size[];
  sortBy: string;
  makes?: string[];
}

// Legacy alias
export type Priorities = Weights;
