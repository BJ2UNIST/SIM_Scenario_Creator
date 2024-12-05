import { Env } from "~/server/models/env.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  await Env.create({
    ...body,
    created: new Date(),
  });

  return {
    success: true,
  };
});
