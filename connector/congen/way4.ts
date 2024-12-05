import type { Connection } from "../connection.manager";

function generate(incomingEdge, outEdges): Connection[] {
  const inComingEdgeId = incomingEdge.properties.LINK_ID;

  const connections: Connection[] = [];
  // console.log(outgoingEdges);

  // 1:u, 0:l, 2:r, 3:s
  outEdges.forEach((outgoing: any, index: number) => {
    const edge = outgoing.edge;
    const outgoingEdgeId = edge.properties.LINK_ID;
    if (index === 0) {
      // u-turn
      // connections.push({
      //   fromEdge: inComingEdgeId,
      //   toEdge: edge.properties.LINK_ID,
      //   fromLane: 0,
      //   toLane: 0,
      // });
    } else if (index === 1) {
      // left
      // connections.push({
      //   from: inComingEdgeId,
      //   to: outgoingEdgeId,
      //   fromLane: 0,
      //   toLane: 0,
      //   label: "left",
      // });

      connections.push({
        from: inComingEdgeId,
        to: outgoingEdgeId,
        fromLane: incomingEdge.properties.LANES - 1,
        toLane: edge.properties.LANES - 1,
        label: "left",
      });
    } else if (index === 2) {
      // straight
      connections.push({
        from: inComingEdgeId,
        to: outgoingEdgeId,
        fromLane: 0,
        toLane: 0,
        label: "straight",
      });
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
    } else {
      // 우회전
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
