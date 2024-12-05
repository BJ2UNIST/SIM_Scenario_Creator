import { Project } from "@/server/models/project.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  await Project.create({
    ...body,
    created: new Date(),
  });

  return {
    success: true,
  };
});
