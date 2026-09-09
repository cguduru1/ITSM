import { closeDatabase } from "./setupMongo.mjs";

export default async function() {
  await closeDatabase();
}
