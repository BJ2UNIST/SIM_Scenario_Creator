import { Edge } from "@/server/models/edge.model";

export default defineEventHandler(async (event) => {
  const mapId = event.context.params?.id;
  const envId = getQuery(event).envId;
  return Edge.find({
    mapId,
    envId,
  });
});
