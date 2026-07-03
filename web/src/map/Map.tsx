import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { latLng, LatLng, latLngBounds } from "leaflet";
import { useEffect, useState } from "react";
import { databaseId, databases } from "../lib/appwrite-client";
import Beach, { type BeachInfo } from "../beach/Beach";
import { Button } from "@/components/ui/button";
import { Copyright, MinusIcon, PlusIcon } from "lucide-react";
import Github from "@/assets/github.svg?react";
import LegalDialog from "@/Legal";
import { ButtonGroup } from "@/components/ui/button-group";

function MapUtilityControls() {
  const [isLegalDialogOpen, setIsLegalDialogOpen] = useState<boolean>(false);
  const map = useMap();

  return (
    <>
      <LegalDialog
        isOpen={isLegalDialogOpen}
        setIsDialogOpen={setIsLegalDialogOpen}
      />
      <div className="absolute top-0 left-0 p-2 z-800">
        <div className="flex flex-col gap-1">
          <ButtonGroup>
            <Button size={"icon-lg"} onClick={() => map.zoomIn()}>
              <PlusIcon />
            </Button>
            <Button size={"icon-lg"} onClick={() => map.zoomOut()}>
              <MinusIcon />
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 p-2 z-800">
        <ButtonGroup>
          <Button
            size={"icon-sm"}
            variant={"outline"}
            onClick={() => setIsLegalDialogOpen(true)}
          >
            <Copyright />
          </Button>
          <Button
            size={"icon-sm"}
            variant={"outline"}
            onClick={() => {
              window.open("https://github.com/banddans/bad-2", "_blank");
            }}
          >
            <Github />
          </Button>
        </ButtonGroup>
      </div>
    </>
  );
}

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
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {beaches.map((beach) => (
          <Beach
            beach={beach}
            key={beach.id}
            isOpen={openBeach == beach.id}
            open={() => setOpenBeach(beach.id)}
            close={() => setOpenBeach(null)}
          />
        ))}

        <MapUtilityControls />
      </MapContainer>
    </div>
  );
}

export default Map;
