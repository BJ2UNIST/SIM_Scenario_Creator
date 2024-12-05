import * as maptalks from "maptalks";
import * as turf from "@turf/turf";

import { getDirectionColor, DIRECTION_IN } from "./options";
import { calcAngle, findP3, getMidpoint } from "./geo.utils";

interface EdgeFeature {
  properties: Record<any, string>;
  coordinates: number[][];
}

type NodeType = "F_NODE" | "T_NODE";

/**
 * 주어진 엣지 목록에서 주어진 노드에 연결된 엣지를 찾아 반환한다.
 *
 * @returns
 */
function findEdgeByNode(edges: any[], nodeId: String) {
  if (!edges || edges.length === 0) {
    return {
      outgoingEdges: [],
      incomingEdges: [],
    };
  }

  if (!nodeId) {
    return {
      outgoingEdges: [],
      incomingEdges: [],
    };
  }

  const filter = (nodeType: NodeType) => (edge: EdgeFeature) =>
    edge.properties?.[nodeType] === nodeId;

  return {
    outgoingEdges: edges.filter(filter("F_NODE")),
    incomingEdges: edges.filter(filter("T_NODE")),
  };
}

function _toArray(point: { x: number; y: number }) {
  return [point.x, point.y];
}

const sortByAngle = (center: number[]) => (p1: number[], p2: number[]) => {
  const a1 = calcAngle(center, p1);
  const a2 = calcAngle(center, p2);
  return a2 - a1;
};

/**
 * 교차로의 모양을 나타내는 다각형을 생성한다.
 */
function createJunctionShapeGeometry(
  node: maptalks.Marker,
  markers: maptalks.Marker[]
): maptalks.Polygon {
  const center = _toArray(node.getCoordinates());

  const points = markers
    .map((marker) => _toArray(marker.getCoordinates()))
    .sort(sortByAngle(center));

  // 교차로의 모양을 나타내는 다각형
  return new maptalks.Polygon(points, {
    visible: true,
    editable: false,
    cursor: "pointer",
    draggable: false,
    dragShadow: false, // display a shadow during dragging
    symbol: {
      lineWidth: 0,
      polygonFill: "LightSlateGray",
      polygonOpacity: 0.99,
    },
  }).setId("junction_" + node?.properties.NODE_ID + "");
}

/**
 * maptalks.VectorLayer 를 생성하는 함수
 *
 * @param {String} name
 * @returns
 */
function layer(name: string): maptalks.VectorLayer {
  return new maptalks.VectorLayer(name, [], {});
}

/**
 * 주어진 엣지정보를 사용해서 LANES 수 만큼의 차선을 생성하는 함수
 * 차선과 차선을 나타내는 마커도 함께 생성한다.
 *
 */
function buildLanes(
  edgeId: string,
  edgeCoordinates: { x: number; y: number }[],
  laneCount = 1,
  direction = DIRECTION_IN
) {
  if (!edgeId) throw new Error("line is required");
  if (laneCount < 1) {
    laneCount = 1;
  }

  const lanes: maptalks.LineString[] = [];
  const markers: maptalks.Marker[] = [];

  for (let i = 0; i < laneCount; i++) {
    // 차선을 나타내는 라인
    const laneFeature = turf.lineOffset(
      turf.lineString(edgeCoordinates.map(_toArray)),
      4 * i - laneCount, // distance between lanes
      { units: "meters" }
    );

    const laneColor = getDirectionColor(direction);
    const lane = _buildLaneGeometry(laneFeature, laneColor);
    const laneMarker = buildLaneMarkerGeometry(
      edgeId,
      laneFeature.geometry.coordinates,
      laneCount,
      laneCount - i - 1,
      laneColor,
      direction
    );
    lanes.push(lane);
    markers.push(laneMarker);
  }
  return { lanes, markers };
}

function _buildLaneGeometry(
  laneFeature: any,
  laneColor: string
): maptalks.LineString {
  const defaultSymbol = {
    lineColor: laneColor,
    lineWidth: 2,
  };

  const lane = maptalks.GeoJSON.toGeometry(laneFeature)
    .setSymbol(defaultSymbol)
    .setOptions({
      showOn: "always",
      arrowStyle: "classic",
      arrowPlacement: "vertex-last",
    });

  return lane;
}

function _markerSymbol(num: number, color: string) {
  return {
    textName: num + "",
    textSize: 18,
    textFill: "#fff",
    textWrapCharacter: "\n",
    markerType: "ellipse",
    markerFill: color,
    markerFillOpacity: 0.8,
    markerLineColor: "#fff",
    markerLineWidth: 1,
    markerWidth: 20,
    markerHeight: 20,
  };
}

/**
 * 차선위에 표시되는 마커의 위치를 계산하는 함수
 *
 */
function _calcMarkerLocation(
  laneCount: number,
  direction: string,
  coordinates: number[][]
) {
  // 차선을 나타내는 마커의 위치를 결정하는 비율
  let offsetRadio = 0.00015;

  if (laneCount >= 0) {
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

/**
 * 차선을 나타내는 마커를 생성하는 함수
 */
function buildLaneMarkerGeometry(
  linkId: string,
  coordinates: number[][],
  laneCount: number,
  lane: number,
  color: string,
  direction: string
): maptalks.Marker {
  const marker = new maptalks.Marker(
    _calcMarkerLocation(laneCount, direction, coordinates),
    {
      properties: {
        TYPE: "LaneMarker",
        LINK_ID: linkId,
        LANE: lane,
        DIRECTION: direction,
      },
      symbol: _markerSymbol(lane, color),
    }
  );

  const { markerWidth, markerHeight, textSize } = marker.getSymbol();

  marker.on("mouseover", function (e) {
    marker.updateSymbol({
      markerWidth: markerWidth + 15,
      markerHeight: markerHeight + 15,
      textSize: textSize + 15,
    });
  });

  marker.on("mouseout", function (e) {
    marker.updateSymbol({
      markerWidth,
      markerHeight,
      textSize,
    });
  });

  return marker;
}

function _isStraight(centerPoint: any, startPoint: any, endPoint: any) {
  if (!centerPoint) {
    return;
  }

  // 중심 노드와 시작점 사이의 각도
  // 엣지의 위치에 따른 각도를 계산하기 위함
  //
  const angleStartCenter = calcAngle(startPoint, centerPoint);

  // 시작점과 끝점 사이의 각도
  const angleStartEnd = calcAngle(startPoint, endPoint);

  // 중심에서 회전한 각도만큼 빼서 계산,
  const angle = (angleStartEnd - angleStartCenter + 360) % 360;

  if (angle > 330 && angle < 360) return true;

  return false;
}

function _makeConnectorId(from: any, to: any) {
  return (
    from.properties.LINK_ID +
    "_" +
    to.properties.LINK_ID +
    "_" +
    from.properties.LANE +
    "_" +
    to.properties.LANE
  );
}

function _calcControlPoint(
  centerPoint: maptalks.Coordinate,
  startPoint: maptalks.Coordinate,
  endPoint: maptalks.Coordinate
): maptalks.Coordinate {
  const m1 = getMidpoint(startPoint, endPoint);
  const m2 = getMidpoint(m1, centerPoint);
  const m3 = getMidpoint(m2, m1);
  const m4 = getMidpoint(m3, m1);

  return new maptalks.Coordinate(m4);
}

function createConnectorGeometry(
  node: maptalks.Marker,
  from: maptalks.Marker,
  to: maptalks.Marker,
  connectionLayer: maptalks.VectorLayer,
  label: string | undefined
) {
  if (!from || !to) {
    return false;
  }

  const connectorId = _makeConnectorId(from, to);

  const exists = connectionLayer.getGeometryById(connectorId);
  if (exists) {
    console.log("already exists");
    return;
  }

  const defaultSymbol = {
    lineColor: "#34495e",
    lineWidth: 3,
    lineDasharray: [10, 5],
    markerDx: 0,
    // markerDy: 23,
  };

  const connectorLine = new maptalks.ArcConnectorLine(from, to, {
    id: connectorId,
    arcDegree: 0,
    smoothness: true,
    showOn: "always",
    symbol: defaultSymbol,
    properties: {
      type: "Connection",
      nodeId: node.properties.NODE_ID,
      from: from.properties.LINK_ID,
      to: to.properties.LINK_ID,
      fromLane: from.properties.LANE,
      toLane: to.properties.LANE,
      label,
    },
  }).on("click", (e) => {
    if (!e) {
      return;
    }
    if (e.domEvent.ctrlKey) {
      connectionLayer.removeGeometry(connectorLine);
    }
  });

  connectorLine.on("mouseover", function (e: any) {
    const { target } = e;
    target.updateSymbol({
      // lineColor: "red",
      lineWidth: 12,
    });
  });

  connectorLine.on("mouseout", function (e: any) {
    const { target } = e;
    target.updateSymbol({
      lineWidth: 3,
    });
  });

  const startPoint = from.getCoordinates();
  const endPoint = to.getCoordinates();
  const centerPoint = node.getCoordinates();

  // 위치정보를 사용하기 위해서는 addGeometry를 먼저 수행해야함
  connectionLayer.addGeometry(connectorLine);

  if (_isStraight(node.getCoordinates(), startPoint, endPoint)) {
    connectorLine.setOptions({ arcDegree: 0 }); // 직선
  } else {
    // 제어포인트를 중간에 삽입해서 꺽인 선을 만든다.
    connectorLine.setCoordinates([
      connectorLine.getCoordinates()[0],
      _calcControlPoint(centerPoint, startPoint, endPoint),
      connectorLine.getCoordinates()[1],
    ]);
  }

  return connectorLine;
}

export {
  findEdgeByNode,
  createJunctionShapeGeometry as createJunctionShape,
  layer,
  buildLanes,
  buildLaneMarkerGeometry,
  createConnectorGeometry,
};

export type { EdgeFeature };
