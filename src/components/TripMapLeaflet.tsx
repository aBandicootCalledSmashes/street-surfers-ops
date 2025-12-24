import { useEffect, useMemo } from "react";
import * as RL from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import { configureLeafletDefaults } from "@/lib/leaflet";
import { TripStatus } from "@/types/trip";
import { AlertCircle, MapPin, Navigation } from "lucide-react";

type Coords = { lat: number; lng: number };

interface TripMapLeafletProps {
  pickup?: Coords;
  dropoff?: Coords;
  driver?: Coords;
  status: TripStatus;
  className?: string;
  height?: number | string;
}

function FitToBounds({ points }: { points: LatLngExpression[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const map = (RL as any).useMap();

  useEffect(() => {
    if (!points.length) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (map as any).fitBounds(points as any, { padding: [24, 24] });
  }, [map, points]);

  return null;
}

export function TripMapLeaflet({ pickup, dropoff, driver, status, className, height = 220 }: TripMapLeafletProps) {
  useEffect(() => {
    configureLeafletDefaults();
  }, []);

  const points = useMemo<LatLngExpression[]>(() => {
    const pts: LatLngExpression[] = [];
    if (pickup) pts.push([pickup.lat, pickup.lng]);
    if (dropoff) pts.push([dropoff.lat, dropoff.lng]);
    return pts;
  }, [pickup, dropoff]);

  const route = useMemo<LatLngExpression[] | null>(() => {
    if (!pickup || !dropoff) return null;
    return [
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng],
    ];
  }, [pickup, dropoff]);

  const center = useMemo<LatLngExpression>(() => {
    if (driver) return [driver.lat, driver.lng];
    if (pickup) return [pickup.lat, pickup.lng];
    if (dropoff) return [dropoff.lat, dropoff.lng];
    return [-33.9249, 18.4241];
  }, [driver, pickup, dropoff]);

  const isMissingCoords = !pickup || !dropoff;

  if (isMissingCoords) {
    return (
      <div
        className={"relative w-full overflow-hidden rounded-xl border border-border bg-card " + (className ?? "")}
        style={{ height }}
      >
        <div className="absolute inset-0 grid place-items-center p-4 text-center">
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold">Map unavailable</p>
            <p className="text-xs text-muted-foreground">Missing pickup/drop-off coordinates.</p>
          </div>
        </div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const MapContainer: any = (RL as any).MapContainer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TileLayer: any = (RL as any).TileLayer;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Marker: any = (RL as any).Marker;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Polyline: any = (RL as any).Polyline;

  return (
    <div
      className={"relative w-full overflow-hidden rounded-xl border border-border bg-card " + (className ?? "")}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={true}
        preferCanvas
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Keep interactions snappy on mid-range devices
          updateWhenIdle
          updateWhenZooming={false}
          keepBuffer={2}
        />

        {route && (
          <Polyline
            positions={route}
            pathOptions={{
              color: "hsl(var(--primary))",
              weight: 4,
              opacity: status === "in_progress" ? 0.95 : 0.75,
            }}
          />
        )}

        {pickup && <Marker position={[pickup.lat, pickup.lng]} />}
        {dropoff && <Marker position={[dropoff.lat, dropoff.lng]} />}
        {driver && <Marker position={[driver.lat, driver.lng]} />}

        <FitToBounds points={points} />
      </MapContainer>

      <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
        <div className="inline-flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur">
          <MapPin className="h-4 w-4 text-primary" />
          Pickup
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-background/80 px-3 py-2 text-xs font-semibold text-foreground backdrop-blur">
          <Navigation className="h-4 w-4 text-success" />
          Drop-off
        </div>
      </div>
    </div>
  );
}
