import { WifiOff, Loader2 } from 'lucide-react';

interface OfflineBannerProps {
  isReconnecting?: boolean;
}

export function OfflineBanner({ isReconnecting = false }: OfflineBannerProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning/90 text-warning-foreground px-4 py-3">
      <div className="flex items-center justify-center gap-3">
        {isReconnecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="font-semibold">Reconnecting...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-5 h-5" />
            <span className="font-semibold">You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}
