import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { Canteen, NGO, Allocation } from "@/types";
import { DateSelector } from "@/components/DateSelector";
import { CanteenCard } from "@/components/CanteenCard";
import { NGOCard } from "@/components/NGOCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { SummaryBar } from "@/components/SummaryBar";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw, UtensilsCrossed } from "lucide-react";
import { fifoDistribute } from "@/utils/fifoAlgorithm";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [ngos, setNGOs] = useState<NGO[]>([]);
  const [notifications, setNotifications] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const API_URL = "https://beebasic-food-for-all-api.hf.space/predict";

  const canteenList = [
    { id: "C001", name: "VIT University Main Canteen" },
    { id: "C002", name: "SRM Campus Canteen" },
    { id: "C003", name: "Anna University Mess" },
    { id: "C004", name: "IIT Madras Hostel Mess" },
    { id: "C005", name: "Sangeetha Veg Restaurant" },
    { id: "C006", name: "Murugan Idli Shop" },
    { id: "C007", name: "Adyar Ananda Bhavan (A2B)" },
    { id: "C008", name: "The Marina Café" },
    { id: "C009", name: "Buhari Hotel Canteen" },
    { id: "C010", name: "Crescent College Cafeteria" },
  ];

  // ✅ Fetch predictions for all canteens in parallel
  const fetchData = async (date: Date) => {
    setIsLoading(true);
    setSelectedDate(date);

    try {
      const formattedDate = date.toISOString().split("T")[0];
      const dayOfWeek = date.getDay();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();

      const allPredictions = await Promise.all(
        canteenList.map(async (c) => {
          const body = {
            data: [
              {
                canteen_id: c.id,
                canteen_name: c.name,
                day,
                month,
                year,
                day_of_week: dayOfWeek,
              },
            ],
          };

          const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

          if (!res.ok) throw new Error(`Failed for ${c.id}: ${res.status}`);
          const json = await res.json();
          return Array.isArray(json) ? json[0] : json;
        })
      );

      console.log("API Responses:", allPredictions);

      const transformedCanteens: Canteen[] = allPredictions.map((item) => {
      const roundedSurplus = Math.round(Number(item.predicted_surplus) || 0);
      return {
        name: item.canteen_name || "Unknown Canteen",
        surplus: roundedSurplus,
        originalSurplus: roundedSurplus,
        };
      });

      const mockNGOs: NGO[] = [
        { name: "Helping Hands", requirement: 40, originalRequirement: 40, fulfilled: 0 },
        { name: "Food Angels", requirement: 60, originalRequirement: 60, fulfilled: 0 },
        { name: "Hunger Relief", requirement: 50, originalRequirement: 50, fulfilled: 0 },
      ];

      setCanteens(transformedCanteens);
      setNGOs(mockNGOs);
      setNotifications([]);
      toast.success("Fetched latest surplus data successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("API failed — showing fallback demo data");

      const mockCanteens: Canteen[] = [
        { name: "Canteen A", surplus: 45, originalSurplus: 45 },
        { name: "Canteen B", surplus: 70, originalSurplus: 70 },
        { name: "Canteen C", surplus: 30, originalSurplus: 30 },
      ];

      const mockNGOs: NGO[] = [
        { name: "NGO Alpha", requirement: 40, originalRequirement: 40, fulfilled: 0 },
        { name: "NGO Beta", requirement: 35, originalRequirement: 35, fulfilled: 0 },
        { name: "NGO Gamma", requirement: 50, originalRequirement: 50, fulfilled: 0 },
      ];

      setCanteens(mockCanteens);
      setNGOs(mockNGOs);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle drag-and-drop allocation
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const canteen = canteens.find((c) => c.name === active.id);
    const ngo = ngos.find((n) => n.name === over.id);

    if (!canteen || !ngo || canteen.surplus === 0 || ngo.requirement === 0) {
      toast.error("Invalid allocation — nothing to distribute");
      return;
    }

    const amount = Math.min(canteen.surplus, ngo.requirement);

    const updatedCanteens = canteens.map((c) =>
      c.name === canteen.name ? { ...c, surplus: c.surplus - amount } : c
    );

    const updatedNGOs = ngos.map((n) =>
      n.name === ngo.name
        ? { ...n, requirement: n.requirement - amount, fulfilled: n.fulfilled + amount }
        : n
    );

    setCanteens(updatedCanteens);
    setNGOs(updatedNGOs);

    const allocation: Allocation = {
      canteen: canteen.name,
      ngo: ngo.name,
      amount,
      timestamp: new Date(),
    };

    setNotifications([...notifications, allocation]);
    toast.success(`Allocated ${amount} units from ${canteen.name} to ${ngo.name}`);
  };

  // ✅ FIFO auto-distribution
  const handleAutoDistribute = () => {
    if (canteens.length === 0 || ngos.length === 0) {
      toast.error("Fetch data first before auto-distribution");
      return;
    }

    const { updatedCanteens, updatedNGOs, allocations } = fifoDistribute(canteens, ngos);
    setCanteens(updatedCanteens);
    setNGOs(updatedNGOs);
    setNotifications([...notifications, ...allocations]);

    toast.success(`Auto-distributed ${allocations.length} allocations successfully`);
  };

  // ✅ Reset everything
  const handleReset = () => {
    if (canteens.length > 0 || ngos.length > 0) {
      const resetCanteens = canteens.map((c) => ({ ...c, surplus: c.originalSurplus }));
      const resetNGOs = ngos.map((n) => ({
        ...n,
        requirement: n.originalRequirement,
        fulfilled: 0,
      }));
      setCanteens(resetCanteens);
      setNGOs(resetNGOs);
      setNotifications([]);
      toast.success("Dashboard reset");
    }
  };

  const activeCanteen = canteens.find((c) => c.name === activeId);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="h-7 w-7 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Food for All</h1>
          </div>

          <DateSelector onFetchData={fetchData} isLoading={isLoading} />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={handleAutoDistribute}
              disabled={canteens.length === 0 || ngos.length === 0}
              className="bg-accent hover:bg-accent/90"
            >
              <Sparkles className="h-4 w-4 mr-2" /> Auto Distribute
            </Button>
            <Button
              onClick={handleReset}
              disabled={canteens.length === 0 && ngos.length === 0}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {canteens.length === 0 && ngos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4 animate-fade-in">
              <UtensilsCrossed className="h-16 w-16 text-primary mx-auto animate-float" />
              <h2 className="text-2xl font-semibold">Welcome to Food Distribution Dashboard</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Select a date and click “Fetch Data” to begin managing food distribution.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <SummaryBar canteens={canteens} ngos={ngos} />

            <DndContext
              onDragEnd={handleDragEnd}
              onDragStart={(e) => setActiveId(e.active.id as string)}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Canteens</h2>
                  {canteens.map((canteen) => (
                    <CanteenCard key={canteen.name} canteen={canteen} />
                  ))}
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">NGOs</h2>
                  {ngos.map((ngo) => (
                    <NGOCard key={ngo.name} ngo={ngo} />
                  ))}
                </div>
              </div>

              <DragOverlay>
                {activeCanteen ? <CanteenCard canteen={activeCanteen} /> : null}
              </DragOverlay>
            </DndContext>

            <div className="bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
              <p>
                <strong>Tip:</strong> Drag surplus food from canteen cards to NGO cards,
                or use “Auto Distribute” for FIFO allocation.
              </p>
            </div>
          </div>
        )}
      </main>

      <NotificationPanel notifications={notifications} onClear={() => setNotifications([])} />
    </div>
  );
};

export default Index;
