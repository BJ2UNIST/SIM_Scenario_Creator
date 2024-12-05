import { Node } from "@/server/models/node.model";

export default defineEventHandler(async (event) => {
  const mapId = event.context.params?.id;

  await Node.deleteMany({ mapId: mapId });

  return {
    success: true,
    mapId,
  };
});
