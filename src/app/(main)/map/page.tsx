'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LatLngLiteral } from 'leaflet';
import MapView, { MapPoi } from "@/components/map/MapView"
import { Badge, Button, Card, Spinner } from '@/components/ui';
import {
  useGetNearbyItinerariesQuery,
  useGetTracksByItineraryIdsQuery,
} from '@/lib/redux/api/apiSlice';
import { useSignedUrls } from '@/lib/hooks/useSignedUrls';
import { useAppDispatch, useAppSelector } from '@/lib/redux/store';
import {
  setQueue,
  setCurrentTrack,
  setCurrentQueueIndex,
  play,
} from '@/lib/redux/slices/audioSlice';
import {
  HiOutlineClock,
  HiOutlineLocationArrow,
  HiOutlineMapPin,
  HiOutlineSparkles,
} from 'react-icons/hi2';

type NearbyItinerary = {
  id: string;
  name: string;
  description: string | null;
  total_duration: number;
  min_distance_meters: number;
  poi_count: number;
  track_count: number;
  company_id: string;
};

const DEFAULT_CENTER: LatLngLiteral = { lat: 41.9028, lng: 12.4964 }; // Rome fallback
const SEARCH_RADIUS_METERS = 5000;
const FOLLOW_UPDATE_THRESHOLD_METERS = 120;

const calculateDistanceMeters = (a: LatLngLiteral, b: LatLngLiteral) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const aCalc = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c;
};

const formatDistance = (meters?: number) => {
  if (!meters || Number.isNaN(meters)) return 'Distance unavailable';
  if (meters < 1000) return `${Math.round(meters)} m away`;
  return `${(meters / 1000).toFixed(1)} km away`;
};

const formatDurationMinutes = (seconds?: number) => {
  if (!seconds || Number.isNaN(seconds)) return 'Duration unknown';
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} min tour`;
};

export default function MapPage() {
  const dispatch = useAppDispatch();
  const currentTrackId = useAppSelector((state) => state.audio.currentTrack?.id ?? null);

  const [userLocation, setUserLocation] = useState<{
    position: LatLngLiteral;
    accuracy?: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [followUser, setFollowUser] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<'standard' | 'dark'>('standard');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [queryCenter, setQueryCenter] = useState<LatLngLiteral>(DEFAULT_CENTER);
  const [fitBoundsKey, setFitBoundsKey] = useState<string>('initial');
  const [focusCoordinate, setFocusCoordinate] = useState<LatLngLiteral | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastQueryCenterRef = useRef<LatLngLiteral>(DEFAULT_CENTER);
  const followUserRef = useRef<boolean>(followUser);

  useEffect(() => {
    followUserRef.current = followUser;
  }, [followUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const hasDarkClass = document.documentElement.classList.contains('dark');
    setMapTheme(prefersDark || hasDarkClass ? 'dark' : 'standard');

    const listener = (event: MediaQueryListEvent) => {
      setMapTheme(event.matches ? 'dark' : 'standard');
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported in this browser.');
      setUserLocation({ position: DEFAULT_CENTER });
      setQueryCenter(DEFAULT_CENTER);
      setIsLocating(false);
      return;
    }

    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 10000,
    };

    const handleSuccess = (position: GeolocationPosition) => {
      const nextPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      } satisfies LatLngLiteral;

      setUserLocation({ position: nextPosition, accuracy: position.coords.accuracy });
      setIsLocating(false);

      const distance = calculateDistanceMeters(lastQueryCenterRef.current, nextPosition);
      if (followUserRef.current && distance > FOLLOW_UPDATE_THRESHOLD_METERS) {
        setQueryCenter(nextPosition);
        lastQueryCenterRef.current = nextPosition;
        setFitBoundsKey(`follow-${Date.now()}`);
      }
    };

    const handleError = (error: GeolocationPositionError) => {
      setLocationError(error.message);
      setIsLocating(false);
      if (!userLocation) {
        setUserLocation({ position: DEFAULT_CENTER });
        setQueryCenter(DEFAULT_CENTER);
      }
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, () => undefined, geolocationOptions);

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (currentTrackId) {
      setSelectedTrackId(currentTrackId);
    }
  }, [currentTrackId]);

  const {
    data: nearbyItineraries = [],
    isLoading: nearbyLoading,
    isFetching: nearbyFetching,
  } = useGetNearbyItinerariesQuery(
    {
      latitude: queryCenter.lat,
      longitude: queryCenter.lng,
      radius: SEARCH_RADIUS_METERS,
    },
    {
      skip: !queryCenter,
    },
  );

  const itineraryIds = useMemo(
    () => nearbyItineraries.map((itinerary: NearbyItinerary) => itinerary.id).filter(Boolean),
    [nearbyItineraries],
  );

  const {
    data: tracks = [],
    isLoading: tracksLoading,
    isFetching: tracksFetching,
  } = useGetTracksByItineraryIdsQuery(itineraryIds, {
    skip: itineraryIds.length === 0,
  });

  const imageKeys = useMemo(() => {
    const unique = new Set<string>();
    tracks.forEach((track: any) => {
      const key = track?.image_file?.image_storage_key;
      if (key) unique.add(key);
    });
    return Array.from(unique);
  }, [tracks]);

  const { signedUrls: signedImageUrls } = useSignedUrls(imageKeys, 'image-files');

  const orderBounds = useMemo(() => {
    const bounds = new Map<string, { first: number; last: number }>();
    tracks.forEach((track: any) => {
      const itineraryId: string | undefined = track?.audio_itinerary_id;
      if (!itineraryId) return;
      const order = track?.audio_itinerary_order ?? 0;
      const entry = bounds.get(itineraryId) ?? { first: order, last: order };
      entry.first = Math.min(entry.first, order);
      entry.last = Math.max(entry.last, order);
      bounds.set(itineraryId, entry);
    });
    return bounds;
  }, [tracks]);

  const itineraryLookup = useMemo(() => {
    const lookup = new Map<string, NearbyItinerary>();
    nearbyItineraries.forEach((itinerary: NearbyItinerary) => {
      lookup.set(itinerary.id, itinerary);
    });
    return lookup;
  }, [nearbyItineraries]);

  const pois: MapPoi[] = useMemo(() => {
    return tracks
      .filter((track: any) => track?.audio_track_poi?.latitude && track?.audio_track_poi?.longitude)
      .map((track: any) => {
        const itineraryId: string = track.audio_itinerary_id;
        const orderInfo = orderBounds.get(itineraryId);
        const isStart = orderInfo ? track.audio_itinerary_order === orderInfo.first : false;
        const isEnd = orderInfo ? track.audio_itinerary_order === orderInfo.last : false;
        const markerType = isStart ? 'start' : isEnd ? 'end' : 'poi';
        const imageKey: string | undefined = track?.image_file?.image_storage_key;

        return {
          id: `${itineraryId}-${track.id}`,
          trackId: track.id,
          itineraryId,
          itineraryName: itineraryLookup.get(itineraryId)?.name ?? 'Itinerary',
          title: track.name ?? 'Audio track',
          description: track.description,
          latitude: track.audio_track_poi.latitude,
          longitude: track.audio_track_poi.longitude,
          duration: track.duration,
          order: track.audio_itinerary_order,
          markerType,
          imageUrl: imageKey ? signedImageUrls?.[imageKey] : undefined,
        } satisfies MapPoi;
      });
  }, [tracks, orderBounds, itineraryLookup, signedImageUrls]);

  const handleSelectTrack = useCallback(
    (trackId: string) => {
      setSelectedTrackId(trackId);
      const track = tracks.find((item: any) => item.id === trackId);
      const lat = track?.audio_track_poi?.latitude;
      const lng = track?.audio_track_poi?.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        setFocusCoordinate({ lat, lng });
      }
    },
    [tracks],
  );

  const handlePlayTrack = useCallback(
    (trackId: string) => {
      const track = tracks.find((item: any) => item.id === trackId);
      if (!track) return;

      const itineraryTracks = tracks
        .filter((item: any) => item.audio_itinerary_id === track.audio_itinerary_id)
        .sort((a: any, b: any) => (a.audio_itinerary_order ?? 0) - (b.audio_itinerary_order ?? 0));

      const queueItems = itineraryTracks.map((trackItem: any, index: number) => ({
        track: trackItem,
        index,
      }));

      if (queueItems.length > 0) {
        dispatch(setQueue(queueItems as any));
        const queueIndex = itineraryTracks.findIndex((item: any) => item.id === trackId);
        dispatch(setCurrentQueueIndex(queueIndex >= 0 ? queueIndex : 0));
      }

      dispatch(setCurrentTrack({ track: track as any }));
      dispatch(play());
      setSelectedTrackId(trackId);

      const lat = track?.audio_track_poi?.latitude;
      const lng = track?.audio_track_poi?.longitude;
      if (typeof lat === 'number' && typeof lng === 'number') {
        setFocusCoordinate({ lat, lng });
      }
    },
    [dispatch, tracks],
  );

  const handleLocateUser = useCallback(() => {
    if (userLocation) {
      setFollowUser(true);
      setQueryCenter(userLocation.position);
      lastQueryCenterRef.current = userLocation.position;
      setFitBoundsKey(`locate-${Date.now()}`);
    } else if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          } satisfies LatLngLiteral;
          setUserLocation({ position: nextPosition, accuracy: position.coords.accuracy });
          setQueryCenter(nextPosition);
          lastQueryCenterRef.current = nextPosition;
          setFitBoundsKey(`locate-${Date.now()}`);
          setIsLocating(false);
        },
        (error) => {
          setLocationError(error.message);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  }, [userLocation]);

  const handleSearchArea = useCallback(
    (center: LatLngLiteral) => {
      setFollowUser(false);
      setQueryCenter(center);
      lastQueryCenterRef.current = center;
      setFitBoundsKey(`search-${Date.now()}`);
      setFocusCoordinate(center);
    },
    [],
  );

  const handleToggleTheme = useCallback(() => {
    setMapTheme((theme) => (theme === 'dark' ? 'standard' : 'dark'));
  }, []);

  const sortedItineraries = useMemo(() => {
    return [...nearbyItineraries].sort(
      (a: NearbyItinerary, b: NearbyItinerary) => a.min_distance_meters - b.min_distance_meters,
    );
  }, [nearbyItineraries]);

  const mapIsLoading = nearbyLoading || tracksLoading || isLocating;
  const mapIsFetching = nearbyFetching || tracksFetching;

  const fullscreenWrapperClass = isFullscreen
    ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-0'
    : '';

  return (
    <div className="space-y-8 pb-10">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-100">
              Explore nearby audio tours
            </h1>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Discover itineraries, points of interest, and start listening instantly.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLocateUser}>
            <HiOutlineSparkles className="w-4 h-4 mr-2" />
            Refresh location
          </Button>
        </div>

        {locationError && (
          <Card className="p-3 border border-amber-200 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-500/40">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              {locationError}. We are showing tours around Rome until location access is granted.
            </p>
          </Card>
        )}
      </section>

      <div className={fullscreenWrapperClass}>
        <div className={isFullscreen ? 'w-full h-full' : ''}>
          <MapView
            initialCenter={queryCenter}
            userLocation={userLocation || undefined}
            pois={pois}
            selectedTrackId={selectedTrackId || undefined}
            mapTheme={mapTheme}
            followUser={followUser}
            isFullscreen={isFullscreen}
            loading={mapIsLoading || mapIsFetching}
            focusCoordinate={focusCoordinate || undefined}
            onSelectTrack={handleSelectTrack}
            onPlayTrack={handlePlayTrack}
            onToggleTheme={handleToggleTheme}
            onToggleFollowUser={setFollowUser}
            onLocateUser={handleLocateUser}
            onSearchArea={handleSearchArea}
            onToggleFullscreen={() => setIsFullscreen((value) => !value)}
            fitBoundsKey={fitBoundsKey}
          />
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Nearby tours
          </h2>
          <div className="flex items-center space-x-3 text-sm text-stone-500 dark:text-stone-400">
            <HiOutlineLocationArrow className="w-4 h-4" />
            <span>
              Search radius {Math.round(SEARCH_RADIUS_METERS / 1000)} km
            </span>
            {mapIsFetching && <Spinner size="sm" />}
          </div>
        </div>

        {mapIsLoading ? (
          <Card className="p-6 flex items-center space-x-3">
            <Spinner size="sm" />
            <div>
              <p className="font-medium text-stone-800 dark:text-stone-100">Loading tours…</p>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                Fetching itineraries and points of interest around you.
              </p>
            </div>
          </Card>
        ) : sortedItineraries.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-stone-600 dark:text-stone-300">
              No itineraries found in this area yet. Try adjusting the map or search radius.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sortedItineraries.map((itinerary) => (
              <Card key={itinerary.id} className="p-4 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">
                      {itinerary.name}
                    </h3>
                    <Badge variant="secondary">{itinerary.track_count} tracks</Badge>
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                    {itinerary.description || 'Discover this audio-guided experience.'}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-stone-500 dark:text-stone-400">
                    <span className="inline-flex items-center space-x-1">
                      <HiOutlineLocationArrow className="w-4 h-4" />
                      <span>{formatDistance(itinerary.min_distance_meters)}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <HiOutlineClock className="w-4 h-4" />
                      <span>{formatDurationMinutes(itinerary.total_duration)}</span>
                    </span>
                    <span className="inline-flex items-center space-x-1">
                      <HiOutlineMapPin className="w-4 h-4" />
                      <span>{itinerary.poi_count} POIs</span>
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const itineraryPoi = pois.find((poi) => poi.itineraryId === itinerary.id);
                    if (itineraryPoi) {
                      setFitBoundsKey(`focus-${itinerary.id}-${Date.now()}`);
                      setSelectedTrackId(itineraryPoi.trackId);
                      setFocusCoordinate({
                        lat: itineraryPoi.latitude,
                        lng: itineraryPoi.longitude,
                      });
                    }
                  }}
                >
                  Focus on map
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
