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
  const skipInitialRef = useRef<boolean>(true);

  useEffect(() => {
    return () => {
      skipInitialRef.current = false;
    };
  }, []);

  // Clear the initial skip after a short delay so the first programmatic
  // map setView doesn't get echoed back into the store.
  useEffect(() => {
    const id = window.setTimeout(() => {
      console.log('[MapEventHandler] Initial delay ended, events will now be processed');
      skipInitialRef.current = false;
    }, initialEventDelayMs);
    return () => clearTimeout(id);
  }, [initialEventDelayMs]);

  const map = useMapEvents({
    movestart: () => {
      if (skipInitialRef.current) {
        console.log('[MapEventHandler] movestart - SKIPPED (initial delay)');
        return;
      }
      console.log('[MapEventHandler] movestart');
      onMoveStart?.();
    },

    moveend: () => {
      if (skipInitialRef.current) {
        console.log('[MapEventHandler] moveend - SKIPPED (initial delay)');
        return;
      }
      console.log('[MapEventHandler] moveend');
      onMoveEnd?.();

      // Update center and zoom after movement ends
      const center = map.getCenter();
      const zoom = map.getZoom();
      console.log('[MapEventHandler] moveend - calling onMove', { center, zoom });
      onMove?.(center, zoom);

      // Update bounds
      const bounds = map.getBounds();
      console.log('[MapEventHandler] moveend - calling onBoundsChange', bounds);
      onBoundsChange?.({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },

    zoomend: () => {
      if (skipInitialRef.current) {
        console.log('[MapEventHandler] zoomend - SKIPPED (initial delay)');
        return;
      }
      console.log('[MapEventHandler] zoomend');
      const center = map.getCenter();
      const zoom = map.getZoom();
      console.log('[MapEventHandler] zoomend - calling onMove', { center, zoom });
      onMove?.(center, zoom);

      // Update bounds after zoom
      const bounds = map.getBounds();
      console.log('[MapEventHandler] zoomend - calling onBoundsChange', bounds);
      onBoundsChange?.({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      });
    },

    click: (e: LeafletMouseEvent) => {
      if (skipInitialRef.current) {
        console.log('[MapEventHandler] click - SKIPPED (initial delay)');
        return;
      }
      console.log('[MapEventHandler] click', { lat: e.latlng.lat, lng: e.latlng.lng });
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export default MapEventHandler;
