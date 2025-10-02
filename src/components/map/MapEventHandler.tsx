'use client';

import { useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import { useRef, useEffect } from 'react';

interface MapEventHandlerProps {
  onMove?: (center: { lat: number; lng: number }, zoom: number) => void;
  onMoveStart?: () => void;
  onMoveEnd?: () => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onClick?: (lat: number, lng: number) => void;
  // Delay (ms) to ignore initial map events after mount. Useful to avoid
  // the map writing its initial view back into the store when the
  // application already has a desired center.
  initialEventDelayMs?: number;
}

export const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  onMove,
  onMoveStart,
  onMoveEnd,
  onBoundsChange,
  onClick,
  initialEventDelayMs = 300,
}) => {
  // Timer ref used to debounce bounds updates (400ms)
  const boundsDebounceRef = useRef<number | null>(null);
  const skipInitialRef = useRef<boolean>(true);

  useEffect(() => {
    // Clear debounce timer on unmount
    return () => {
      if (boundsDebounceRef.current) {
        clearTimeout(boundsDebounceRef.current);
      }
      skipInitialRef.current = false;
    };
  }, []);

  // Clear the initial skip after a short delay so the first programmatic
  // map setView doesn't get echoed back into the store.
  useEffect(() => {
    const id = window.setTimeout(() => {
      skipInitialRef.current = false;
    }, initialEventDelayMs);
    return () => clearTimeout(id);
  }, [initialEventDelayMs]);

  const scheduleBoundsUpdate = (payload: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => {
    if (!onBoundsChange) return;
    if (boundsDebounceRef.current) {
      clearTimeout(boundsDebounceRef.current);
    }
    // window.setTimeout returns a number in browsers
    boundsDebounceRef.current = window.setTimeout(() => {
      onBoundsChange(payload);
      boundsDebounceRef.current = null;
    }, 800);
  };

  const map = useMapEvents({
    movestart: () => {
      if (skipInitialRef.current) return;
      onMoveStart?.();
    },

    moveend: () => {
      if (skipInitialRef.current) return;
      onMoveEnd?.();

      // Update center and zoom after movement ends
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMove?.(center, zoom);

      // Update bounds (debounced)
      const bounds = map.getBounds();
      scheduleBoundsUpdate({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },

    zoomend: () => {
      if (skipInitialRef.current) return;
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMove?.(center, zoom);

      // Update bounds after zoom (debounced)
      const bounds = map.getBounds();
      scheduleBoundsUpdate({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },

    click: (e: LeafletMouseEvent) => {
      if (skipInitialRef.current) return;
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export default MapEventHandler;
