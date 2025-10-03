'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { Marker } from 'react-leaflet';
import { DivIcon, Marker as LeafletMarker } from 'leaflet';
import { renderToString } from 'react-dom/server';
import { POIMarkerData } from '@/types/app-types';
import { POIPopup } from './POIPopup';
import { FaMusic } from 'react-icons/fa';
import { Card } from '../ui';

interface POIMarkerProps {
  poi: POIMarkerData;
  color: string;
  isSelected?: boolean;
  showPopup?: boolean;
  onClick?: () => void;
  onPlayClick?: (poi: POIMarkerData) => void;
  onPopupOpen?: (poi: POIMarkerData) => void;
  onPopupClose?: (poi: POIMarkerData) => void;
}

export const POIMarker: React.FC<POIMarkerProps> = ({
  poi,
  color,
  isSelected = false,
  showPopup = false,
  onClick,
  onPlayClick,
  onPopupOpen,
  onPopupClose,
}) => {
  const markerRef = useRef<LeafletMarker | null>(null);

  // Create custom POI marker icon
  const createPOIIcon = useMemo(() => {
    const iconHtml = renderToString(
      <div className="relative flex items-center justify-center">
        {/* Selection ring */}
        {isSelected && (
          <div
            className="absolute w-12 h-12 border-2 border-muted rounded-full animate-pulse"
            style={{ backgroundColor: `${color}40` }}
          />
        )}

        {/* Main marker */}
        <div
          className="relative w-8 h-8 rounded-full border-2 border-muted shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
          style={{ backgroundColor: color }}
        >
          <FaMusic className="text-primary-foreground text-sm" />
        </div>

        {/* Pointer */}
        <div
          className="absolute bottom-0 w-0 h-0 transform translate-y-full"
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${color}`,
          }}
        />
      </div>,
    );

    return new DivIcon({
      html: iconHtml,
      className: `poi-marker ${isSelected ? 'poi-marker-selected' : ''}`,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });
  }, [color, isSelected]);

  // Ensure the popup opens on the first click by programmatically controlling it
  useEffect(() => {
    const m = markerRef.current;
    if (!m) return;
    if (showPopup) {
      // Delay to next tick to ensure <Popup> child is mounted
      const t = setTimeout(() => {
        try {
          m.openPopup();
        } catch {
          /* noop */
        }
      }, 0);
      return () => clearTimeout(t);
    } else {
      try {
        m.closePopup();
      } catch {
        /* noop */
      }
    }
  }, [showPopup]);

  return (
    <Marker
      ref={(instance) => {
        // react-leaflet passes the Leaflet instance here
        // cast to LeafletMarker where possible
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        markerRef.current = (instance as unknown as any) ?? null;
      }}
      position={[poi.latitude, poi.longitude]}
      icon={createPOIIcon}
      eventHandlers={{
        click: (e) => {
          // Stop propagation to prevent map click event
          e.originalEvent?.stopPropagation();
          onClick?.();
        },
        popupopen: () => onPopupOpen?.(poi),
        popupclose: () => onPopupClose?.(poi),
      }}
    >
      {/* Interactive popup - opens when marker is clicked */}
      <Card>{showPopup && <POIPopup poi={poi} color={color} onPlayClick={onPlayClick} />}</Card>
    </Marker>
  );
};

export default POIMarker;
