import { Allocation } from "@/types";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotificationPanelProps {
  notifications: Allocation[];
  onClear: () => void;
}

export const NotificationPanel = ({ notifications, onClear }: NotificationPanelProps) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 max-w-md animate-slide-up z-50">
      <div className="bg-card border border-border rounded-xl shadow-xl p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Recent Allocations</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {notifications.slice(-5).reverse().map((notification, index) => (
            <div
              key={index}
              className="text-sm p-2 bg-success/10 border border-success/20 rounded-lg animate-fade-in"
            >
              <p className="text-foreground">
                <span className="font-semibold text-info">{notification.ngo}</span> has been
                notified to collect{" "}
                <span className="font-semibold text-primary">{notification.amount} units</span> from{" "}
                <span className="font-semibold text-accent">{notification.canteen}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {notification.timestamp.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
