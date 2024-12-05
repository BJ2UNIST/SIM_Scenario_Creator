import path from "path";

import { Edge } from "@/server/models/edge.model";
import { Node } from "@/server/models/node.model";
import { Connection } from "@/server/models/connection.model";
import { Signal } from "@/server/models/tss.model";
import { rm } from "node:fs/promises";

import { Map } from "@/server/models/map.model";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const mapId = event.context.params?.id || "";

  await Map.deleteOne({ mapId: mapId });

  // need to delete from mongodb
  // need to delete from filesystem

  await Node.deleteMany({ mapId: mapId });
  await Edge.deleteMany({ mapId: mapId });
  await Connection.deleteMany({ mapId: mapId });
  await Signal.deleteMany({ mapId: mapId });

  const dir = path.join(config.fileStorageMount, mapId);

  await rm(dir, { recursive: true, force: true });

  return {
    success: true,
    mapId,
  };
});
