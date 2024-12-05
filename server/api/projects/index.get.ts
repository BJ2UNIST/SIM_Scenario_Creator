import { Project } from "@/server/models/project.model";

export default defineEventHandler(async (event) => {
  const projects = await Project.find();
  return projects;
});
