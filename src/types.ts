export type Powertrain = "hybrid" | "ice" | "phev" | "mhybrid" | "ev";
export type Size = "mid" | "full";
export type Condition = "new" | "used";

export interface Vehicle {
  id: string;
  name: string;
  price: number;
  mpg: number;
  offroad: number;
  luxury: number;
  cargo: number;
  reliability: number;
  size: Size;
  pt: Powertrain;
  tow: number;
  weight: number;
  gc: number;
  make: string;
  note: string;
  condition: Condition;
  url?: string;
}

export interface ScoredVehicle extends Vehicle {
  pass: boolean;
  score: number;
}

export interface Preset {
  id: string;
  label: string;
  description: string;
  budget: number;
  mpg: [number, number];
  offroad: [number, number];
  luxury: [number, number];
  reliability: [number, number];
  cargo: [number, number];
  pt: Powertrain[];
  size: Size[];
  sortBy: string;
  makes?: string[];
}

export interface Priorities {
  offroad: number;
  luxury: number;
  reliability: number;
  mpg: number;
  value: number;
  cargo: number;
}
