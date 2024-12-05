import { Node } from "@/server/models/node.model";

export default defineEventHandler(async (event) => {
  const maps = await Node.find();
  return maps;
});
