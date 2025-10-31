import { Canteen, NGO } from "@/types";
import { TrendingUp, TrendingDown, Scale } from "lucide-react";

interface SummaryBarProps {
  canteens: Canteen[];
  ngos: NGO[];
}

export const SummaryBar = ({ canteens, ngos }: SummaryBarProps) => {
  const totalSurplus = canteens.reduce((sum, c) => sum + c.surplus, 0);
  const totalRequirement = ngos.reduce((sum, n) => sum + n.requirement, 0);
  const totalFulfilled = ngos.reduce((sum, n) => sum + n.fulfilled, 0);
  const balance = totalSurplus - totalRequirement;

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Surplus</p>
            <p className="text-lg font-bold text-primary">{totalSurplus} kg</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-info/10 rounded-lg">
            <TrendingDown className="h-5 w-5 text-info" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Required</p>
            <p className="text-lg font-bold text-info">{totalRequirement} kg</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-success/10 rounded-lg">
            <Scale className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fulfilled</p>
            <p className="text-lg font-bold text-success">{totalFulfilled} kg</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${balance >= 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
            <Scale className={`h-5 w-5 ${balance >= 0 ? 'text-success' : 'text-destructive'}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className={`text-lg font-bold ${balance >= 0 ? 'text-success' : 'text-destructive'}`}>
              {balance >= 0 ? '+' : ''}{balance} kg
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
