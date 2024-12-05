//  레인 유틸리티
//  2024.09.01
//  구연헌

/**
 * 두 점 사이의 거리를 구하는 함수
 *
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 */
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
}

/**
 * P1에서 P2 방향으로 일정 비율만큼 이동한 점 P3를 찾는 함수
 * @param p1
 * @param p2
 * @param desiredDistance
 * @returns
 */
function findP3(p1, p2, desiredDistance) {
  const totalDistance = distance(p1, p2);
  const ratio = desiredDistance / totalDistance;

  return [p1[0] + ratio * (p2[0] - p1[0]), p1[1] + ratio * (p2[1] - p1[1])];
}

function calcAngle(source, target) {
  const dx = Array.isArray(target)
    ? target[0] - source[0]
    : target.x - source.x;
  const dy = Array.isArray(target)
    ? target[1] - source[1]
    : target.y - source.y;
  let r = Math.atan2(dy, dx);
  if (r < 0) {
    r = r + Math.PI * 2;
  }
  return (r * 180) / Math.PI;
}

/**
 * 두 점을 지나는 직선의 방향을 결정하는 함수
 * 교차로에서 진입하는 차선에가 나가는 차선에 대해 왼쪽, 직진, 오른쪽 방향을 결정한다.
 */
function determineDirection(
  center,
  point1,
  point2
): "left" | "straight" | "right" {
  let c, p1, p2;
  if (Array.isArray(center)) {
    c = { x: center[0], y: center[1] };
    p1 = { x: point1[0], y: point1[1] };
    p2 = { x: point2[0], y: point2[1] };
  }
  c = center;
  p1 = point1;
  p2 = point2;

  // 중점에서 p1으로의 벡터
  const v1 = { x: p1.x - c.x, y: p1.y - c.y };

  // 중점에서 p2로의 벡터
  const v2 = { x: p2.x - c.x, y: p2.y - c.y };

  // 각도 계산
  const angle1 = Math.atan2(v1.y, v1.x);
  const angle2 = Math.atan2(v2.y, v2.x);

  // 각도 차이 계산
  let angleDiff = angle2 - angle1;

  // 각도 차이를 -π에서 π 사이로 정규화
  if (angleDiff > Math.PI) {
    angleDiff -= 2 * Math.PI;
  } else if (angleDiff < -Math.PI) {
    angleDiff += 2 * Math.PI;
  }

  // 15도를 라디안으로 변환 (약 0.26 라디안)
  const threshold = (30 * Math.PI) / 180;

  // 방향 결정

  if (
    Math.abs(angleDiff) <= Math.PI + threshold &&
    Math.abs(angleDiff) >= Math.PI - threshold
  ) {
    return "straight";
  } else if (angleDiff < 0) {
    return "left";
  } else {
    return "right";
  }
}

export { findP3, calcAngle, determineDirection };
