async function updateConnections(
  {
    mapId,
    projectId,
    envId,
  }: { mapId: string; projectId: string; envId: string },
  nodeId: string,
  connections: any[]
): Promise<void> {
  console.log("update connections");
  return $fetch("/api/connections/", {
    method: "POST",
    body: {
      nodeId: nodeId,
      mapId: mapId,
      projectId: projectId,
      envId: envId,
      connections: connections,
    },
  });
}

async function getConnections(
  { mapId, projectId, envId }: any,
  nodeId: string
): Promise<{
  connections: any[];
}> {
  return $fetch(`/api/connections/${nodeId}`, {
    method: "GET",
    query: {
      mapId,
      projectId,
      envId,
    },
  });
}

function clear() {}

export default {
  updateConnections,
  getConnections,
  clear,
};
