import { Client, ID, Query, TablesDB } from "node-appwrite";
import axios from "axios";

interface BeachInfo {
  id: string;
  name: string;
  temperature: {
    temperature: number;
    observed: string; // strings in ISO 8601-format for dates
    updated: string;
  };
  coordinates: {
    x: number;
    y: number;
  };
}

const fetchLinkopingTemperatures = async ({ res, log, error }: any) => {
  // Check if the .env is configured correctly
  if (!process.env.APPWRITE_KEY) {
    const message = "No APPWRITE_KEY variable found in .env!";
    error(message);
    return res.json({ success: false, error: message });
  }

  // Connect to appwrite
  log("Creating client...");
  const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a4560470013afa2043a")
    .setKey(process.env.APPWRITE_KEY);

  log("Connecting to database...");
  const db = new TablesDB(client);
  const databaseId = "6a460878002fc6ccaaca";

  // Fetch temperatures from Linköping API
  let response;

  log("Fetching temperatures...");
  try {
    response = await axios.get(
      "https://waterqualityobserved.linkoping.se/api/v1/WaterTemperature",
      {
        timeout: 5000,
      },
    );
  } catch (axiosError) {
    error("Failed to fetch beach data!");
    error(axiosError);
    return res.json({ success: false, error: axiosError });
  }

  // Iterate through all beaches in parallel to speed up database queries
  await Promise.all(
    response.data.map((beachInfo: BeachInfo) => {
      return new Promise<void>((resolve) => {
        const iterator = async () => {
          // Two beaches have broken teremometers that haven't reported temperature for ages, ignore then
          if (
            new Date().getTime() -
              new Date(beachInfo.temperature.observed).getTime() >
            7 * 24 * 60 * 60 * 1000
          ) {
            return;
          }

          // There is a duplicate of Sandvik Roxen, ignore one of them
          if (beachInfo.id == "00080e39-fd89-4784-aa48-bcb15e91f4da") {
            return;
          }

          const beaches = await db.listRows({
            databaseId,
            tableId: "beaches",
            queries: [Query.equal("$id", beachInfo.id)],
          });

          if (beaches.total == 0) {
            log(`${beachInfo.name} is not in beaches table, adding!`);
            // Add the beach if it doesn't exist in our table
            db.createRow({
              databaseId,
              tableId: "beaches",
              rowId: beachInfo.id,
              data: {
                name: beachInfo.name,
                x: beachInfo.coordinates.x,
                y: beachInfo.coordinates.y,
              },
            });
          }

          // TODO: Remove beaches that disappeared from the lsit

          const existingTemperatures = await db.listRows({
            databaseId,
            tableId: "temepratures", // I know this is a typo, sadly you can't rename appwrite tables and I'm to lazy to delete it and cerate a new one
            queries: [
              Query.equal("measuredAt", beachInfo.temperature.observed),
            ],
          });

          // Add the current temperature to the table if we haven't already recorded it
          if (existingTemperatures.total == 0) {
            log(
              `${beachInfo.name} got a temperature update: ${beachInfo.temperature.temperature}`,
            );

            await db.createRow({
              databaseId,
              tableId: "temepratures",
              rowId: ID.unique(),
              data: {
                temperature: beachInfo.temperature.temperature,
                measuredAt: beachInfo.temperature.observed,
                beaches: beachInfo.id,
              },
            });
          }
        };

        iterator().then(resolve);
      });
    }),
  );

  return res.json({ success: true });
};

export default fetchLinkopingTemperatures;
