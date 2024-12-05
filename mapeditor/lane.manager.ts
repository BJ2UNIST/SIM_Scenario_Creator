//
//
// author: beanpole

import * as maptalks from "maptalks";

import { generateConnections } from "./conn.generator";
import {
  findEdgeByNode,
  layer,
  buildLanes,
  createConnectorGeometry,
} from "./map.utils";

import {
  calcAngle,
  determineDirection,
  determineDirection2,
} from "./geo.utils";

import type { Connection } from "./conn.generator";

import { DIRECTION_IN, DIRECTION_OUT } from "./options";

import type { EdgeFeature } from "./map.utils";
import { sortEdges } from "./edge.utils";

import { sortConnections } from "./connection.utils";

function _makeMarkerDefault(marker: maptalks.Marker) {
  if (marker.properties.DIRECTION === "in") {
    marker.updateSymbol({
      markerFill: "skyblue",
    });
  } else {
    marker.updateSymbol({
      markerFill: "blue",
    });
  }
}

function LaneManager(
  map: maptalks.Map,
  node: any,
  incominngEdges: any[],
  { connectionLayer }: { connectionLayer: maptalks.VectorLayer }
) {
  let points: any[] = [];
  const nodeId = node.properties.NODE_ID;
  const laneLayer = layer("laneLayer_" + nodeId);
  const markerLayer = layer("markerLayer_" + nodeId);

  map.addLayer([laneLayer, markerLayer]);

  function generateLanes(
    node: maptalks.Marker,
    edge: maptalks.LineString,
    direction = DIRECTION_IN
  ) {
    const laneCount = edge.properties.LANES;
    const lane = buildLanes(
      edge.properties.LINK_ID,
      edge.getCoordinates(),
      laneCount,
      direction
    );

    // const coo = lane.markers.map((m) => {
    //   return m.getCoordinates();
    // });
    // console.log(edge.properties.LINK_ID, coo);

    laneLayer.addGeometry(lane.lanes);
    markerLayer.addGeometry(lane.markers);

    lane.markers.forEach((laneMarker) => {
      laneMarker.on("click", function (e: any) {
        const marker = e.target;

        // 선택 취소
        if (points[0] == marker) {
          points.forEach(_makeMarkerDefault);
          points = [];
          return;
        }

        const { DIRECTION } = marker.properties;
        if (points.length === 0 && DIRECTION === DIRECTION_OUT) {
          alert("첫번째는 in이어야 합니다.");
          return;
        }
        if (points.length === 1 && DIRECTION === DIRECTION_IN) {
          alert("두번째는 out이어야 합니다.");
          return;
        }

        // 선택 표시
        laneMarker.updateSymbol({
          markerFill: "#f00",
        });

        points.push(marker);
        if (points.length === 2) {
          // const direction = determineDirection(
          //   node.getCoordinates(),
          //   // inEdgeMarker.getCoordinates(),
          //   // edge.getCoordinates()[edge.getCoordinates().length - 1],
          //   // edge.getCoordinates()[0],
          //   points[0].getCoordinates(),
          //   points[1].getCoordinates()
          // );

          const direction = determineDirection2(
            points[0].getCoordinates(),
            node.getCoordinates(),
            points[1].getCoordinates()
          );

          console.log("direction: ", direction);

          createConnectorGeometry(
            node,
            points[0],
            points[1],
            connectionLayer,
            direction
          );
          points.forEach(_makeMarkerDefault);
          points = [];
        }
      });
    });
    return lane;
  }

  function _findLaneMarker(
    linkId: string,
    laneNum: number
  ): maptalks.Marker | undefined {
    return markerLayer
      .getGeometries()
      .find(
        (g) => g.properties.LINK_ID === linkId && g.properties.LANE === laneNum
      ) as maptalks.Marker;
  }

  function generateConnection(node: maptalks.Marker, edges: EdgeFeature[]) {
    const edgeInfo = findEdgeByNode(edges, node.properties.NODE_ID);

    const edgesSorted = sortEdges(node, edgeInfo.incomingEdges);

    console.log("--- sorted edges ---");
    console.log(
      edgesSorted.map((edge: any) => edge.properties.LINK_ID).join("->")
    );

    let fullConnections: any[] = [];

    for (let incomingEdge of edgesSorted) {
      const connections = generateConnections(
        node.getCoordinates(),
        incomingEdge,
        edgeInfo.outgoingEdges,
        _findLaneMarker
      );

      const connectionSorted = sortConnections(connections);
      fullConnections = fullConnections.concat(connectionSorted);

      connections.forEach((conn) => {
        const p1 = _findLaneMarker(conn.from, conn.fromLane);
        const p2 = _findLaneMarker(conn.to, conn.toLane);

        if (!p1 || !p2) {
          return;
        }
        createConnectorGeometry(node, p1, p2, connectionLayer, conn.label);
      });
    }

    return fullConnections;
  }

  function loadConnections(
    node: maptalks.Marker,
    connections: Connection[] = []
  ) {
    connections.forEach((conn) => {
      const startMarker = _findLaneMarker(conn.from, conn.fromLane);
      const endMarker = _findLaneMarker(conn.to, conn.toLane);

      if (!startMarker || !endMarker) {
        console.log("not found markers");
        return;
      }
      createConnectorGeometry(
        node,
        startMarker,
        endMarker,
        connectionLayer,
        conn.label
      );
    });
  }

  function save() {
    laneLayer.clear();
    markerLayer.clear();

    map.removeLayer([laneLayer, markerLayer]);
  }

  // 엣지를 먼저 정렬하고, 커넥션을 정렬 후 반환해야 함
  function getConnections() {
    const connections = connectionLayer
      .getGeometries()
      .filter((connectorLine: any) => {
        return connectorLine.properties.nodeId === nodeId;
      })
      .map((connectorLine: any) => {
        return connectorLine.properties;
      });

    // console.log(incominngEdges);

    // 엣지를 먼저 정렬
    const edgesSorted = sortEdges(node, incominngEdges);

    console.log("--- sorted edges ---");
    const sortedConnections: any = [];
    edgesSorted.forEach((edge: any) => {
      // console.log(edge.properties.LINK_ID);

      // 특정 엣지의 커넥션을 찾아서 정렬
      const conns: any[] = [];
      connections.forEach((conn: any) => {
        if (edge.properties.LINK_ID === conn.from) {
          conns.push(conn);
        }
      });
      const sorted = sortConnections(conns);
      sortedConnections.push(...sorted);
    });

    console.log("---connection sorted---");
    sortedConnections.forEach((conn: any) => {
      console.log(
        `${conn.from}(${conn.fromLane}) -> ${conn.to}(${conn.toLane}) ${conn.label}`
      );
    });

    return {
      connections: sortedConnections,
    };
  }

  /**
   * 레이어를 맨 앞으로 가져온다.
   */
  function bringToFront() {
    markerLayer.bringToFront();
  }

  return {
    generateLanes,
    generateConnection,
    save,
    getConnections,
    loadConnections,
    bringToFront,
  };
}

export default LaneManager;
