'use client';

import React, { useMemo } from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import { renderToString } from 'react-dom/server';
import { POIMarkerData } from '@/types/app-types';
import { POIPopup } from './POIPopup';
import { FaPlay, FaMusic, FaMapMarkerAlt } from 'react-icons/fa';

interface POIMarkerProps {
  poi: POIMarkerData;
  color: string;
  isSelected?: boolean;
  showLabel?: boolean;
  showPopup?: boolean;
  onClick?: () => void;
  onPlayClick?: (poi: POIMarkerData) => void;
}

export const POIMarker: React.FC<POIMarkerProps> = ({
  poi,
  color,
  isSelected = false,
  showLabel = true,
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

  // Format duration for display
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <Marker
      position={[poi.latitude, poi.longitude]}
      icon={createPOIIcon}
      eventHandlers={{
        click: () => onClick?.(),
      }}
    >
      {/* Tooltip with track info */}
      {showLabel && !showPopup && (
        <Tooltip
          direction="top"
          offset={[0, -40]}
          opacity={0.9}
          permanent={false}
          sticky={true}
          className="poi-tooltip"
        >
          <div className="text-sm">
            <div className="font-semibold text-foreground">{poi.trackName}</div>
            <div className="text-muted text-xs">
              {poi.itineraryName} • {formatDuration(poi.duration)}
            </div>
            <div className="text-muted text-xs mt-1">{poi.companyName}</div>
          </div>
        </Tooltip>
      )}

      {/* Interactive popup */}
      {showPopup && <POIPopup poi={poi} color={color} onPlayClick={onPlayClick} />}
    </Marker>
  );
};

export default POIMarker;
