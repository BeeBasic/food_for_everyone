export interface Canteen {
  name: string;
  surplus: number;
  originalSurplus: number;
}

export interface NGO {
  name: string;
  requirement: number;
  originalRequirement: number;
  fulfilled: number;
}

export interface Allocation {
  canteen: string;
  ngo: string;
  amount: number;
  timestamp: Date;
}

export interface ApiResponse {
  canteens: Array<{ name: string; surplus: number }>;
  ngos: Array<{ name: string; requirement: number }>;
}
