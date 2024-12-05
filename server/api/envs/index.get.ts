import { Env } from "~/server/models/env.model";

export default defineEventHandler(async (event) => {
  const projectId = getQuery(event).projectId;

  const envs = await Env.find({
    projectId,
  });
  return envs;
});
