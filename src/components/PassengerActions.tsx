import { useState } from 'react';
import { UserCheck, UserX, XCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './ConfirmDialog';
import { Passenger, PassengerStatus, TripStatus } from '@/types/trip';

interface PassengerActionsProps {
  passenger: Passenger;
  tripStatus: TripStatus;
  onUpdatePassengerStatus: (passengerId: string, status: PassengerStatus) => Promise<void>;
  isLoading?: boolean;
}

type ActionType = 'picked_up' | 'dropped_off' | 'failed_pickup' | 'cancelled';

interface ActionConfig {
  label: string;
  icon: typeof UserCheck;
  variant: 'default' | 'destructive' | 'warning';
  description: string;
}

const ACTION_CONFIGS: Record<ActionType, ActionConfig> = {
  picked_up: {
    label: 'Picked Up',
    icon: UserCheck,
    variant: 'default',
    description: 'Mark this passenger as picked up?',
  },
  dropped_off: {
    label: 'Dropped Off',
    icon: CheckCircle2,
    variant: 'default',
    description: 'Mark this passenger as dropped off?',
  },
  failed_pickup: {
    label: 'Failed Pickup',
    icon: UserX,
    variant: 'warning',
    description: 'Passenger was not present at pickup location?',
  },
  cancelled: {
    label: 'Cancel',
    icon: XCircle,
    variant: 'destructive',
    description: 'Cancel this passenger from the trip?',
  },
};

export function PassengerActions({
  passenger,
  tripStatus,
  onUpdatePassengerStatus,
  isLoading = false,
}: PassengerActionsProps) {
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleAction = async () => {
    if (!confirmAction || processing) return;

    setProcessing(true);
    try {
      await onUpdatePassengerStatus(passenger.id, confirmAction);
    } finally {
      setProcessing(false);
      setConfirmAction(null);
    }
  };

  const getStatusBadge = () => {
    switch (passenger.status) {
      case 'picked_up':
        return (
          <div className="flex items-center gap-2 px-4 py-3 bg-success/20 rounded-xl">
            <UserCheck className="w-5 h-5 text-success" />
            <span className="font-semibold text-success">Picked Up</span>
          </div>
        );
      case 'dropped_off':
        return (
          <div className="flex items-center gap-2 px-4 py-3 bg-success/20 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="font-semibold text-success">Dropped Off</span>
          </div>
        );
      case 'failed_pickup':
        return (
          <div className="flex items-center gap-2 px-4 py-3 bg-warning/20 rounded-xl">
            <UserX className="w-5 h-5 text-warning" />
            <span className="font-semibold text-warning">Failed Pickup</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-2 px-4 py-3 bg-destructive/20 rounded-xl">
            <XCircle className="w-5 h-5 text-destructive" />
            <span className="font-semibold text-destructive">Cancelled</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Determine available actions based on trip and passenger status
  const getAvailableActions = (): ActionType[] => {
    if (passenger.status !== 'pending') {
      return []; // Already actioned
    }

    // At pickup (arrived_pickup status) - can pick up, fail, or cancel
    if (tripStatus === 'arrived_pickup') {
      return ['picked_up', 'failed_pickup', 'cancelled'];
    }

    // In progress (driving to dropoff) - can drop off or cancel
    if (tripStatus === 'in_progress') {
      return ['dropped_off', 'cancelled'];
    }

    // En route - only cancel available
    if (tripStatus === 'en_route_pickup') {
      return ['cancelled'];
    }

    return [];
  };

  const availableActions = getAvailableActions();

  // If passenger already has a final status, show the status badge
  if (passenger.status !== 'pending') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">{passenger.name}</p>
            <p className="text-sm text-muted-foreground">{passenger.count} passenger{passenger.count > 1 ? 's' : ''}</p>
          </div>
          {getStatusBadge()}
        </div>
      </div>
    );
  }

  // No actions available in current trip state
  if (availableActions.length === 0) {
    return (
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-semibold text-lg">{passenger.name}</p>
          <p className="text-sm text-muted-foreground">{passenger.count} passenger{passenger.count > 1 ? 's' : ''}</p>
        </div>
        <div className="px-3 py-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">Waiting</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg">{passenger.name}</p>
            <p className="text-sm text-muted-foreground">{passenger.count} passenger{passenger.count > 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {availableActions.map((action) => {
            const config = ACTION_CONFIGS[action];
            const Icon = config.icon;
            const isPositive = action === 'picked_up' || action === 'dropped_off';
            
            return (
              <Button
                key={action}
                variant={isPositive ? 'success' : action === 'cancelled' ? 'destructive' : 'outline'}
                size="lg"
                className={`min-h-[56px] text-base font-semibold justify-start gap-3 ${
                  action === 'failed_pickup' ? 'border-warning text-warning hover:bg-warning/10' : ''
                }`}
                onClick={() => setConfirmAction(action)}
                disabled={isLoading || processing}
              >
                {processing && confirmAction === action ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
                {config.label}
              </Button>
            );
          })}
        </div>
      </div>

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={ACTION_CONFIGS[confirmAction].label}
          description={ACTION_CONFIGS[confirmAction].description}
          confirmLabel={ACTION_CONFIGS[confirmAction].label}
          onConfirm={handleAction}
          variant={ACTION_CONFIGS[confirmAction].variant}
          isLoading={processing}
        />
      )}
    </>
  );
}
