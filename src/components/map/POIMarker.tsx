'use client';

import React, { useMemo } from 'react';
import { Marker } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { renderToString } from 'react-dom/server';
import { POIMarkerData } from '@/types/app-types';
import { POIPopup } from './POIPopup';
import { FaMusic } from 'react-icons/fa';

interface POIMarkerProps {
  poi: POIMarkerData;
  color: string;
  isSelected?: boolean;
  showPopup?: boolean;
  onClick?: () => void;
  onPlayClick?: (poi: POIMarkerData) => void;
}

export const POIMarker: React.FC<POIMarkerProps> = ({
  poi,
  color,
  isSelected = false,
  showPopup = false,
  onClick,
  onPlayClick,
}) => {
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

  return (
    <Marker
      position={[poi.latitude, poi.longitude]}
      icon={createPOIIcon}
      eventHandlers={{
        click: (e) => {
          // Stop propagation to prevent map click event
          e.originalEvent?.stopPropagation();
          onClick?.();
        },
      }}
    >
      {/* Interactive popup - opens when marker is clicked */}
      {showPopup && <POIPopup poi={poi} color={color} onPlayClick={onPlayClick} />}
    </Marker>
  );
};

export default POIMarker;
