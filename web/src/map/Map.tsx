import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLng } from "leaflet";

// Fix marker icon
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useState } from "react";
import { databaseId, databases } from "../lib/appwrite-client";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Beach {
  x: number;
  y: number;
  name: string;
  id: string;
}

export function Map() {
  const [beaches, setBeaches] = useState<Beach[]>([]);

  useEffect(() => {
    const effect = async () => {
      const newBeaches = await databases.listRows({
        databaseId,
        tableId: "beaches",
      });

      setBeaches(
        newBeaches.rows.map((row) => {
          return { x: row.x, y: row.y, name: row.name, id: row.$id };
        }),
      );
    };

    effect();
  }, []);

  return (
    <div className="h-screen relative">
      {/* Leaflet does not like flexbox here, set fixed height instead */}
      <MapContainer
        center={new LatLng(58.41086, 15.62157)}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {beaches.map((beach) => (
          <Marker position={new LatLng(beach.y, beach.x)} key={beach.id}>
            <Popup>{beach.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute top-0 left-0 p-2" style={{ zIndex: 500 }}></div>
    </div>
  );
}
