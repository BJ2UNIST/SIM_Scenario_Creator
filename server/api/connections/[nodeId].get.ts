import { Connection } from "@/server/models/connection.model";

export default defineEventHandler(async (event) => {
  const nodeId = event.context.params?.nodeId;
  const query = getQuery(event);

  const mapId = query?.mapId;
  const projectId = query?.projectId;
  const envId = query?.envId;

  console.log({
    mapId,
    projectId,
    envId,
    nodeId,
  });

  const result = await Connection.findOne({
    mapId: mapId,
    projectId,
    envId,
    nodeId: nodeId,
  })
    .populate("connections")
    .exec();

  return result;
});
