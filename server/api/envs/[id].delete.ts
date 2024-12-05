import path from "path";

import { Edge } from "@/server/models/edge.model";
import { Node } from "@/server/models/node.model";
import { Connection } from "@/server/models/connection.model";
import { rm } from "node:fs/promises";

import { Env } from "~/server/models/env.model";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const envId = event.context.params?.id || "";

  await Env.deleteOne({ envId: envId });

  // need to delete from mongodb
  // need to delete from filesystem

  // await Node.deleteMany({ workspaceId: workspaceId });
  // await Edge.deleteMany({ workspaceId: workspaceId });
  // await Connection.deleteMany({ workspaceId: workspaceId });

  // const dir = path.join(config.fileStorageMount, workspaceId);

  // await rm(dir, { recursive: true, force: true });

  return {
    success: true,
    envId: envId,
  };
});
