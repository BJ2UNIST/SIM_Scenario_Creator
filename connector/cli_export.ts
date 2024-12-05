import mongoose from "mongoose";

import { Edge } from "../server/models/edge.model";
import { Node } from "../server/models/node.model";
import { Connection } from "../server/models/connection.model";
import { Signal } from "../server/models/tss.model";

import {
  exportEdges,
  exportNodes,
  exportConnections,
  exportSignals,
} from "./export";

async function connect(): Promise<typeof mongoose> {
  return mongoose.connect("mongodb://127.0.0.1:27017/sss");
}

async function main() {
  await connect();

  const mapId = "map1";

  let edges = await Edge.find({ mapId: mapId });
  let nodes = await Node.find({ mapId: mapId });
  let connections = await Connection.find({ mapId: mapId });
  let signals = await Signal.find({ mapId: mapId });

  edges = edges.slice(0, 2);
  nodes = nodes.slice(0, 2);
  connections = connections.slice(0, 2);
  signals = signals.slice(0, 2);

  const v1 = exportEdges(edges);
  const v2 = exportNodes(nodes);
  const v3 = exportConnections(connections);
  const v4 = exportSignals(signals);

  console.log(v1);
  console.log(v2);
  console.log(v3);
  console.log(v4);

  process.exit(0);
}

main();
