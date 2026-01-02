import { useState } from 'react';
import { Phone, MessageCircle, UserCheck, UserX, XCircle, CheckCircle2, Loader2, ChevronDown, ChevronUp, Users, Navigation, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from './ConfirmDialog';
import { Passenger, PassengerStatus, TripStatus, TripType } from '@/types/trip';

interface PassengerCardProps {
  passenger: Passenger;
  tripStatus: TripStatus;
  tripType: TripType;
  onUpdatePassengerStatus: (passengerId: string, status: PassengerStatus) => Promise<void>;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  isActivePickup?: boolean;
}

type ActionType = 'picked_up' | 'dropped_off' | 'failed_pickup' | 'cancelled';

// Open device maps app with address - always opens in new tab/app
function openMapsNavigation(address: string, coordinates?: { lat: number; lng: number }) {
  // Use coordinates if available for more accurate navigation
  const destination = coordinates 
    ? `${coordinates.lat},${coordinates.lng}`
    : encodeURIComponent(address);
  
  // Detect platform
  const userAgent = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isAndroid = /android/.test(userAgent);
  
  let mapsUrl: string;
  
  if (isIOS) {
    // Apple Maps deep link - opens in Maps app
    mapsUrl = coordinates
      ? `maps://maps.apple.com/?daddr=${coordinates.lat},${coordinates.lng}`
      : `maps://maps.apple.com/?daddr=${destination}`;
  } else if (isAndroid) {
    // Google Maps intent - opens in Maps app
    mapsUrl = coordinates
      ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  } else {
    // Desktop - Google Maps web in new tab
    mapsUrl = coordinates
      ? `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  }
  
  // Always open in new tab/window to preserve app state
  // Using window.open with '_blank' ensures the current page stays active
  const newWindow = window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  
  // Fallback for iOS if maps:// doesn't work
  if (isIOS && !newWindow) {
    // Try HTTPS fallback for Apple Maps
    const fallbackUrl = coordinates
      ? `https://maps.apple.com/?daddr=${coordinates.lat},${coordinates.lng}`
      : `https://maps.apple.com/?daddr=${destination}`;
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }
}

export function PassengerCard({
  passenger,
  tripStatus,
  tripType,
  onUpdatePassengerStatus,
  isExpanded = false,
  onToggleExpand,
  isActivePickup = false,
}: PassengerCardProps) {
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

  // Determine which address to show based on trip type
  const getPassengerAddress = () => {
    // Inbound: Home → Work, so show pickup address (home)
    // Outbound: Work → Homes, so show dropoff address (home)
    return passenger.homeAddress;
  };

  const getAddressLabel = () => {
    return tripType === 'inbound' ? 'Pickup Address' : 'Drop-off Address';
  };

  const getStatusBadge = () => {
    // Show "En route" badge if this is active pickup passenger
    if (isActivePickup && passenger.status === 'pending') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-lg animate-pulse">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-primary">En route</span>
        </div>
      );
    }

    const statusConfig = {
      picked_up: { icon: UserCheck, label: 'Picked Up', bg: 'bg-success', text: 'text-success-foreground' },
      dropped_off: { icon: CheckCircle2, label: 'Dropped Off', bg: 'bg-success', text: 'text-success-foreground' },
      failed_pickup: { icon: UserX, label: 'No Show', bg: 'bg-warning', text: 'text-warning-foreground' },
      cancelled: { icon: XCircle, label: 'Cancelled', bg: 'bg-destructive', text: 'text-destructive-foreground' },
      pending: { icon: Users, label: 'Waiting', bg: 'bg-muted', text: 'text-muted-foreground' },
    };
    
    const config = statusConfig[passenger.status];
    const Icon = config.icon;
    
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 ${config.bg} rounded-lg`}>
        <Icon className={`w-4 h-4 ${config.text}`} />
        <span className={`text-sm font-semibold ${config.text}`}>{config.label}</span>
      </div>
    );
  };

  const getAvailableActions = (): ActionType[] => {
    if (passenger.status !== 'pending') return [];
    
    if (tripStatus === 'arrived_pickup') {
      return ['picked_up', 'failed_pickup', 'cancelled'];
    }
    if (tripStatus === 'in_progress') {
      return ['dropped_off', 'cancelled'];
    }
    if (tripStatus === 'en_route_pickup') {
      return ['cancelled'];
    }
    return [];
  };

  const availableActions = getAvailableActions();
  const passengerAddress = getPassengerAddress();

  // Card highlight for active pickup
  const cardClasses = isActivePickup && passenger.status === 'pending'
    ? 'bg-card border-2 border-primary/50 rounded-xl overflow-hidden shadow-lg shadow-primary/10'
    : 'bg-card border border-border rounded-xl overflow-hidden';

  return (
    <>
      <div className={cardClasses}>
        {/* Header - Always visible */}
        <button
          onClick={onToggleExpand}
          className="w-full p-4 flex items-center justify-between active:bg-secondary/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActivePickup && passenger.status === 'pending' 
                ? 'bg-primary/20 border border-primary/40' 
                : 'bg-secondary'
            }`}>
              {isActivePickup && passenger.status === 'pending' ? (
                <Navigation className="w-5 h-5 text-primary" />
              ) : (
                <Users className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">{passenger.name}</p>
              </div>
              <p className="text-sm text-muted-foreground">{passenger.count} passenger{passenger.count > 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {onToggleExpand && (
              isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded content */}
        {isExpanded && (
          <div className="border-t border-border p-4 space-y-4 animate-slide-up">
            {/* Address section */}
            <div className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">{getAddressLabel()}</p>
                  <p className="text-sm text-foreground">{passengerAddress}</p>
                </div>
              </div>
            </div>

            {/* Navigate button */}
            {passenger.status === 'pending' && passengerAddress && (
              <Button
                variant="outline"
                size="lg"
                className="w-full min-h-[52px] text-base font-semibold border-primary text-primary hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  openMapsNavigation(passengerAddress, passenger.homeCoordinates);
                }}
              >
                <ExternalLink className="w-5 h-5" />
                Navigate
              </Button>
            )}

            {/* Contact buttons */}
            <div className="flex gap-2">
              <a 
                href={`tel:${passenger.phone}`}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-primary rounded-lg hover:bg-primary/90 transition-colors active:scale-95 min-h-[48px]"
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">Call</span>
              </a>
              <a 
                href={`sms:${passenger.phone}`}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors active:scale-95 min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Message</span>
              </a>
            </div>

            {/* Action buttons - Only show if pending */}
            {availableActions.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {availableActions.includes('picked_up') && (
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full min-h-[52px] text-base font-semibold"
                    onClick={() => setConfirmAction('picked_up')}
                    disabled={processing}
                  >
                    <UserCheck className="w-5 h-5" />
                    Mark as Picked Up
                  </Button>
                )}
                
                {availableActions.includes('dropped_off') && (
                  <Button
                    variant="success"
                    size="lg"
                    className="w-full min-h-[52px] text-base font-semibold"
                    onClick={() => setConfirmAction('dropped_off')}
                    disabled={processing}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Mark as Dropped Off
                  </Button>
                )}

                <div className="flex gap-2">
                  {availableActions.includes('failed_pickup') && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 min-h-[48px] border-warning text-warning hover:bg-warning/10"
                      onClick={() => setConfirmAction('failed_pickup')}
                      disabled={processing}
                    >
                      <UserX className="w-5 h-5" />
                      No Show
                    </Button>
                  )}
                  
                  {availableActions.includes('cancelled') && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 min-h-[48px] border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => setConfirmAction('cancelled')}
                      disabled={processing}
                    >
                      <XCircle className="w-5 h-5" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {confirmAction && (
        <ConfirmDialog
          open={!!confirmAction}
          onOpenChange={(open) => !open && setConfirmAction(null)}
          title={
            confirmAction === 'picked_up' ? 'Confirm Pickup' :
            confirmAction === 'dropped_off' ? 'Confirm Drop-off' :
            confirmAction === 'failed_pickup' ? 'No Show' : 'Cancel Passenger'
          }
          description={
            confirmAction === 'picked_up' ? `Mark ${passenger.name} as picked up?` :
            confirmAction === 'dropped_off' ? `Mark ${passenger.name} as dropped off?` :
            confirmAction === 'failed_pickup' ? `${passenger.name} was not present at pickup?` :
            `Cancel ${passenger.name} from this trip?`
          }
          confirmLabel={
            confirmAction === 'picked_up' ? 'Yes, Picked Up' :
            confirmAction === 'dropped_off' ? 'Yes, Dropped Off' :
            confirmAction === 'failed_pickup' ? 'Confirm No Show' : 'Yes, Cancel'
          }
          onConfirm={handleAction}
          variant={confirmAction === 'cancelled' ? 'destructive' : confirmAction === 'failed_pickup' ? 'warning' : 'default'}
          isLoading={processing}
        />
      )}
    </>
  );
}
