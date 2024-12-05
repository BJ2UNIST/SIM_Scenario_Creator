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
        ...point,
        angle: calcAngle(node.getCenter(), point.getCoordinates()[0]),
        coordinates: point.getCoordinates(),
      };
    })
    .sort((a: any, b: any) => b.angle - a.angle);

  const northIndex = sortedPoints.reduce(
    (closestIndex: any, point: any, index: any) => {
      return Math.abs(point.angle - 90) <
        Math.abs(sortedPoints[closestIndex].angle - 90)
        ? index
        : closestIndex;
    },
    0
  );
  console.log(
    node.properties.NODE_ID,
    "북쪽:",
    sortedPoints[northIndex].properties.LINK_ID
  );

  const obj = incomingEdges.find((edge: any) => {
    return (
      edge.properties.LINK_ID === sortedPoints[northIndex].properties.LINK_ID
    );
  });

  obj?.updateSymbol({
    lineColor: "red",
    lineWidth: 10,
  });

  sortedPoints = [
    ...sortedPoints.slice(northIndex),
    ...sortedPoints.slice(0, northIndex),
  ];
  return sortedPoints;
}

export { sortEdges };
