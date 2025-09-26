import { Client, Databases, ID, Query } from 'appwrite';

const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;
const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT as string;

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const databases = new Databases(client);
const accounts = new Databases(client);

export { databases, accounts, ID, Query };
