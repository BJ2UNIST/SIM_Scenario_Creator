import { Edge } from "@/server/models/edge.model";

export default defineEventHandler(async (event) => {
  const mapId = event.context.params?.id;

  await Edge.deleteMany({ mapId: mapId });

  return {
    success: true,
    mapId,
  };
});
