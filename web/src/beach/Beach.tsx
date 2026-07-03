import L, { LatLng } from "leaflet";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "../components/ui/popover";
import { renderToString } from "react-dom/server";
import { Badge } from "../components/ui/badge";
import { TriangleAlert, WavesHorizontal } from "lucide-react";
import { Marker, Popup } from "react-leaflet";
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
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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

const chartConfig = {
  temperature: {
    label: "Temperatur",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function padWithZeroes(x: string, zeroCount: number) {
  return new Array(zeroCount - x.length).fill("0").join("") + x;
}

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
  const [temperatures, setTemperatures] = useState<Temperature[]>([]);
  const [fetchDone, setFetchDone] = useState<boolean>(false);
  const [hovering, setHovering] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    const effect = async () => {
      if ((hovering || isOpen) && temperatures.length == 0 && !fetching) {
        setFetching(true);
        setTemperatures(
          (
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
        );
        setFetchDone(true);
      }
    };

    effect();
  }, [isOpen, temperatures, beach, hovering, fetching]);

  return (
    <Marker
      position={new LatLng(beach.y, beach.x)}
      icon={marker(beach.name)}
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
            className="w-[75vw] max-w-150"
          >
            {temperatures.length > 0 ? (
              <motion.div layout key={"beachTempMain"}>
                <h1 className="scroll-m-20 text-center text-3xl md:text-5xl font-extrabold tracking-tight text-balance py-2 md:py-4">
                  {temperatures[temperatures.length - 1].temperature}°C
                </h1>

                <Alert variant="default">
                  <TriangleAlert />
                  <AlertTitle>Dålig termometer</AlertTitle>
                  <AlertDescription>
                    Temperaturen mättes cirka 5 timmar sedan
                  </AlertDescription>
                </Alert>
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
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value: Date) =>
                        `${padWithZeroes(value.getHours().toString(), 2)}:${padWithZeroes(value.getMinutes().toString(), 2)}`
                      }
                    />

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
            ) : fetchDone ? (
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
                    Ingen temperatur har rapporterats de senaste 24 timmarna
                  </AlertDescription>
                </Alert>
              </motion.div>
            ) : (
              <motion.div layout>
                <div className="h-[340px] m:h-[468px]"></div>
              </motion.div>
            )}
          </PopoverContent>
        </Popover>
      </Popup>
    </Marker>
  );
}

export default Beach;
