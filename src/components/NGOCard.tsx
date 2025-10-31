import { useDroppable } from "@dnd-kit/core";
import { NGO } from "@/types";
import { Heart, CheckCircle2, AlertCircle } from "lucide-react";

interface NGOCardProps {
  ngo: NGO;
}

export const NGOCard = ({ ngo }: NGOCardProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: ngo.name,
    data: { ngo },
  });

  const fulfilled = ngo.originalRequirement - ngo.requirement;
  const fulfillmentPercentage =
    ngo.originalRequirement > 0 ? (fulfilled / ngo.originalRequirement) * 100 : 0;

  let statusColor = "unfulfilled";
  let StatusIcon = AlertCircle;
  let statusText = "Unfulfilled";

  if (fulfillmentPercentage >= 100) {
    statusColor = "fulfilled";
    StatusIcon = CheckCircle2;
    statusText = "Fulfilled";
  } else if (fulfillmentPercentage > 0) {
    statusColor = "partial";
    StatusIcon = AlertCircle;
    statusText = "Partial";
  }

  return (
    <div
      ref={setNodeRef}
      className={`bg-ngo border-2 rounded-xl p-4 shadow-md transition-all duration-300 hover:scale-[1.02] ${
        isOver
          ? "border-primary shadow-xl scale-105 animate-pulse-glow"
          : "border-blue-500/20"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-info/10 rounded-lg">
            <Heart className="h-5 w-5 text-info" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{ngo.name}</h3>
            <p className="text-xs text-muted-foreground">NGO</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-${statusColor}/10`}>
          <StatusIcon className={`h-3 w-3 text-${statusColor}`} />
          <span className={`text-${statusColor} font-medium`}>{statusText}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Requirement</span>
          <span className="font-bold text-info text-lg">{ngo.originalRequirement} units</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Fulfilled</span>
          <span className="font-semibold text-success">{fulfilled} units</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Remaining</span>
          <span className="font-semibold text-accent">{ngo.requirement} units</span>
        </div>

        {ngo.originalRequirement > 0 && (
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={`bg-${statusColor} rounded-full h-2 transition-all duration-300`}
              style={{ width: `${fulfillmentPercentage}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
