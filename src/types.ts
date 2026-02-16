export type Powertrain = "hybrid" | "gas" | "diesel" | "phev" | "ev";
export type Size = "mid" | "full" | "compact";

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

export interface Priorities {
  offroad: number;
  luxury: number;
  reliability: number;
  mpg: number;
  cargo: number;
  performance: number;
  towing: number;
}
