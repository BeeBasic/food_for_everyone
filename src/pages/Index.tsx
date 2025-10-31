import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { Canteen, NGO, Allocation, ApiResponse } from "@/types";
import { DateSelector } from "@/components/DateSelector";
import { CanteenCard } from "@/components/CanteenCard";
import { NGOCard } from "@/components/NGOCard";
import { NotificationPanel } from "@/components/NotificationPanel";
import { SummaryBar } from "@/components/SummaryBar";
import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import { fifoDistribute } from "@/utils/fifoAlgorithm";
import { toast } from "sonner";

const Index = () => {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [ngos, setNGOs] = useState<NGO[]>([]);
  const [notifications, setNotifications] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const fetchData = async (date: Date) => {
    setIsLoading(true);
    setSelectedDate(date);

    try {
      // Format date for API call
      const formattedDate = date.toISOString().split('T')[0];
      
      // API call to fetch data
      const response = await fetch(`/api/food-distribution?date=${formattedDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data: ApiResponse = await response.json();

      // Transform API data
      const transformedCanteens: Canteen[] = data.canteens.map((c) => ({
        name: c.name,
        surplus: c.surplus,
        originalSurplus: c.surplus,
      }));

      const transformedNGOs: NGO[] = data.ngos.map((n) => ({
        name: n.name,
        requirement: n.requirement,
        originalRequirement: n.requirement,
        fulfilled: 0,
      }));

      setCanteens(transformedCanteens);
      setNGOs(transformedNGOs);
      setNotifications([]);
      
      toast.success("Data fetched successfully!");
    } catch (error) {
      console.error("Error fetching data:", error);
      
      // Mock data for demonstration
      const mockCanteens: Canteen[] = [
        { name: "Canteen A", surplus: 50, originalSurplus: 50 },
        { name: "Canteen B", surplus: 70, originalSurplus: 70 },
        { name: "Canteen C", surplus: 40, originalSurplus: 40 },
      ];

      const mockNGOs: NGO[] = [
        { name: "NGO X", requirement: 30, originalRequirement: 30, fulfilled: 0 },
        { name: "NGO Y", requirement: 40, originalRequirement: 40, fulfilled: 0 },
        { name: "NGO Z", requirement: 35, originalRequirement: 35, fulfilled: 0 },
      ];

      setCanteens(mockCanteens);
      setNGOs(mockNGOs);
      setNotifications([]);
      
      toast.info("Using demo data (API not available)");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const canteen = canteens.find((c) => c.name === active.id);
    const ngo = ngos.find((n) => n.name === over.id);

    if (!canteen || !ngo || canteen.surplus === 0 || ngo.requirement === 0) {
      toast.error("Cannot allocate: insufficient surplus or requirement fulfilled");
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
    toast.success(`Allocated ${amount} kg from ${canteen.name} to ${ngo.name}`);
  };

  const handleAutoDistribute = () => {
    if (canteens.length === 0 || ngos.length === 0) {
      toast.error("Please fetch data first");
      return;
    }

    const { updatedCanteens, updatedNGOs, allocations } = fifoDistribute(canteens, ngos);

    setCanteens(updatedCanteens);
    setNGOs(updatedNGOs);
    setNotifications([...notifications, ...allocations]);

    toast.success(`Auto-distributed to ${allocations.length} allocations using FIFO`);
  };

  const handleReset = () => {
    if (canteens.length > 0 || ngos.length > 0) {
      const resetCanteens = canteens.map((c) => ({
        ...c,
        surplus: c.originalSurplus,
      }));

      const resetNGOs = ngos.map((n) => ({
        ...n,
        requirement: n.originalRequirement,
        fulfilled: 0,
      }));

      setCanteens(resetCanteens);
      setNGOs(resetNGOs);
      setNotifications([]);
      toast.success("All allocations cleared");
    }
  };

  const activeCanteen = canteens.find((c) => c.name === activeId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              Food for All 🍽️
            </h1>

            <DateSelector onFetchData={fetchData} isLoading={isLoading} />

            <div className="flex gap-2">
              <Button
                onClick={handleAutoDistribute}
                disabled={canteens.length === 0 || ngos.length === 0}
                variant="default"
                className="bg-accent hover:bg-accent/90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Auto Distribute
              </Button>
              <Button
                onClick={handleReset}
                disabled={canteens.length === 0 || ngos.length === 0}
                variant="outline"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {canteens.length === 0 && ngos.length === 0 ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="text-6xl">🍽️</div>
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome to Food Distribution Dashboard
              </h2>
              <p className="text-muted-foreground max-w-md">
                Select a date and click "Fetch Data" to begin managing food distribution
                between canteens and NGOs.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Bar */}
            <SummaryBar canteens={canteens} ngos={ngos} />

            {/* Drag and Drop Area */}
            <DndContext onDragEnd={handleDragEnd} onDragStart={(e) => setActiveId(e.active.id as string)}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* NGOs Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">NGOs</h2>
                    <span className="text-sm text-muted-foreground">
                      {ngos.length} organizations
                    </span>
                  </div>
                  <div className="space-y-3">
                    {ngos.map((ngo) => (
                      <NGOCard key={ngo.name} ngo={ngo} />
                    ))}
                  </div>
                </div>

                {/* Canteens Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Canteens</h2>
                    <span className="text-sm text-muted-foreground">
                      {canteens.length} locations
                    </span>
                  </div>
                  <div className="space-y-3">
                    {canteens.map((canteen) => (
                      <CanteenCard key={canteen.name} canteen={canteen} />
                    ))}
                  </div>
                </div>
              </div>

              <DragOverlay>
                {activeCanteen ? <CanteenCard canteen={activeCanteen} /> : null}
              </DragOverlay>
            </DndContext>

            {/* Instructions */}
            <div className="bg-muted/50 border border-border rounded-xl p-4 text-sm text-muted-foreground">
              <p>
                💡 <strong>Tip:</strong> Drag canteen cards to NGO cards to allocate food, or use
                the "Auto Distribute" button for FIFO allocation.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Notifications */}
      <NotificationPanel notifications={notifications} onClear={() => setNotifications([])} />
    </div>
  );
};

export default Index;
