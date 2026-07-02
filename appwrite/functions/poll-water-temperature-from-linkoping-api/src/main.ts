import { Client, Query, TablesDB } from "node-appwrite";
import axios from "axios";
import { APPWRITE_KEY } from "./secrets";

interface Beach {
  id: string;
  name: string;
  temperature: {
    temperature: number;
    observed: Date;
    updated: Date;
  };
  coordinates: {
    x: number;
    y: number;
  };
}

const fetchLinkopingTemperatures = async ({ res, log, error }: any) => {
  // Check if the .env is configured correctly
  // TODO: Use proper .env variables when deploying
  /*if (!process.env.APPWRITE_KEY) {
    const message = "No APPWRITE_KEY variable found in .env!";
    error(message);
    return res.json({ success: false, error: message });
  }*/

  // Connect to appwrite
  log("Creating client...");
  const client = new Client()
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("6a4560470013afa2043a")
    .setKey(APPWRITE_KEY);

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
  Promise.all(
    response.data.map((beach: Beach) => {
      return new Promise<void>((resolve) => {
        const iterator = async () => {
          const dbBeach = await db.listRows({
            databaseId,
            tableId: "beaches",
            queries: [Query.equal("id", beach.id)],
          });

          if (dbBeach.total == 0) {
            log(`${beach.name} is not in beaches table, adding!`);
            // Add the beach if it doesn't exist in our table
            db.createRow({
              databaseId,
              tableId: "beaches",
              rowId: beach.id,
              data: {
                name: beach.name,
                x: beach.coordinates.x,
                y: beach.coordinates.y,
              },
            });
          }

          // TODO: Remove beaches that disappeared from the lsit
        };

        iterator().then(resolve);
      });
    }),
  );

  return res.json({ success: true });
};

export default fetchLinkopingTemperatures;
