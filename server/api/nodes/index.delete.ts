import { Node } from "@/server/models/node.model";

export default defineEventHandler(async (event) => {
  // const mapId = event.context.params?.id;

  const query = getQuery(event);

  const { mapId, projectId, envId } = query;

  // const mapId = getQuery(event).mapId;
  await Node.deleteMany({
    mapId: mapId,
    projectId: projectId,
    envId: envId,
  });
  console.log("delete nodes for mapId", mapId);
  return {
    success: true,
    mapId,
  };
});
