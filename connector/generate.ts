import ConnectionManager from "./connection.manager";

import { getSignalBuilder } from "./signalgen";

import { Signal } from "../server/models/tss.model";
import { Connection } from "../server/models/connection.model";

import { colored } from "./signalgen/utils";

async function generate(
  { mapId, projectId, envId }: any,
  nodes: any[],
  edges: any[]
) {
  const connectionManager = ConnectionManager(edges);

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (!node) {
      continue;
    }

    const nodeId = node?.properties?.NODE_ID;
    // if (nodeId === "1550016900") {
    if (nodeId === "1860015700") {
      // 유성, 도안
      const { connections, junctionType } =
        connectionManager.generateConnection(node);

      // console.log("junctionType:", junctionType, "거리");
      // connections.forEach(({ from, to, fromLane, toLane, label }) => {
      //   console.log(`${from}[${fromLane}]->${to}[${toLane}][${label}]`);
      // });

      if (junctionType < 3) {
        continue;
      }

      const buildSignal = getSignalBuilder(junctionType);

      const result = buildSignal(connections, junctionType);
      result.phases.forEach((phase, idx) => {
        console.log(idx + 1, "현시", colored(phase.state));
      });

      console.log("-----------------------------------");

      await saveTrafficSignals(nodeId, result.phases);
      await saveConnections(nodeId, connections);
    }
  }
  async function saveTrafficSignals(nodeId: string, phases: any) {
    const schedules = [
      {
        offset: 10,
        phase: phases,
      },
    ];

    return Signal.findOneAndUpdate(
      {
        mapId: mapId,
        projectId,
        envId,
        nodeId: nodeId,
      },
      {
        mapId: mapId,
        projectId,
        envId,
        nodeId: nodeId,
        schedules: schedules,
      },
      {
        new: true,
        upsert: true,
        projection: { _id: 0, __v: 0 },
      }
    );
  }

  async function saveConnections(nodeId: string, connections: any[]) {
    return Connection.findOneAndUpdate(
      {
        mapId,
        projectId,
        envId,
        nodeId,
      },
      {
        mapId,
        projectId,
        envId,
        nodeId,
        connections,
      },
      {
        new: true,
        upsert: true,
        projection: { _id: 0, __v: 0 },
      }
    );
  }
}

export { generate };
