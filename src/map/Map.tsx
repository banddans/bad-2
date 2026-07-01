import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix för att markör-ikonen ibland inte laddas korrekt i React/Webpack
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Button } from "../components/ui/button";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export function Map() {
  // Koordinater för Stockholm [breddgrad, längdgrad]
  const position = new L.LatLng(58.120948, 15.444215);

  return (
    <div className="h-screen relative">
      {/* Leaflet does not like flexbox here, set fixed height instead */}
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {/* En valfri markör på kartan */}
        <Marker position={position}>
          <Popup>Test</Popup>
        </Marker>
      </MapContainer>
      <div className="absolute top-0 left-0 p-2" style={{ zIndex: 500 }}></div>
    </div>
  );
}
