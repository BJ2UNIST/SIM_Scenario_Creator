import mongoose from "mongoose";

import { Edge } from "../server/models/edge.model";
import { Node } from "../server/models/node.model";

import { generate } from "./generate";

// 테스트용 파일
// const geoJsonEdges: GeoJson = require("../volume/data/edges.json");
// const geoJsonNodes: GeoJson = require("../volume/data/nodes.json");

async function main() {
  const mapId = "map1";
  const projectId = null;
  const envId = null;

  await mongoose.connect("mongodb://127.0.0.1:27017/sss");

  const edges = await Edge.find({ mapId: mapId, projectId, envId });
  const nodes = await Node.find({ mapId: mapId, projectId, envId });
  console.log("edges", edges.length);
  console.log("** 커넥션 생성 시작 **");
  const startTime = Date.now();

  // await generate(mapId, nodes.slice(0, 1), edges);
  await generate({ mapId, projectId, envId }, nodes, edges);

  console.log("** 커넥션 생성 완료 **");
  console.log("elapsed time:", Date.now() - startTime, "ms");

  process.exit(0);
}

function printConsole(nodeId: string, connections: any[]) {
  console.log(`${nodeId} connection generated`);
  connections.forEach((connection) => {
    const { from, to, fromLane, toLane } = connection;
    console.log(`${from} ${fromLane} -> ${to} ${toLane}`);
  });
}

main();
