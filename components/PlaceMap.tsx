'use client';

import { useEffect } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [-11.0, 95.0],
  [6.5, 141.0],
];

const markerIcon = new L.Icon({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FlyToPosition({
  center,
  position,
}: {
  center: [number, number];
  position: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
    } else {
      map.flyTo(center, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [position, center, map]);

  return null;
}

function LocationPicker({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface PlaceMapProps {
  center: [number, number];
  position: [number, number] | null;
  onSelect: (lat: number, lng: number) => void;
}

export default function PlaceMap({
  center,
  position,
  onSelect,
}: PlaceMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={13}
      maxBounds={INDONESIA_BOUNDS}
      scrollWheelZoom
      className="z-0 h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToPosition center={center} position={position} />

      <LocationPicker onSelect={onSelect} />

      {position && <Marker position={position} icon={markerIcon} />}
    </MapContainer>
  );
}
