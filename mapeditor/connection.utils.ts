import type { Connection } from "./conn.generator";

// 라벨의 우선순위를 정의하는 함수
function getLabelPriority(label: string | undefined) {
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
 * 커넥션을 정렬하는 함수
 * 라벨을 기준으로 먼저 정렬하고, 라벨이 같은 경우 fromLane을 기준으로 정렬하고,
 * fromLane이 같은 경우 toLane으로 정렬한다.
 *
 * @param connections
 * @returns
 */
function sortConnections(connections: Connection[]) {
  const sortedConnections = connections.sort((con1, con2) => {
    // 라벨을 기준으로 먼저 정렬
    const labelPriorityDiff =
      getLabelPriority(con1.label) - getLabelPriority(con2.label);
    if (labelPriorityDiff !== 0) {
      return labelPriorityDiff;
    }

    // 라벨이 같은 경우 fromLane을 기준으로 정렬
    if (con1.fromLane !== con2.fromLane) {
      return con1.fromLane - con2.fromLane;
    }

    // fromLane이 같은 경우 toLane으로 정렬
    return con1.toLane - con2.toLane;
  });
  return sortedConnections;
}

export { sortConnections };
