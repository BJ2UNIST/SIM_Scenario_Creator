import { Signal } from "@/server/models/tss.model";

export default defineEventHandler(async (event) => {
  const nodeId = event.context.params?.nodeId;

  const query = getQuery(event);

  const mapId = query?.mapId;

  return Signal.findOne({ mapId: mapId, nodeId });
});
