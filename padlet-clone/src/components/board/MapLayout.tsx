"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { ClientBoard, ClientPost } from "@/lib/boardTypes";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:28px;line-height:28px">📍</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28]
});

function ClickToAdd({ onAddAt }: { onAddAt: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const target = (e.originalEvent?.target as HTMLElement | undefined) || null;
      if (target?.closest(".leaflet-marker-icon, .leaflet-popup, .leaflet-control")) return;
      onAddAt(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function MapLayout({
  board,
  onOpen,
  onAddAt
}: {
  board: ClientBoard;
  onOpen: (post: ClientPost) => void;
  onAddAt: (lat: number, lng: number) => void;
}) {
  const pins = board.posts.filter((p) => typeof p.lat === "number" && typeof p.lng === "number");
  const center: [number, number] = pins.length ? [pins[0].lat as number, pins[0].lng as number] : [20, 0];

  return (
    <div className="h-[70vh] w-full overflow-hidden rounded-xl shadow">
      <MapContainer center={center} zoom={pins.length ? 3 : 2} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToAdd onAddAt={onAddAt} />
        {pins.map((p) => (
          <Marker key={p.id} position={[p.lat as number, p.lng as number]} icon={pinIcon}>
            <Popup>
              <div className="min-w-[140px]">
                <div className="font-semibold text-gray-900">{p.subject || "Untitled"}</div>
                {p.body && <div className="mt-0.5 text-sm text-gray-600">{p.body}</div>}
                <button onClick={() => onOpen(p)} className="mt-2 text-sm font-medium text-brand-600 hover:underline">
                  Open post →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
