/**
 *
 * 커넥션을 생성하는 모듈
 * 특정 노드에 연결된 엣지를 찾아서 커넥션을 생성한다.
 * 커넥션은 노드와 연결된 엣지의 방향에 따라 생성된다.
 * 커넥션은 다음과 같은 정보를 가지고 있다.
 * {
 *   from: string; // 시작 엣지 ID
 *   to: string; // 종료 엣지 ID
 *   fromLane: number; // 시작 차선
 *   toLane: number; // 종료 차선
 * }
 * author: beanpole
 * last modified: 2021-06-30
 */
import * as turf from "@turf/turf";
import Debug from "debug";
import { DIRECTION_IN, DIRECTION_OUT } from "../mapeditor/options";

import { findP3, calcAngle, determineDirection } from "../mapeditor/geo.utils";
import { sortEdges, sortConnections } from "./edge.utils";

import { generate as handle3 } from "./congen/way3";
import { generate as handle4 } from "./congen/way4";
import type { EdgeFeature } from "~/mapeditor/map.utils";

const debug = Debug("connector");

function ConnectionManager(edges: GeoJsonFeature[]) {
  /**
   * 노드에 연결된 커넥션을 생성한다.
   */
  function generateConnection(node: GeoJsonFeature): {
    connections: Connection[];
    junctionType: number;
  } {
    const { incomingEdges, outgoingEdges } = findEdgeByNode(
      node.properties.NODE_ID
    );

    const junctionType = outgoingEdges.length;

    let markers: any[] = [];

    markers = markers.concat(
      buildLaneMarkersForEdges(incomingEdges, DIRECTION_IN)
    );
    markers = markers.concat(
      buildLaneMarkersForEdges(outgoingEdges, DIRECTION_OUT)
    );

    function findLaneMarker(linkId: string, lane: number) {
      return markers.find(
        (marker) => marker.linkId === linkId && marker.lane === lane
      );
    }

    let conns: Connection[] = [];

    // 먼저 edge 들을 북쪽 엣지 기준으로 시계방향으로 정렬하는 작업이 필요하다.
    // 즉 북->동->남->서 순으로 커넥션이 만들어진다.

    // console.log(
    //   node.geometry.coordinates,
    //   incomingEdges[0].geometry.coordinates
    // );

    const sorted = sortEdges(node, incomingEdges);

    debug(`---[${node.properties.NODE_ID}]---`);
    debug(sorted.map((edge: any) => `${edge.properties.LINK_ID}`).join("->"));

    for (let incomingEdge of sorted) {
      const connections = generateConnections(
        node.geometry.coordinates,
        incomingEdge,
        outgoingEdges,
        findLaneMarker
      );

      const connectionSorted = sortConnections(connections);
      // console.log(`--- ${incomingEdge.properties.LINK_ID} ---`);
      // connectionSorted.forEach(({ from, to, fromLane, toLane }) => {
      //   console.log(`${from}[${fromLane}]->${to}[${toLane}]`);
      // });

      conns = conns.concat(connectionSorted);
    }

    // 반환되는 커넥션도 정렬이 되어 있어야 한다.
    return {
      connections: conns,
      junctionType: junctionType,
    };
  }

  function findEdgeByNode(nodeId: string) {
    const filter = (nodeType: string) => (edge: any) =>
      edge.properties?.[nodeType] === nodeId;

    return {
      outgoingEdges: edges.filter(filter("F_NODE")),
      incomingEdges: edges.filter(filter("T_NODE")),
    };
  }

  return {
    generateConnection,
  };
}

function buildLaneMarkersForEdges(
  edges: GeoJsonFeature[],
  direction: "in" | "out"
): Marker[] {
  let markers: Marker[] = [];
  for (let edge of edges) {
    markers = markers.concat(
      buildLaneMarkers(edge, edge.properties.LANES, direction)
    );
  }
  return markers;
}

function buildLaneMarkers(
  edge: GeoJsonFeature,
  laneCount: number = 1,
  direction: "in" | "out"
): Marker[] {
  const linkId = edge.properties.LINK_ID;
  const markers: Marker[] = [];

  for (let lane = 0; lane < laneCount; lane++) {
    const laneFeature = turf.lineOffset(
      turf.lineString(edge.geometry.coordinates as any),
      4 * lane - laneCount, // distance between lanes
      { units: "meters" }
    );

    const coordinates = calcMarkerLocation(
      laneCount,
      direction,
      laneFeature.geometry.coordinates
    );
    markers.push({ linkId, lane, coordinates });
  }
  return markers;
}

function generateConnections(
  nodeCoordinates: any,
  incomingEdge: GeoJsonFeature,
  outgoingEdges: GeoJsonFeature[],
  findMarker: (linkId: string, lane: number) => any
) {
  const inComingEdgeId = incomingEdge.properties.LINK_ID as string;
  const inEdgeMarker = findMarker(inComingEdgeId, 0);

  const sourceEdgeCoordinates = inEdgeMarker.coordinates;

  // 들어오는 엣지와 중심 노드 사이의 각도
  // 나가는 엣지와의 각도 계산시 회전을 위한 기준 각도로 사용한다.
  const angleBetweenNodeAndInEdge = calcAngle(
    sourceEdgeCoordinates,
    nodeCoordinates
  );
  // console.log("angleBetweenNodeAndInEdge:", angleBetweenNodeAndInEdge);

  const outEdges = outgoingEdges.map((edge: any) => {
    const linkId = edge.properties.LINK_ID;
    const outEdgeMarker = findMarker(linkId, 0);

    const angleBetweenInEdgeOutEdge = calcAngle(
      outEdgeMarker.coordinates,
      inEdgeMarker.coordinates
    );

    const direction = determineDirection(
      nodeCoordinates,
      inEdgeMarker.coordinates,
      outEdgeMarker.coordinates
    );
    // console.log("node:", nodeCoordinates);
    // console.log("direction:", direction);
    // console.log("inEdgeMarker:", inEdgeMarker.coordinates);
    // console.log("outEdgeMarker:", outEdgeMarker.coordinates);
    const angle =
      (angleBetweenInEdgeOutEdge - angleBetweenNodeAndInEdge + 360) % 360;
    return {
      linkId,
      angle,
      edge,
      direction,
    };
  });

  // 유턴 -> 좌회전 -> 직진 -> 우회전 순으로 정렬
  outEdges.sort((a, b) => b.angle - a.angle);

  if (outEdges.length === 3) {
    return handle3(incomingEdge, outEdges);
  }

  const connections2: Connection[] = handle4(incomingEdge, outEdges);

  return connections2;
}

/**
 * 차선을 나타내는 마커의 위치를 계산한다.
 * 마커는 차선의 시작점에서 일정한 거리만큼 떨어진 위치에 표시된다.
 *
 * @param lanes 차선 수
 * @param direction 차선 방향 (in, out)
 * @param coordinates 차선 좌표 - 엣지의 좌표가 아닌 차선의 좌표
 * @returns
 */
function calcMarkerLocation(
  lanes: number,
  direction: string,
  coordinates: number[][]
): number[] {
  if (coordinates.length !== 2) return [0, 0];

  // 차선을 나타내는 마커의 위치를 결정하는 비율
  let offsetRadio = 0.00015;

  if (lanes >= 0) {
    offsetRadio = 0.00015 * 2.5;
  }

  let markerPoint;
  if (direction === DIRECTION_IN) {
    markerPoint = findP3(
      coordinates[coordinates.length - 1],
      coordinates[coordinates.length - 2],
      offsetRadio
    );
  } else {
    markerPoint = findP3(coordinates[0], coordinates[1], offsetRadio);
  }
  return markerPoint;
}

export default ConnectionManager;

interface Marker {
  linkId: string;
  lane: number;
  coordinates: number[];
}

interface Connection {
  from: string;
  to: string;
  fromLane: number;
  toLane: number;
  label?: string;
}

interface GeoJsonFeature {
  type: string;
  properties: { [key: string]: any };
  geometry: {
    type: string;
    coordinates: number[] | number[][];
  };
}

interface GeoJson {
  type: string;
  features: GeoJsonFeature[];
}

export type { Marker, Connection, GeoJsonFeature, GeoJson };
