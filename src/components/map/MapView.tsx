'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
} from 'react-leaflet';
import type { Map as LeafletMap, LatLngExpression, LatLngLiteral } from 'leaflet';
import L from 'leaflet';
import { Button, Badge, Card } from '@/components/ui';
import {
  HiOutlineArrowsPointingIn,
  HiOutlineArrowsPointingOut,
  HiOutlineMapPin,
  HiOutlinePlay,
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineRss,
  HiOutlineSparkles,
} from 'react-icons/hi2';

export type MapMarkerType = 'start' | 'end' | 'poi' | 'current' | 'favorite';

export interface MapPoi {
  id: string;
  trackId: string;
  itineraryId: string;
  itineraryName: string;
  title: string;
  description?: string | null;
  latitude: number;
  longitude: number;
  duration?: number | null;
  order?: number | null;
  markerType: MapMarkerType;
  imageUrl?: string;
}

export interface MapViewProps {
  initialCenter: LatLngLiteral;
  userLocation?: { position: LatLngLiteral; accuracy?: number };
  pois: MapPoi[];
  selectedTrackId?: string | null;
  mapTheme: 'standard' | 'dark';
  followUser: boolean;
  isFullscreen: boolean;
  loading?: boolean;
  fitBoundsKey?: string;
  focusCoordinate?: LatLngLiteral;
  onSelectTrack?: (trackId: string) => void;
  onPlayTrack?: (trackId: string) => void;
  onToggleTheme?: () => void;
  onToggleFollowUser?: (value: boolean) => void;
  onLocateUser?: () => void;
  onSearchArea?: (center: LatLngLiteral) => void;
  onToggleFullscreen?: () => void;
  onMapReady?: (map: LeafletMap) => void;
}

const STANDARD_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const STANDARD_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTRIBUTION =
  '&copy; <a href="https://carto.com/attributions">CARTO</a>, &copy; OpenStreetMap contributors';

const DEFAULT_ZOOM = 14;
const MIN_ZOOM = 4;
const MAX_ZOOM = 19;

const markerColors: Record<MapMarkerType, string> = {
  start: '#16a34a',
  end: '#b08b57',
  poi: '#2b8a9e',
  current: '#2563eb',
  favorite: '#f97316',
};

const markerSecondaryColors: Record<MapMarkerType, string> = {
  start: 'rgba(22, 163, 74, 0.2)',
  end: 'rgba(176, 139, 87, 0.2)',
  poi: 'rgba(43, 138, 158, 0.2)',
  current: 'rgba(37, 99, 235, 0.2)',
  favorite: 'rgba(249, 115, 22, 0.2)',
};

const buildMarkerIcon = (type: MapMarkerType, isSelected: boolean, order?: number | null) =>
  L.divIcon({
    className: 'map-marker-wrapper',
    html: `
      <div class="map-marker ${isSelected ? 'map-marker--selected' : ''}" style="background:${
        markerColors[type]
      }; box-shadow: 0 0 0 ${isSelected ? 8 : 4}px ${markerSecondaryColors[type]};">
        <span class="map-marker__label">${order ?? ''}</span>
      </div>
    `,
    iconAnchor: [18, 36],
    popupAnchor: [0, -24],
  });

interface TrackMarkerProps {
  poi: MapPoi;
  selected: boolean;
  onSelect?: (trackId: string) => void;
  onPlay?: (trackId: string) => void;
}

const TrackMarker = ({ poi, selected, onSelect, onPlay }: TrackMarkerProps) => {
  const markerIcon = useMemo(
    () => buildMarkerIcon(poi.markerType, selected, poi.order),
    [poi.markerType, poi.order, selected],
  );

  return (
    <Marker
      position={[poi.latitude, poi.longitude] as LatLngExpression}
      icon={markerIcon}
      eventHandlers={{
        click: () => onSelect?.(poi.trackId),
      }}
    >
      <Popup className="map-popup">
        <Card className="p-3 space-y-2 bg-white dark:bg-stone-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                {poi.itineraryName}
              </p>
              <h3 className="font-semibold text-stone-900 dark:text-stone-50">{poi.title}</h3>
            </div>
            <Badge variant="secondary">
              <HiOutlineMapPin className="w-4 h-4 mr-1" />
              Stop {poi.order ?? '?'}
            </Badge>
          </div>

          {poi.description && (
            <p className="text-sm text-stone-600 dark:text-stone-300 line-clamp-3">
              {poi.description}
            </p>
          )}

          {poi.imageUrl && (
            <div className="rounded-xl overflow-hidden aspect-video">
              <img src={poi.imageUrl} alt={poi.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>{poi.duration ? Math.round((poi.duration ?? 0) / 60) : 0} min</span>
            <span>Track ID: {poi.trackId.slice(0, 8)}…</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-full flex items-center justify-center space-x-2"
            onClick={() => onPlay?.(poi.trackId)}
          >
            <HiOutlinePlay className="w-4 h-4" />
            <span>Play this track</span>
          </Button>
        </Card>
      </Popup>
    </Marker>
  );
};

function FollowUserControl({
  position,
  follow,
}: {
  position?: LatLngLiteral;
  follow: boolean;
}) {
  const map = useMapEvents({});

  useEffect(() => {
    if (follow && position) {
      map.flyTo(position, Math.max(map.getZoom(), 16), { animate: true, duration: 0.8 });
    }
  }, [follow, position, map]);

  return null;
}

function FitBoundsController({ pois, fitBoundsKey }: { pois: MapPoi[]; fitBoundsKey?: string }) {
  const map = useMapEvents({});
  const appliedKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pois.length) return;

    const nextKey = fitBoundsKey ?? 'initial';
    if (appliedKeyRef.current === nextKey) {
      return;
    }

    if (pois.length === 1) {
      const poi = pois[0];
      map.flyTo([poi.latitude, poi.longitude], Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 0.8,
      });
    } else {
      const bounds = L.latLngBounds(
        pois.map((poi) => [poi.latitude, poi.longitude] as [number, number]),
      );

      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
    }

    appliedKeyRef.current = nextKey;
  }, [map, pois, fitBoundsKey]);

  return null;
}

const MapView = ({
  initialCenter,
  userLocation,
  pois,
  selectedTrackId,
  mapTheme,
  followUser,
  isFullscreen,
  loading,
  fitBoundsKey,
  focusCoordinate,
  onSelectTrack,
  onPlayTrack,
  onToggleTheme,
  onToggleFollowUser,
  onLocateUser,
  onSearchArea,
  onToggleFullscreen,
  onMapReady,
}: MapViewProps) => {
  const mapRef = useRef<LeafletMap | null>(null);

  const handleMapInstance = useCallback(
    (mapInstance: LeafletMap | null) => {
      if (!mapInstance) return;
      if (mapRef.current && mapRef.current === mapInstance) return;
      mapRef.current = mapInstance;
      onMapReady?.(mapInstance);
    },
    [onMapReady],
  );

  const lastFocusRef = useRef<LatLngLiteral | null>(null);

  useEffect(() => {
    if (!focusCoordinate || !mapRef.current) return;

    if (
      lastFocusRef.current &&
      lastFocusRef.current.lat === focusCoordinate.lat &&
      lastFocusRef.current.lng === focusCoordinate.lng
    ) {
      return;
    }

    const { lat, lng } = focusCoordinate;
    mapRef.current.flyTo([lat, lng], Math.max(mapRef.current.getZoom(), 16), {
      animate: true,
      duration: 0.8,
    });

    lastFocusRef.current = focusCoordinate;
  }, [focusCoordinate]);

  const handleSearchArea = useCallback(() => {
    if (!mapRef.current || !onSearchArea) return;
    const center = mapRef.current.getCenter();
    onSearchArea({ lat: center.lat, lng: center.lng });
  }, [onSearchArea]);

  const tileUrl = mapTheme === 'dark' ? DARK_TILE_URL : STANDARD_TILE_URL;
  const tileAttribution = mapTheme === 'dark' ? DARK_ATTRIBUTION : STANDARD_ATTRIBUTION;

  return (
    <div className={`relative ${isFullscreen ? 'h-full w-full' : 'h-[480px] w-full'} rounded-2xl overflow-hidden shadow-lg bg-white/80 dark:bg-stone-900/80`}>
      <MapContainer
        center={initialCenter as LatLngExpression}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
  ref={handleMapInstance as any}
      >
  <TileLayer url={tileUrl} attribution={tileAttribution} />

  <FitBoundsController pois={pois} fitBoundsKey={fitBoundsKey} />
        <FollowUserControl position={userLocation?.position} follow={followUser} />

        {userLocation && (
          <Marker
            position={userLocation.position as LatLngExpression}
            icon={buildMarkerIcon('current', false)}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-sm">You&apos;re here</p>
                {userLocation.accuracy && (
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Accuracy ±{Math.round(userLocation.accuracy)} m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation?.accuracy && (
          <Circle
            center={userLocation.position as LatLngExpression}
            radius={Math.min(userLocation.accuracy, 120)}
            pathOptions={{
              color: markerColors.current,
              weight: 1,
              opacity: 0.4,
              fillColor: markerSecondaryColors.current,
              fillOpacity: 0.2,
            }}
          />
        )}

        {pois.map((poi) => (
          <TrackMarker
            key={`${poi.trackId}-${poi.latitude}-${poi.longitude}`}
            poi={poi}
            selected={selectedTrackId === poi.trackId}
            onSelect={onSelectTrack}
            onPlay={onPlayTrack}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 flex flex-col p-4">
        <div className="pointer-events-auto ml-auto flex flex-col space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className="backdrop-blur bg-white/80 dark:bg-stone-900/80 shadow"
            onClick={onToggleTheme}
          >
            {mapTheme === 'dark' ? (
              <>
                <HiOutlineSun className="w-4 h-4 mr-2" />
                Light Map
              </>
            ) : (
              <>
                <HiOutlineMoon className="w-4 h-4 mr-2" />
                Dark Map
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`backdrop-blur bg-white/80 dark:bg-stone-900/80 shadow ${
              followUser ? 'border border-primary-500 text-primary-600' : ''
            }`}
            onClick={() => onToggleFollowUser?.(!followUser)}
          >
            <HiOutlineRss className="w-4 h-4 mr-2" />
            Follow Me
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="backdrop-blur bg-white/80 dark:bg-stone-900/80 shadow"
            onClick={onLocateUser}
          >
            <HiOutlineSparkles className="w-4 h-4 mr-2" />
            Locate
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="backdrop-blur bg-white/80 dark:bg-stone-900/80 shadow"
            onClick={handleSearchArea}
          >
            <HiOutlineMapPin className="w-4 h-4 mr-2" />
            Search Area
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="backdrop-blur bg-white/80 dark:bg-stone-900/80 shadow"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <HiOutlineArrowsPointingIn className="w-4 h-4 mr-2" />
                Exit Fullscreen
              </>
            ) : (
              <>
                <HiOutlineArrowsPointingOut className="w-4 h-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
        </div>

        <div className="mt-auto pointer-events-auto">
          <div className="backdrop-blur bg-white/80 dark:bg-stone-900/80 rounded-2xl p-4 shadow max-w-sm">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-200">
              {loading
                ? 'Loading nearby points of interest…'
                : pois.length
                  ? `${pois.length} points ready around you`
                  : 'No POIs found in this area yet'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
