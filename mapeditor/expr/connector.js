
/**
 *
 *
 * @param {GeoJSONFeature} incomingEdge
 * @param {GeoJSONFeature[]} outgoingEdges
 * @returns
 */
function generateConnections(incomingEdge, outgoingEdges) {
  let connections = [];
  const lanes = incomingEdge.properties.LANES


  console.log('--->', incomingEdge.properties.LINK_ID, incomingEdge.properties.LANES)

  const incomingEdgeId = incomingEdge.properties.LINK_ID

  for (let i = 0; i < lanes; i++) {
    let connection = null;
    let toEdge = null;
    if (i === 0) {  // 가장 왼쪽 레인 -> 좌회전
      toEdge = findLeftTurnEdge(outgoingEdges);
      connection = {
        fromEdge: incomingEdgeId,
        fromLane: i,
        toEdge: toEdge.properties.LINK_ID,
        toLane: Math.min(i, toEdge.properties.LANES - 1)  // 레인이 맞지 않을 경우 첫 번째 레인으로 연결
      };
    }
    else if (i === lanes - 1) {  // 가장 오른쪽 레인 -> 우회전

      toEdge = findRightTurnEdge(outgoingEdges);
      connection = {
        fromEdge: incomingEdgeId,
        fromLane: i,
        toEdge: toEdge.properties.LINK_ID,
        toLane: Math.min(i, toEdge.lanes - 1)  // 레인이 맞지 않을 경우 마지막 레인으로 연결
      };
    } else {  // 나머지 레인 -> 직진
      toEdge = findStraightEdge(outgoingEdges);
      connection = {
        fromEdge: incomingEdgeId,
        fromLane: i,
        toEdge: toEdge.properties.LINK_ID,
        toLane: Math.min(i, toEdge.lanes - 1)  // 동일한 번호의 toLane에 연결
      };
    }

    connections.push(connection);
  }

  return connections;
}

// 좌회전할 엣지를 찾는 함수
function findLeftTurnEdge(outgoingEdges) {
  // 좌회전 엣지를 찾는 로직 (예: 각도 계산 등)
  return outgoingEdges[0];  // 임의로 첫 번째 엣지로 설정
}

// 우회전할 엣지를 찾는 함수
function findRightTurnEdge(outgoingEdges) {
  // 우회전 엣지를 찾는 로직
  return outgoingEdges[outgoingEdges.length - 1];  // 임의로 마지막 엣지로 설정
}

// 직진할 엣지를 찾는 함수
function findStraightEdge(outgoingEdges) {
  // 직진 엣지를 찾는 로직 (중간에 있는 엣지 선택)
  return outgoingEdges[Math.floor(outgoingEdges.length / 2)];
}

export { generateConnections };
