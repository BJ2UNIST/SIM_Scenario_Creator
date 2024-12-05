import { Map } from "@/server/models/map.model";

export default defineEventHandler(async (event) => {
  const maps = await Map.find();
  return maps;
});
