interface Schedule {
  offset: number;
  phase: any[];
}

interface TrfafficSignal {
  schedules: Schedule[];
}

async function getSignals(
  mapId: string,
  nodeId: string
): Promise<TrfafficSignal> {
  return $fetch(`/api/signals/${nodeId}?mapId=${mapId}`, {
    method: "GET",
  });
}

async function updateSignals(
  {
    mapId,
    projectId,
    envId,
  }: { mapId: string; projectId: string; envId: string },
  nodeId: string,
  schedules: any[]
): Promise<void> {
  return $fetch(`/api/signals/${nodeId}`, {
    method: "POST",
    body: {
      nodeId: nodeId,
      mapId: mapId,
      projectId: projectId,
      envId: envId,
      schedules: schedules,
    },
  });
}

export default {
  getSignals,
  updateSignals,
};
