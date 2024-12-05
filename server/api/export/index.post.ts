import path from "path";
import fs from "fs";
import JSZip from "jszip";

import { Edge } from "@/server/models/edge.model";
import { Node } from "@/server/models/node.model";
import { Connection } from "@/server/models/connection.model";
import { Signal } from "@/server/models/tss.model";

import {
  exportEdges,
  exportNodes,
  exportConnections,
  exportSignals,
} from "@/connector/export";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { mapId } = body;

  let edges = await Edge.find({ mapId: mapId });
  let nodes = await Node.find({ mapId: mapId });
  let connections = await Connection.find({ mapId: mapId });
  let signals = await Signal.find({ mapId: mapId });

  edges = edges.slice(0, 2);
  nodes = nodes.slice(0, 2);
  connections = connections.slice(0, 2);
  signals = signals.slice(0, 2);

  const xmlEdge = exportEdges(edges);
  const xmlNode = exportNodes(nodes);
  const xmlConnection = exportConnections(connections);
  const xmlTss = exportSignals(signals);

  const config = useRuntimeConfig();
  const dir = path.join(config.fileStorageMount, mapId);

  const edgePath = path.join(dir, "edge.xml");
  const nodePath = path.join(dir, "node.xml");
  const connectionPath = path.join(dir, "connection.xml");
  const tssPath = path.join(dir, "tss.xml");

  await write(edgePath, xmlEdge);
  await write(nodePath, xmlNode);
  await write(connectionPath, xmlConnection);
  await write(tssPath, xmlTss);

  const zip = new JSZip();

  // 압축할 파일들의 경로
  const filePaths = [edgePath, nodePath, connectionPath, tssPath];

  // 각 파일을 ZIP에 추가
  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    const fileContent = await fs.promises.readFile(filePath);
    zip.file(fileName, fileContent);
  }

  // ZIP 생성
  const zipContent = await zip.generateAsync({ type: "nodebuffer" });

  // 응답 헤더 설정
  setResponseHeaders(event, {
    "Content-Type": "application/zip",
    "Content-Disposition": 'attachment; filename="env.zip"',
  });

  // 파일 내용 반환
  return zipContent;
});

async function write(path: string, data: string) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
}
