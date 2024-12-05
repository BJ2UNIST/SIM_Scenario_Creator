import { Node } from "@/server/models/node.model";

export default defineEventHandler(async (event) => {
  const mapId = event.context.params?.id;
  const envId = getQuery(event).envId;

  return Node.find({
    mapId,
    envId,
  });
});
