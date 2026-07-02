import { Client, Account, TablesDB } from "appwrite";

export const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6a4560470013afa2043a");

export const account = new Account(client);
export const databases = new TablesDB(client);
export const databaseId = "6a460878002fc6ccaaca";
