import mongoose from "mongoose";

import path from "path";

import unzipper from "unzipper";

import { read } from "../utils/shp";
import { insertBulk } from "../utils/mongo";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  const { mapId, files } = await readBody<{
    files: File[];
    mapId: string;
    projectId: string;
  }>(event);

  if (files.length > 1) {
    throw createError({
      statusCode: 400,
      message: "파일은 2개 이상 업로드 할 수 없습니다.",
      statusMessage: "Bad Request",
    });
  }

  const fileNames = [];

  // 프로젝트 아이디 단위로 파일을 저장한다.
  // shp, dbf 만 지원한다.
  for (const file of files) {
    await storeFileLocally(
      file, // the file object
      file.name.substring(0, file.name.lastIndexOf(".")), // you can add a name for the file or length of Unique ID that will be automatically generated!
      "/" + mapId // 파일저장 경로
    );
    fileNames.push(file.name);
  }

  const dir = path.join(config.fileStorageMount, mapId);

  const zipFilePath = path.join(dir, fileNames[0]);

  const directory = await unzipper.Open.file(zipFilePath);

  await directory.extract({ path: dir });

  const filesExtracted = directory.files.map((file: any) => file.path);

  const isNode = (text: string) =>
    text.startsWith("NODE") || text.startsWith("node");
  const isLink = (text: string) =>
    text.startsWith("LINK") || text.startsWith("link");

  const nodeShp = filesExtracted.find(
    (file: any) => isNode(file) && file.includes(".shp")
  );
  const nodeDbf = filesExtracted.find(
    (file: any) => isNode(file) && file.includes(".dbf")
  );
  const linkShp = filesExtracted.find(
    (file: any) => isLink(file) && file.includes(".shp")
  );
  const linkDbf = filesExtracted.find(
    (file: any) => isLink(file) && file.includes(".dbf")
  );

  await insert(mapId, "nodes", "NODE_ID", nodeShp, nodeDbf, dir);
  await insert(mapId, "edges", "LINK_ID", linkShp, linkDbf, dir);

  return {
    success: true,
  };
});

async function insert(
  mapId: string,
  collectionName: string,
  idKey: string,
  shp: string,
  dbf: string,
  dir: string
) {
  const geoJson = await read(
    `${dir}/${shp}`, // must be 'shp' file
    `${dir}/${dbf}`, // must be 'dbf' file
    null
  );

  const { db } = mongoose.connection;

  // delete all existing nodes or edges by mapId
  //
  await db?.collection(collectionName).deleteMany({
    mapId,
    projectId: null,
    envId: null,
  });

  const collection = db?.collection(collectionName);
  if (!collection) {
    return {
      success: false,
    };
  }

  await insertBulk(
    collection,
    geoJson.features.map((feature: any) => {
      const id = feature.properties[idKey];
      return {
        mapId: mapId,
        projectId: null,
        envId: null,
        id: id,
        ...feature,
      };
    })
  );
}

interface File {
  name: string;
  content: string;
  size: string;
  lastModified: string;
  type: string;
}
