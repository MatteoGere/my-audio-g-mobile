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
}

export const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  onMove,
  onMoveStart,
  onMoveEnd,
  onBoundsChange,
  onClick,
}) => {
  // Timer ref used to debounce bounds updates (400ms)
  const boundsDebounceRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (boundsDebounceRef.current) {
        clearTimeout(boundsDebounceRef.current);
      }
    };
  }, []);

  const scheduleBoundsUpdate = (payload: { north: number; south: number; east: number; west: number }) => {
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
      onMoveStart?.();
    },
    
    move: () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMove?.(center, zoom);
    },
    
    moveend: () => {
      onMoveEnd?.();

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
      onClick?.(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
};

export default MapEventHandler;