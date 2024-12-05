import type { Connection } from "../connection.manager";

function generate(incomingEdge, outEdges): Connection[] {
  const inComingEdgeId = incomingEdge.properties.LINK_ID;

  const connections: Connection[] = [];
  outEdges.forEach((outgoing, index) => {
    const edge = outgoing.edge;
    const outgoingEdgeId = edge.properties.LINK_ID;

    const direction = outgoing.direction;

    if (index === 0) {
      // u-turn
      // ignore
    } else if (index === 1) {
      // 직진 또는 좌회전 판단
      // 차선이 줄어드는지 늘어나는지 판단 로직이 추가 되어야 한다.

      const inLanesNum = incomingEdge.properties.LANES;
      const outLanesNum = edge.properties.LANES;

      if (direction === "straight") {
        const outLanes = new Array(outLanesNum)
          .fill(0)
          .map((_, i) => outLanesNum - i - 1);
        for (let i = inLanesNum - 1, j = 0; i > 0; i--, j++) {
          if (outLanes[j] >= 0) {
            connections.push({
              from: inComingEdgeId,
              to: outgoingEdgeId,
              fromLane: i,
              toLane: outLanes[j],
              label: "straight",
            });
          }
        }
        return;
      }

      if (direction === "left") {
        if (inLanesNum > outLanesNum) {
          const outLanes = new Array(outLanesNum)
            .fill(0)
            .map((_, i) => outLanesNum - i - 1);
          for (let i = inLanesNum - 1, j = 0; i >= 0; i--, j++) {
            if (outLanes[j] >= 0) {
              connections.push({
                from: inComingEdgeId,
                to: outgoingEdgeId,
                fromLane: i,
                toLane: outLanes[j],
                label: "left",
              });
            }
          }
        } else {
          const outLanes = new Array(outLanesNum)
            .fill(0)
            .map((_, i) => outLanesNum - i - 1);
          for (let i = inLanesNum - 1, j = 0; i > 0; i--, j++) {
            if (outLanes[j] >= 0) {
              connections.push({
                from: inComingEdgeId,
                to: outgoingEdgeId,
                fromLane: i,
                toLane: outLanes[j],
                label: "left",
              });
            }
          }
        }
      }
    } else {
      // 직진 또는 우회전 판단
      // console.log(
      //   incomingEdge.properties.LANES,
      //   edge.properties.LANES,
      //   outgoing.ANGLE2
      // );
      if (direction === "straight") {
        for (let i = 1; i < incomingEdge.properties.LANES; i++) {
          if (i < edge.properties.LANES) {
            connections.push({
              from: inComingEdgeId,
              to: outgoingEdgeId,
              fromLane: i,
              toLane: i,
              label: "straight",
            });
          }
        }
      }
      // // right
      connections.push({
        from: inComingEdgeId,
        to: outgoingEdgeId,
        fromLane: 0,
        toLane: 0,
        label: "right",
      });
    }
  });
  return connections;
}

export { generate };
