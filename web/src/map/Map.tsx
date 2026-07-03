import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { latLng, LatLng, latLngBounds, LatLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { databaseId, databases } from "../lib/appwrite-client";
import Beach, { type BeachInfo } from "../beach/Beach";

function Map() {
  const [beaches, setBeaches] = useState<BeachInfo[]>([]);
  const [openBeach, setOpenBeach] = useState<string | null>(null);

  useEffect(() => {
    const effect = async () => {
      const newBeaches = await databases.listRows({
        databaseId,
        tableId: "beaches",
      });

      setBeaches(
        newBeaches.rows.map((row) => {
          return { x: row.x, y: row.y, name: row.name, id: row.$id }; // TODO: Adjust the positions? They are a bit off right now.
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
        zoom={11}
        style={{ height: "100%", width: "100%" }}
        minZoom={10}
        maxBoundsViscosity={1}
        maxBounds={latLngBounds(
          latLng(57.94959931937716, 15.383925),
          latLng(58.616927, 16.096536),
        )}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {beaches.map((beach) => (
          <Beach
            beach={beach}
            key={beach.id}
            isOpen={openBeach == beach.id}
            open={() => setOpenBeach(beach.id)}
            close={() => setOpenBeach(null)}
          />
        ))}
      </MapContainer>
      <div className="absolute top-0 left-0 p-2"></div>
    </div>
  );
}

export default Map;
