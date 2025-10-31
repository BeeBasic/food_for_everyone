import { Canteen, NGO, Allocation } from "@/types";

export const fifoDistribute = (
  canteens: Canteen[],
  ngos: NGO[]
): { updatedCanteens: Canteen[]; updatedNGOs: NGO[]; allocations: Allocation[] } => {
  const updatedCanteens = canteens.map(c => ({ ...c }));
  const updatedNGOs = ngos.map(n => ({ ...n }));
  const allocations: Allocation[] = [];

  // Process NGOs in order (FIFO)
  for (const ngo of updatedNGOs) {
    if (ngo.requirement <= 0) continue;

    // Try to fulfill from canteens in order
    for (const canteen of updatedCanteens) {
      if (canteen.surplus <= 0 || ngo.requirement <= 0) continue;

      // Allocate as much as possible
      const amount = Math.min(canteen.surplus, ngo.requirement);
      
      canteen.surplus -= amount;
      ngo.requirement -= amount;
      ngo.fulfilled += amount;

      allocations.push({
        canteen: canteen.name,
        ngo: ngo.name,
        amount,
        timestamp: new Date(),
      });

      if (ngo.requirement <= 0) break;
    }
  }

  return { updatedCanteens, updatedNGOs, allocations };
};
