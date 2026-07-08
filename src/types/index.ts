export interface StationProperties {
  isProjected?: boolean;
  name: string | null;
  country: string;
  responsible: string | null;
  network: string;
  code?: string;
  state?: string;
}

export interface StationFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: StationProperties;
}

export interface StationCollection {
  type: "FeatureCollection";
  features: StationFeature[];
}

export interface RainfallData {
  x: string[]; // ISO Date strings
  y: number[]; // Rainfall in mm
}

export interface RainfallRecord {
  date: string;
  value: number;
}

export type FilterState = {
  state?: string;
  yearFrom?: number;
  yearTo?: number;
};
