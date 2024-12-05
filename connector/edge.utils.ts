import { calcAngle } from "./geo.utils";

/**
 * 엣지를 시계방향으로 정렬한다.
 * 북쪽 엣지를 찾아서 북쪽부터 시계방향으로 정렬한다.
 * @param node
 * @param incomingEdges
 * @returns
 */
function sortEdges(node: any, incomingEdges: any) {
  let sortedPoints = incomingEdges
    .map((point: any) => {
      return {
        type: point.type,
        properties: point.properties,
        geometry: point.geometry,
        angle: calcAngle(
          node.geometry.coordinates,
          point.geometry.coordinates[0]
        ),
      };
    })
    .sort((a, b) => b.angle - a.angle);

  const northIndex = sortedPoints.reduce((closestIndex, point, index) => {
    return Math.abs(point.angle - 90) <
      Math.abs(sortedPoints[closestIndex].angle - 90)
      ? index
      : closestIndex;
  }, 0);
  // console.log(
  //   node.properties.NODE_ID,
  //   "북쪽:",
  //   sortedPoints[northIndex].properties.LINK_ID
  // );

  sortedPoints = [
    ...sortedPoints.slice(northIndex),
    ...sortedPoints.slice(0, northIndex),
  ];

  return sortedPoints;
}

export { sortEdges };

// 라벨의 우선순위를 정의하는 함수
function getLabelPriority(label) {
  switch (label) {
    case "right":
      return 0;
    case "straight":
      return 1;
    case "left":
      return 2;
    default:
      return 3; // 다른 라벨이 있을 경우 가장 낮은 우선순위
  }
}

/**
 * 커넥션을 right, straight, left, others 순으로 정렬한다.
 * 라벨이 같은 경우 fromLane을 기준으로 정렬하고, fromLane이 같은 경우 toLane으로 정렬한다.
 * @param connections
 * @returns
 */
function sortConnections(connections) {
  const sortedConnections = connections.sort((a, b) => {
    // 라벨을 기준으로 먼저 정렬
    const labelPriorityDiff =
      getLabelPriority(a.label) - getLabelPriority(b.label);
    if (labelPriorityDiff !== 0) {
      return labelPriorityDiff;
    }

    // 라벨이 같은 경우 fromLane을 기준으로 정렬
    if (a.fromLane !== b.fromLane) {
      return a.fromLane - b.fromLane;
    }

    // fromLane이 같은 경우 toLane으로 정렬
    return a.toLane - b.toLane;
  });
  return sortedConnections;
}

export { sortConnections };
