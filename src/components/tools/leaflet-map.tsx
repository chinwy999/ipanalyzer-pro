"use client";

import "leaflet/dist/leaflet.css";
import { divIcon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

const pin = divIcon({
  className: "ip-map-pin",
  html: '<span style="display:block;width:18px;height:18px;border:4px solid #fff;border-radius:50%;background:#6487ff;box-shadow:0 0 0 8px rgba(100,135,255,.2),0 2px 12px rgba(0,0,0,.3)"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function LeafletMap({ latitude, longitude, label }: { latitude: number; longitude: number; label: string }) {
  return (
    <MapContainer key={`${latitude},${longitude}`} center={[latitude, longitude]} zoom={6} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[latitude, longitude]} icon={pin}><Popup>{label}<br />{latitude.toFixed(4)}, {longitude.toFixed(4)}</Popup></Marker>
    </MapContainer>
  );
}
