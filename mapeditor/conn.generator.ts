//    connection generator function
//    2024.09.23
//    beanpole

import { calcAngle, determineDirection } from "./geo.utils";
import type { EdgeFeature } from "./map.utils";
/**
 * Generate connections between incoming edge and outgoing edges
 * 대상 엣지에 대한 나가는 엣지들에 대한 상대 각도를 계산하여 정렬하고
 * 이를 기반으로 좌회전, 직진, 우회전을 판단하여 연결을 생성한다.
 *
 * findMarker 는 엣지의 마커 위치를 찾는 함수 이다.
 * 이를 통해 붙어 있는 엣지들의 마커 위치를 찾아내어 각도를 계산한다.
 *
 */
function generateConnections(
  // node: maptalks.Geometry,
  nodeCoordinates: { x: number; y: number },
  incomingEdge: EdgeFeature,
  outgoingEdges: EdgeFeature[],
  findMarker: (linkId: string, lane: number) => maptalks.Geometry | undefined
) {
  const inEdgeMarker = findMarker(
    incomingEdge.properties.LINK_ID,
    0
  ) as maptalks.Marker;

  const inComingEdgeId = incomingEdge.properties.LINK_ID;

  const sourceEdgeCoordinates = inEdgeMarker
    ? inEdgeMarker.getCoordinates()
    : undefined;
  // const p1 = findMarker(incomingEdge.properties.LINK_ID, 0);

  // 들어오는 엣지와 중심 노드 사이의 각도
  // 나가는 엣지와의 각도 계산시 회전을 위한 기준 각도로 사용한다.
  const angleBetweenNodeAndInEdge = calcAngle(
    sourceEdgeCoordinates,
    // (node as maptalks.Marker).getCoordinates()
    nodeCoordinates
  );

  const outEdges = outgoingEdges.map((edge: EdgeFeature) => {
    const outEdgeMarker = findMarker(
      edge.properties.LINK_ID,
      0
    ) as maptalks.Marker;

    const angleBetweenInEdgeOutEdge = calcAngle(
      outEdgeMarker.getCoordinates(),
      inEdgeMarker.getCoordinates()
    );

    // 중심점과 각도를 계산하면 문제가 발생한다.
    // 기준선을 들어오는 엣지의 좌표를 이용해서 선을 긋는다.
    const direction = determineDirection(
      // node.getCoordinates(),
      // inEdgeMarker.getCoordinates(),
      incomingEdge.coordinates[incomingEdge.coordinates.length - 1],
      incomingEdge.coordinates[0],
      outEdgeMarker.getCoordinates()
    );

    return {
      LINK_ID: edge.properties.LINK_ID,
      angle:
        (angleBetweenInEdgeOutEdge - angleBetweenNodeAndInEdge + 360) % 360,
      edge: edge,

      direction,
    };
  });

  // 유턴 -> 좌회전 -> 직진 -> 우회전 순으로 정렬
  outEdges.sort((a, b) => b.angle - a.angle);

  if (outEdges.length === 3) {
    return handle3(incomingEdge, outEdges);
  }

  return handle4(incomingEdge, outEdges);
}

function handle3(incomingEdge: EdgeFeature, outEdges: any[]): Connection[] {
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

      const inLanesNum = +incomingEdge.properties.LANES;
      const outLanesNum = edge.properties.LANES;

      console.log(
        inComingEdgeId,
        "-->",
        edge.properties.LINK_ID,
        "direction:",
        direction
      );
      if (direction === "straight") {
        const outLanes = new Array(outLanesNum)
          .fill(0)
          .map((_, i) => outLanesNum - i - 1);
        for (let i = inLanesNum - 1, j = 0; i >= 0; i--, j++) {
          connections.push({
            from: inComingEdgeId,
            to: outgoingEdgeId,
            fromLane: i,
            toLane: outLanes[j],
            label: "straight",
          });
        }
        return;
      } else if (direction === "left") {
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
        return;
      } else {
        // console.log("right--->");
        // connections.push({
        //   from: inComingEdgeId,
        //   to: outgoingEdgeId,
        //   fromLane: inComingEdgeId.properties.LANES - 1,
        //   toLane: outLanesNum - 1,
        //   label: "right",
        // });
      }
    } else {
      // 직진 또는 우회전 판단
      // console.log(
      //   incomingEdge.properties.LANES,
      //   edge.properties.LANES,
      //   outgoing.ANGLE2
      // );

      const inLanesNum = incomingEdge.properties.LANES;
      const outLanesNum = edge.properties.LANES;

      if (direction === "straight") {
        const outLanes = new Array(outLanesNum)
          .fill(0)
          .map((_, i) => outLanesNum - i - 1);
        for (let i = inLanesNum - 1, j = 0; i >= 0; i--, j++) {
          // if (outLanes[j] >= 0) {
          connections.push({
            from: inComingEdgeId,
            to: outgoingEdgeId,
            fromLane: i,
            toLane: outLanes[j],
            label: "straight",
          });
          // }
        }
        return;
      } else if (direction === "left") {
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
        return;
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

function handle4(incomingEdge: EdgeFeature, outEdges: any[]): Connection[] {
  const inEdgeId = incomingEdge.properties.LINK_ID;
  const inEdgeLanes = +incomingEdge.properties.LANES;

  const connections: Connection[] = [];

  function left(outgoingEdge: any) {
    const outgoingEdgeId = outgoingEdge.properties.LINK_ID;
    const outEdgeLanes = +outgoingEdge.properties.LANES;

    const isLaneReduction = inEdgeLanes > outEdgeLanes;

    // 가장 안쪽 차선 좌회전 설정
    connections.push({
      from: inEdgeId,
      to: outgoingEdgeId,
      fromLane: inEdgeLanes - 1,
      toLane: outEdgeLanes - 1,
      label: "left",
    });
  }

  function straight(outgoingEdge: any) {
    const outgoingEdgeId = outgoingEdge.properties.LINK_ID;
    const outEdgeLanes = +outgoingEdge.properties.LANES;

    const isLaneReduction = inEdgeLanes > outEdgeLanes;
    const isLaneIncrease = inEdgeLanes < outEdgeLanes;
    const isSameLanes = inEdgeLanes === outEdgeLanes;
    // 직진차로
    // 차선이 줄어드는 경우 고려
    // 차선이 늘어나는 경우 고려

    if (isSameLanes) {
      for (let i = 0; i < inEdgeLanes; i++) {
        if (i < outgoingEdge.properties.LANES) {
          connections.push({
            from: inEdgeId,
            to: outgoingEdgeId,
            fromLane: i,
            toLane: i,
            label: "straight",
          });
        }
      }
      return;
    }
    if (isLaneReduction) {
      console.log("차선이 줄어드는 경우");
      for (
        let i = 1, j = 0;
        i < inEdgeLanes - 1 && j < outEdgeLanes;
        i++, j++
      ) {
        connections.push({
          from: inEdgeId,
          to: outgoingEdgeId,
          fromLane: i,
          toLane: j,
          label: "straight",
        });
        console.log(j, outEdgeLanes);
      }

      // 차선이 3개 이상 차이가 나는 경우
      // fixme please
      if (inEdgeLanes - outEdgeLanes >= 3) {
        connections.push({
          from: inEdgeId,
          to: outgoingEdgeId,
          fromLane: 3,
          toLane: 1,
          label: "straight",
        });
      }

      return;
    }

    if (isLaneIncrease) {
      const possibleLanes = new Array(outEdgeLanes).fill(0).map((_, i) => i);
      let laneIndex = 0;
      for (let i = 0; i < inEdgeLanes; i++) {
        connections.push({
          from: inEdgeId,
          to: outgoingEdgeId,
          fromLane: i,
          toLane: possibleLanes[laneIndex++],
          label: "straight",
        });
        connections.push({
          from: inEdgeId,
          to: outgoingEdgeId,
          fromLane: i,
          toLane: possibleLanes[laneIndex++],
          label: "straight",
        });
      }
    }

    return;
  }

  function right(outgoingEdge: any) {
    const outgoingEdgeId = outgoingEdge.properties.LINK_ID;
    const outEdgeLanes = +outgoingEdge.properties.LANES;

    const isLaneReduction = inEdgeLanes > outEdgeLanes;

    // 가장 바깥쪽 차선 우회전 설정
    connections.push({
      from: inEdgeId,
      to: outgoingEdgeId,
      fromLane: 0,
      toLane: 0,
      label: "right",
    });
  }

  outEdges.forEach((outgoing, index) => {
    const outgoingEdge = outgoing.edge;
    const outEdgeLanes = +outgoingEdge.properties.LANES;

    const outgoingEdgeId = outgoingEdge.properties.LINK_ID;
    const isLaneReduction = inEdgeLanes > outEdgeLanes;

    switch (index) {
      case 0:
        break;
      case 1:
        left(outgoingEdge);
        break;
      case 2:
        straight(outgoingEdge);
        break;
      case 3:
        right(outgoingEdge);
        break;
    }
  });
  return connections;
}

interface Connection {
  from: string;
  to: string;
  fromLane: number;
  toLane: number;
  label?: string;
  phases?: any[];
}

export { generateConnections };

export type { Connection };
