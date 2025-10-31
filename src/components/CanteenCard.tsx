import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Canteen } from "@/types";
import { UtensilsCrossed, MoveRight } from "lucide-react";

interface CanteenCardProps {
  canteen: Canteen;
}

export const CanteenCard = ({ canteen }: CanteenCardProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: canteen.name,
    data: { canteen },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const remainingPercentage = (canteen.surplus / canteen.originalSurplus) * 100;

  return (
    <div className="bg-canteen border-2 border-primary/20 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{canteen.name}</h3>
            <p className="text-xs text-muted-foreground">Canteen</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Surplus</span>
          <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg cursor-grab active:cursor-grabbing transition-all hover:scale-105 border-2 border-primary/30"
          >
            <span className="font-bold text-primary text-base">{canteen.surplus} units</span>
            <MoveRight className="h-4 w-4 text-primary" />
          </div>
        </div>

        {canteen.surplus < canteen.originalSurplus && (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${remainingPercentage}%` }}
            />
          </div>
        )}

        {canteen.surplus === 0 && (
          <div className="text-xs text-center py-1 bg-muted rounded-md text-muted-foreground">
            Fully Allocated
          </div>
        )}
      </div>
    </div>
  );
};
