import { Map } from "@/server/models/map.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  await Map.create({
    ...body,
    created: new Date(),
  });

  return {
    success: true,
  };
});
