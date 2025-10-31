import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";

interface DateSelectorProps {
  onFetchData: (date: Date) => void;
  isLoading: boolean;
}

export const DateSelector = ({ onFetchData, isLoading }: DateSelectorProps) => {
  const today = new Date();
  const [day, setDay] = useState(today.getDate().toString());
  const [month, setMonth] = useState((today.getMonth() + 1).toString());
  const [year, setYear] = useState(today.getFullYear().toString());

  const handleFetch = () => {
    const selectedDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    onFetchData(selectedDate);
  };

  return (
    <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
      <Calendar className="h-5 w-5 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min="1"
          max="31"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="w-16 text-center"
          placeholder="DD"
        />
        <span className="text-muted-foreground">/</span>
        <Input
          type="number"
          min="1"
          max="12"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="w-16 text-center"
          placeholder="MM"
        />
        <span className="text-muted-foreground">/</span>
        <Input
          type="number"
          min="2020"
          max="2100"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="w-20 text-center"
          placeholder="YYYY"
        />
      </div>
      <Button
        onClick={handleFetch}
        disabled={isLoading}
        className="bg-primary hover:bg-primary/90"
      >
        {isLoading ? "Fetching..." : "Fetch Data"}
      </Button>
    </div>
  );
};
