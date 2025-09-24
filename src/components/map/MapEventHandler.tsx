'use client';

import { useMapEvents } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';

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
      
      // Update bounds
      const bounds = map.getBounds();
      onBoundsChange?.({
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
      
      // Update bounds after zoom
      const bounds = map.getBounds();
      onBoundsChange?.({
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