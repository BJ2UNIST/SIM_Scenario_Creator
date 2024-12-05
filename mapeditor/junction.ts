//    교차로의 엣지를 편집하는 클래스
//    author: beanpole
//    date: 2021-06-07
import * as maptalks from "maptalks";

import { findEdgeByNode, createJunctionShape } from "./map.utils";
import LaneManager from "./lane.manager";

import type { EdgeFeature } from "./map.utils";

import {
  EDGE_IN_COLOR,
  EDGE_OUT_COLOR,
  DIRECTION_IN,
  DIRECTION_OUT,
} from "./options";

import { edgeSymbol, nodeSymbol } from "./symbols";

import { getSignalBuilder } from "../connector/signalgen";
import type { Connection } from "./conn.generator";

import ConnectionStore from "./repo/nuxt.connection.store";
import SignalStore from "./repo/nuxt.signal.store";

import type { Emit, On } from "./events";

/**
 * 교차로의 엣지를 편집하는 클래스
 */
function Junction(
  map: maptalks.Map,
  {
    mapId,
    projectId,
    envId,
  }: { mapId: string; projectId: string; envId: string },
  node: maptalks.Marker,
  layers: {
    edgeLayer: maptalks.VectorLayer;
    junctionLayer: maptalks.VectorLayer;
    connectionLayer: maptalks.VectorLayer;
  },
  inforPanel: maptalks.control.Panel,
  $emit: Emit,
  $on: On,
  $off: any
): any {
  const { edgeLayer, connectionLayer, junctionLayer } = layers;

  let laneManager: any = null;
  let _isEditing = false;

  let junctionShape: maptalks.Geometry | null = null;
  let junctionType = 4;

  let _fullConnections: Connection[];
  let phaseNum = 1;
  let _phases: any[] = [];

  const nodeId = node.properties.NODE_ID;

  const EVENT_JUNCTION_PHASE_CHANGE_EVENT = "junction:phase:change:" + nodeId;
  const EVENT_SIGNAL_LOADED = "junction:signal:loaded";
  const EVENT_JUNCTION_CLOSED = "junction:closed";

  const { incomingEdges, outgoingEdges } = findEdgeByNode(
    edgeLayer.getGeometries(),
    nodeId
  );

  let edgesLoaded: EdgeFeature[] = [...incomingEdges, ...outgoingEdges];

  function _showNodeInfo() {
    const { NODE_ID, NODE_NAME } = node.properties;
    inforPanel.setContent(`
      <div class="bg-white rounded p-3 flex flex-col gap-1 text-black text-sm">
      <div>🚦${NODE_NAME} (${NODE_ID}) </div>
      </div>`);
    inforPanel.show();
  }

  function _createJunctionShape(node: maptalks.Marker) {
    let points: any[] = [];

    // incoming edges
    incomingEdges.forEach((edge) => {
      if (edge instanceof maptalks.LineString) {
        // edge.updateSymbol(edgeSymbol(EDGE_IN_COLOR));
      }
      const { markers } = laneManager.generateLanes(node, edge, DIRECTION_IN);
      points = points.concat(markers);
    });

    // outgoing edges
    outgoingEdges.forEach((edge) => {
      if (edge instanceof maptalks.LineString) {
        // edge.updateSymbol(edgeSymbol(EDGE_OUT_COLOR));
      }

      const { markers } = laneManager.generateLanes(node, edge, DIRECTION_OUT);
      points = points.concat(markers);
    });

    const jShape = createJunctionShape(node as maptalks.Marker, points);
    junctionLayer.addGeometry(jShape);
    jShape.on("mouseover", () => laneManager.bringToFront());
    return jShape;
  }

  /**
   * 대상 교차로의 엣지를 편집하기 시작한다.
   * @param {*} node
   */
  function _startEdit(node: maptalks.Marker) {
    laneManager = LaneManager(map, node, incomingEdges, {
      connectionLayer,
    });

    junctionShape = _createJunctionShape(node);

    junctionLayer.bringToFront();
    connectionLayer.bringToFront();
    laneManager.bringToFront();

    $on(EVENT_JUNCTION_PHASE_CHANGE_EVENT, (data: any) => {
      if (nodeId !== data.nodeId) {
        return;
      }
      phaseNum = Number(data.phaseNum);
      updateSignalState(phaseNum);
    });
  }

  function _endEdit() {
    edgesLoaded.forEach((edge: any) => {
      if (edge instanceof maptalks.LineString) {
        edge.updateSymbol({
          lineColor: "#000",
          lineWidth: 2,
          lineDasharray: [],
        });
      }
    });

    if (junctionShape) {
      junctionLayer.removeGeometry(junctionShape);
    }

    junctionShape = null;
    edgesLoaded = [];

    laneManager?.save();
    _isEditing = false;

    $off(EVENT_JUNCTION_PHASE_CHANGE_EVENT);
  }

  function getConnectionColor(state: string) {
    let color = "red";
    if (state === "G") {
      color = "green";
    } else if (state === "g") {
      color = "lightgreen";
    } else if (state === "r") {
      color = "red";
    }
    return color;
  }

  function updateSignalState(phaseNum: number) {
    if (!_isEditing) {
      console.log("편집모드에서만 사용할 수 있습니다.");
      return;
    }
    const phase = _phases[phaseNum];
    if (!phase) {
      console.log("신호가 없습니다.");
      return;
    }
    const states = phase.state; // 첫번째 신호

    const conns = laneManager.getConnections().connections;

    conns.forEach((con: Connection, idx: number) => {
      const id = makeConnectionId(con);
      const state = states[idx];
      connectionLayer.getGeometryById(id)?.updateSymbol({
        lineColor: getConnectionColor(state),
        lineWidth: 3,
      });
    });
  }

  async function _loadConnections(node: maptalks.Marker) {
    const result = await ConnectionStore.getConnections(
      {
        mapId,
        projectId,
        envId,
      },
      nodeId
    );
    if (!result) {
      console.log(
        `mapId:${mapId}, nodeId:${nodeId} 에 대한 연결 정보를 찾을 수 없습니다`
      );
      return;
    }
    const { connections } = result;

    // _fullConnections = connections;

    if (connections) {
      laneManager?.loadConnections(node, connections);
    }

    const trafficSignal = await SignalStore.getSignals(mapId, nodeId);
    if (!trafficSignal) {
      return;
    }
    const schedule: any = trafficSignal.schedules[0];
    if (!schedule) {
      console.log("신호 스케줄을 찾을 수 없음");
      return;
    }
    _phases = schedule.phase;
    updateSignalState(0);

    $emit(EVENT_SIGNAL_LOADED, {
      nodeId,
      schedule,
    });
  }

  function _generateConnection(node: maptalks.Marker) {
    // const { outgoingEdges } = findEdgeByNode(edgeLayer.getGeometries(), nodeId);
    // if (!outgoingEdges) {
    //   console.log("연결할 도로가 없습니다.");
    //   return;
    // }
    const roads = +outgoingEdges.length;
    console.log("나가는 도로 개수:", roads);
    if (roads < 3) {
      console.log("3거리 이상에서만 사용할 수 있습니다.");
      return;
    }

    const connection: any = laneManager.generateConnection(
      node,
      edgeLayer.getGeometries()
    );
    console.log("generated connections");
    console.log(connection);
    // _fullConnections = connection;
  }

  function _saveConnection(node: maptalks.Marker) {
    const connections = laneManager.getConnections();
    console.log("*** save connections ***");
    console.log(connections);
    ConnectionStore.updateConnections(
      { mapId, projectId, envId },
      node.properties.NODE_ID,
      connections.connections
    ).then(() => {
      console.log("connection saved...");
    });

    SignalStore.updateSignals(
      { mapId, projectId, envId },
      node.properties.NODE_ID,
      [
        {
          offset: 0,
          phase: _phases,
        },
      ]
    );

    // _endEdit();
  }

  const handlers = {
    openEditor: function (e: any) {
      const targetNode = e.target.getOwner();
      if (_isEditing) {
        alert("편집 중이던 작업을 먼저 저장해주세요");
        return;
      }

      _isEditing = true;

      _startEdit(e.target.getOwner());
      // _loadConnections(e.target.getOwner());
    },

    showConnections: (e: any) => {
      if (laneManager) {
        const conns = laneManager.getConnections();
        console.log("** connections for ", node.properties.NODE_ID);
        // console.log(conns);
        conns.connections.forEach((conn: Connection) => {
          console.log(
            `${conn.from}(${conn.fromLane}) -> ${conn.to}(${conn.toLane}) ${conn.label}`
          );
        });
      }
    },

    generateConnections: (e: any) => {
      if (!_isEditing) {
        alert("편집모드에서만 사용할 수 있습니다.");
        return;
      }
      const targetNode = e.target.getOwner();
      _generateConnection(targetNode);
    },

    saveConnections: (e: maptalks.HandlerFnResultType) => {
      const node = e.target.getOwner();
      _saveConnection(node);
    },

    closeEditor: (e: maptalks.HandlerFnResultType) => {
      _endEdit();
      $emit(EVENT_JUNCTION_CLOSED, {
        nodeId,
      });
    },

    getConnections(e: maptalks.HandlerFnResultType) {
      const node = e.target?.getOwner();
      _loadConnections(node);
    },
    generateSignal1: (e: any) => {
      const edgeInfo = findEdgeByNode(
        edgeLayer.getGeometries(),
        node.properties.NODE_ID
      );
      junctionType = edgeInfo.outgoingEdges.length;

      if (junctionType < 3) {
        return;
      }

      console.log("나가는 도로 개수:", edgeInfo.outgoingEdges.length);

      console.log(laneManager.getConnections());

      const result = getSignalBuilder(junctionType)(
        laneManager.getConnections().connections,
        edgeInfo.outgoingEdges.length
      );

      _phases = result.phases;

      updateSignalState(0);

      $emit(EVENT_SIGNAL_LOADED, {
        nodeId,
        schedule: {
          offset: 0,
          phase: _phases,
        },
      });
    },
    // 4현시, 직좌 동시신호
    generateSignal2: (e: any) => {
      const edgeInfo = findEdgeByNode(
        edgeLayer.getGeometries(),
        node.properties.NODE_ID
      );
      junctionType = edgeInfo.outgoingEdges.length;

      console.log("나가는 도로 개수:", junctionType);

      if (junctionType < 3) {
        return;
      }

      const result = getSignalBuilder(3)(
        laneManager.getConnections().connections,
        edgeInfo.outgoingEdges.length
      );

      console.log("result:", result);

      _phases = result.phases;

      updateSignalState(0);

      $emit(EVENT_SIGNAL_LOADED, {
        nodeId,
        schedule: {
          offset: 0,
          phase: _phases,
        },
      });
    },
    loadTrafficSignal: async (e: any) => {
      const trafficSignal = await SignalStore.getSignals(mapId, nodeId);
      if (!trafficSignal) {
        return;
      }
      const schedule: any = trafficSignal.schedules[0];
      _phases = schedule.phase;
      updateSignalState(0);

      $emit(EVENT_SIGNAL_LOADED, {
        nodeId,
        schedule,
      });
    },
  };

  const nodeMenus = {
    items: [
      { item: "🔧편집모드", click: handlers.openEditor },
      { item: "❌닫기", click: handlers.closeEditor },
      "-",
      { item: "커넥션 저장하기", click: handlers.saveConnections },
      { item: "커넥션 불러오기", click: handlers.getConnections },
      "-",
      { item: "커넥션 정보출력", click: handlers.showConnections },
      { item: "커넥션 자동생성", click: handlers.generateConnections },
      "-",
      { item: "신호생성 Type1", click: handlers.generateSignal1 },
      { item: "신호생성 Type2", click: handlers.generateSignal2 },
      "-",
      { item: "신호 불러오기", click: handlers.loadTrafficSignal },
    ],
  };

  function makeConnectionId(con: Connection) {
    return `${con.from}_${con.to}_${con.fromLane}_${con.toLane}`;
  }

  function _nodeClickHandler(node: any) {
    return (e: any) => {
      _showNodeInfo();

      if (e.domEvent.ctrlKey) {
        if (_isEditing) {
          // _saveConnection(node);
          // _endEdit();
          return;
        }
        _isEditing = true;
        _startEdit(node);
        _loadConnections(node);
        return;
      }

      // 현시 보여주기 제공
      // if (e.domEvent.altKey) {
      //   if (_fullConnections) {
      //     const cPhaseNum = phaseNum % junctionType;
      //     updateSignalState(cPhaseNum);
      //     phaseNum++;
      //   }
      // }
    };
  }

  node.setSymbol(nodeSymbol(node) as maptalks.AnyMarkerSymbol);
  node.on("click", _nodeClickHandler(node));
  const originalSymbol = node.getSymbol();

  node.on("mouseover", () => {
    node.setSymbol({
      ...originalSymbol,
      textHaloFill: "#6495ED",
    });
    _showNodeInfo();
  });

  node.on("mouseout", () => {
    node.setSymbol(originalSymbol);
    // _hideNodeInfo();
  });

  // @ts-ignore
  node.setMenu(nodeMenus).openMenu();
  return {};
}

export default Junction;
