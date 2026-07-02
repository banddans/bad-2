import { Client, Account, Databases } from "appwrite";

export const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("6a4560470013afa2043a");

export const account = new Account(client);
export const databases = new Databases(client);
