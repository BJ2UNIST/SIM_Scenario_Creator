import { Signal } from "@/server/models/tss.model";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { mapId, projectId, envId, connections } = body;

  // 최상위 노드의 커넥션 정보는
  // projectId: 'none', envId: 'none' 으로 저장

  // 그외는 projectId, envId로 구분하여 저장

  // if (projectId) {
  //   // 프로젝트별로 커넥션을 저장하는 경우
  //   return;
  // }

  await Signal.findOneAndUpdate(
    {
      mapId: mapId,
      projectId: projectId,
      envId: envId,
      nodeId: body.nodeId,
    },
    {
      mapId: mapId,
      projectId: projectId,
      envId,
      nodeId: body.nodeId,
      schedules: body.schedules,
    },
    {
      new: true,
      upsert: true,
      projection: { _id: 0, __v: 0 },
    }
  );

  return {
    success: true,
    schedules: body.schedules,
  };
});
