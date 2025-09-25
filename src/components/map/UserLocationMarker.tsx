'use client';

import React from 'react';
import { Marker, Circle } from 'react-leaflet';
import { DivIcon, LatLngExpression } from 'leaflet';
import { renderToString } from 'react-dom/server';
import { FaLocationArrow } from 'react-icons/fa';

interface UserLocationMarkerProps {
  position: LatLngExpression;
  accuracy?: number; // accuracy radius in meters
  heading?: number; // compass heading in degrees
  showAccuracyCircle?: boolean;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  position,
  accuracy = 0,
  heading,
  showAccuracyCircle = true,
}) => {
  // Create custom user location icon
  const createUserLocationIcon = (heading?: number) => {
    const iconHtml = renderToString(
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute w-8 h-8 bg-blue-500 bg-opacity-20 rounded-full animate-ping" />
        {/* Main marker */}
        <div className="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-lg">
          {/* Direction arrow if heading is available */}
          {heading !== undefined && (
            <div
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full text-blue-600"
              style={{ transform: `translateX(-50%) translateY(-100%) rotate(${heading}deg)` }}
            >
              <FaLocationArrow size={12} />
            </div>
          )}
        </div>
      </div>,
    );

    return new DivIcon({
      html: iconHtml,
      className: 'user-location-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <>
      {/* Accuracy circle */}
      {showAccuracyCircle && accuracy > 0 && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.5,
          }}
        />
      )}

      {/* User location marker */}
      <Marker
        position={position}
        icon={createUserLocationIcon(heading)}
        zIndexOffset={1000} // Ensure user marker is always on top
      />
    </>
  );
};

export default UserLocationMarker;
