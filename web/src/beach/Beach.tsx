import L, { LatLng } from "leaflet";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "../components/ui/popover";
import { renderToString } from "react-dom/server";
import { Badge } from "../components/ui/badge";
import { TriangleAlert, WavesHorizontal } from "lucide-react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import { databaseId, databases } from "../lib/appwrite-client";
import { motion } from "motion/react";
import { Query } from "appwrite";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "../components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export interface BeachInfo {
  x: number;
  y: number;
  name: string;
  id: string;
}

interface Temperature {
  temperature: number;
  measuredAt: Date;
}

const marker = (name: string, iconZoomVariant: number) => {
  // TODO: Add smooth animation instead of jumping when changing iconZoomVariant
  const html = renderToString(
    <Badge roundBottomLeftCorner={false}>
      <WavesHorizontal />
      {iconZoomVariant == IconZoomVariant.Badge && name}
    </Badge>,
  );

  return L.divIcon({
    html: html,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [0, 20],
  });
};

const chartConfig = {
  temperature: {
    label: "Temperatur",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function padWithZeroes(x: string, zeroCount: number) {
  return new Array(zeroCount - x.length).fill("0").join("") + x;
}

const IconZoomVariant = {
  TinyBadge: 0,
  Badge: 1,
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
  const [iconZoomVariant, setIconZoomVariant] = useState<number>(
    IconZoomVariant.Badge,
  );
  const [temperatures, setTemperatures] = useState<Temperature[]>([]);
  const [fetchDone, setFetchDone] = useState<boolean>(false);
  const [hovering, setHovering] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);
  const hoursScinceLatestTemperature: number | undefined =
    temperatures.length > 0
      ? (new Date().getTime() -
          temperatures[temperatures.length - 1].measuredAt.getTime()) /
        (60 * 60 * 1000)
      : undefined;
  const showBadTeremometerAlert =
    hoursScinceLatestTemperature && hoursScinceLatestTemperature > 5;

  const map = useMapEvents({
    zoom() {
      if (map.getZoom() < 11.5) {
        setIconZoomVariant(IconZoomVariant.TinyBadge);
      } else {
        setIconZoomVariant(IconZoomVariant.Badge);
      }
    },
  });

  useEffect(() => {
    const effect = async () => {
      if ((hovering || isOpen) && temperatures.length == 0 && !fetching) {
        setFetching(true);
        setTemperatures([
          ...(
            await databases.listRows({
              databaseId,
              tableId: "temepratures",
              queries: [
                Query.greaterThan(
                  "measuredAt",
                  new Date(
                    new Date().getTime() - 24 * 60 * 60 * 1000,
                  ).toISOString(), // Query temperature the last 24 hours
                ),
                Query.equal("beaches", beach.id),
              ],
            })
          ).rows.map((row) => {
            return {
              temperature: row.temperature,
              measuredAt: new Date(row.measuredAt),
            };
          }),
        ]);
        setFetchDone(true);
      }
    };

    effect();
  }, [isOpen, temperatures, beach, hovering, fetching]);

  return (
    <Marker
      position={new LatLng(beach.y, beach.x)}
      icon={marker(beach.name, iconZoomVariant)}
      eventHandlers={{
        click: () => {
          open();
        },
        mouseover: () => {
          setHovering(true); // Preload when hovering like next.js does
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
        <Popover open={isOpen && fetchDone} onOpenChange={() => {}}>
          <PopoverAnchor className="w-0 h-0 absolute" />

          <PopoverContent
            onInteractOutside={close}
            className="w-[75vw] max-w-150 z-800"
          >
            {temperatures.length > 0 ? (
              <motion.div layout key={"beachTempMain"}>
                <div className="py-3 md:py-4">
                  <h1 className="scroll-m-20 text-center text-3xl md:text-5xl font-extrabold tracking-tight text-balance">
                    {temperatures[temperatures.length - 1].temperature}°C
                  </h1>
                  {!showBadTeremometerAlert && (
                    <p className="leading-7 text-center px-5">
                      {beach.name} -{" "}
                      {hoursScinceLatestTemperature! < 1
                        ? "Precis nyss"
                        : `För ${Math.floor(hoursScinceLatestTemperature!)} ${Math.floor(hoursScinceLatestTemperature!) == 1 ? "timme" : "timmar"} sedan`}
                    </p>
                  )}
                </div>

                {showBadTeremometerAlert && (
                  <Alert variant="default">
                    <TriangleAlert />
                    <AlertTitle>Dålig termometer</AlertTitle>
                    <AlertDescription>
                      Temperaturen mättes cirka{" "}
                      {Math.floor(hoursScinceLatestTemperature!)} timmar sedan
                    </AlertDescription>
                  </Alert>
                )}
                <ChartContainer
                  config={chartConfig}
                  className="min-h-50 w-full h-full"
                >
                  <LineChart
                    accessibilityLayer
                    data={temperatures}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />

                    <XAxis
                      dataKey="measuredAt"
                      scale="time"
                      type="number"
                      domain={[
                        new Date().getTime() - 24 * 60 * 60 * 1000,
                        new Date().getTime(),
                      ]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value: number) =>
                        `${padWithZeroes(new Date(value).getHours().toString(), 2)}:${padWithZeroes(new Date(value).getMinutes().toString(), 2)}`
                      }
                    />

                    <YAxis domain={["auto", "auto"]} hide />

                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />

                    <Line
                      dataKey="temperature"
                      type="natural"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </motion.div>
            ) : (
              <motion.div
                layout
                animate={{ height: "auto" }}
                className="overflow-hidden"
                key={"badterm"}
              >
                <Alert variant="default">
                  <TriangleAlert />
                  <AlertTitle>Dålig termometer</AlertTitle>
                  <AlertDescription>
                    Ingen temperatur har rapporterats de senaste 24 timmarna.
                    Badplatsen kommer att tas bort om inga nya temperaturer
                    kommer på en vecka.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </PopoverContent>
        </Popover>
      </Popup>
    </Marker>
  );
}

export default Beach;
