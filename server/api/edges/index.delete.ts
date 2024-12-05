import { Edge } from "@/server/models/edge.model";

export default defineEventHandler(async (event) => {
  // const mapId = event.context.params?.id;
  const query = getQuery(event);

  const { mapId, projectId, envId } = query;

  // const mapId = getQuery(event).mapId;
  await Edge.deleteMany({
    mapId: mapId,
    projectId: projectId,
    envId: envId,
  });
  console.log("delete edges for mapId", mapId);

  return {
    success: true,
    mapId,
  };
});
