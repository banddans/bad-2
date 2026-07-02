import L, { LatLng } from "leaflet";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "../components/ui/popover";
import { renderToString } from "react-dom/server";
import { Badge } from "../components/ui/badge";
import { WavesHorizontal } from "lucide-react";
import { Marker, Popup } from "react-leaflet";

export interface BeachInfo {
  x: number;
  y: number;
  name: string;
  id: string;
}

const marker = (name: string) => {
  const html = renderToString(
    <Badge roundBottomLeftCorner={false}>
      <WavesHorizontal />
      {name}
    </Badge>,
  );

  return L.divIcon({
    html: html,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [0, 20],
  });
};

function Beach({
  beach,
  isOpen,
  open,
  close,
}: {
  beach: BeachInfo;
  isOpen: boolean;
  open: () => void;
  close: () => void;
}) {
  return (
    <Marker
      position={new LatLng(beach.y, beach.x)}
      icon={marker(beach.name)}
      eventHandlers={{
        click: () => {
          open();
        },
      }}
    >
      <Popup
        closeButton={false}
        className="custom-invisible-popup"
        eventHandlers={{
          remove: close,
        }}
      >
        <Popover open={isOpen} onOpenChange={() => {}}>
          <PopoverAnchor className="w-0 h-0 absolute" />

          <PopoverContent className="w-64 z-2000" onInteractOutside={close}>
            <div className="p-2">
              <h3 className="font-bold">Popup!</h3>
            </div>
          </PopoverContent>
        </Popover>
      </Popup>
    </Marker>
  );
}

export default Beach;
