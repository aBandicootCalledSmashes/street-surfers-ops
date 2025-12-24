import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GripHorizontal, Maximize2, Minimize2 } from "lucide-react";
import { TripStatus } from "@/types/trip";
import { TripMapLeaflet } from "@/components/TripMapLeaflet";
import { Button } from "@/components/ui/button";

type Coords = { lat: number; lng: number };

interface TripMapPanelProps {
  pickup?: Coords;
  dropoff?: Coords;
  driver?: Coords;
  status: TripStatus;
}

const MIN_H = 120;
const MAX_H = 420;
const DEFAULT_H = 220;

export function TripMapPanel({ pickup, dropoff, driver, status }: TripMapPanelProps) {
  const [height, setHeight] = useState<number>(DEFAULT_H);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startHRef = useRef(0);

  const clampedHeight = useMemo(() => Math.max(MIN_H, Math.min(MAX_H, height)), [height]);

  useEffect(() => {
    // Keep map a bit larger on bigger screens while staying mobile-first.
    const isWide = window.matchMedia?.("(min-width: 768px)")?.matches;
    if (isWide) setHeight((h) => Math.max(h, 260));
  }, []);

  const setCollapsed = useCallback(() => setHeight(MIN_H), []);
  const setExpanded = useCallback(() => setHeight(MAX_H), []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only primary touch/mouse.
    if (e.button !== 0 && e.pointerType === "mouse") return;
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHRef.current = clampedHeight;

    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [clampedHeight]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dy = e.clientY - startYRef.current;
    setHeight(startHRef.current + dy);
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap for clean one-handed UX.
    const mid = (MIN_H + MAX_H) / 2;
    setHeight((h) => (h < mid ? MIN_H : DEFAULT_H));
  }, [isDragging]);

  const isCollapsed = clampedHeight <= MIN_H + 6;
  const isExpanded = clampedHeight >= MAX_H - 6;

  return (
    <section aria-label="Trip map" className="relative">
      <TripMapLeaflet
        pickup={pickup}
        dropoff={dropoff}
        driver={driver}
        status={status}
        height={clampedHeight}
      />

      {/* Drag handle */}
      <div
        role="separator"
        aria-label="Resize map"
        className="-mt-3 flex items-center justify-center"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-background/90 px-3 py-2 shadow-sm backdrop-blur active:scale-[0.99]"
          style={{ touchAction: "none" }}
        >
          <GripHorizontal className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground">
            {isDragging ? "Resizing" : isCollapsed ? "Expand map" : "Drag to resize"}
          </span>

          <div className="ml-2 flex items-center gap-1">
            {!isCollapsed && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCollapsed();
                }}
                aria-label="Minimize map"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            {!isExpanded && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded();
                }}
                aria-label="Maximize map"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
