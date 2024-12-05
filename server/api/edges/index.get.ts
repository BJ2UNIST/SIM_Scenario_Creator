import { Edge } from "@/server/models/edge.model";

export default defineEventHandler(async (event) => {
  const edges = await Edge.find();
  return edges;
});
