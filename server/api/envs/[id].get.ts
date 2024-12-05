import { Env } from "~/server/models/env.model";

export default defineEventHandler(async (event) => {
  const envId = event.context.params?.id || "";

  return Env.findOne({ envId });
});
