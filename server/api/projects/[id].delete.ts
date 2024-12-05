import path from "path";

import { Edge } from "@/server/models/edge.model";
import { Node } from "@/server/models/node.model";
import { Connection } from "@/server/models/connection.model";
import { Signal } from "@/server/models/tss.model";
import { rm } from "node:fs/promises";

import { Project } from "@/server/models/project.model";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const projectId = event.context.params?.id || "";

  await Project.deleteOne({ projectId: projectId });

  // need to delete from mongodb
  // need to delete from filesystem

  await Node.deleteMany({ projectId: projectId });
  await Edge.deleteMany({ projectId: projectId });
  await Connection.deleteMany({ projectId: projectId });
  await Signal.deleteMany({ projectId: projectId });

  const dir = path.join(config.fileStorageMount, projectId);

  await rm(dir, { recursive: true, force: true });

  return {
    success: true,
    projectId,
  };
});
