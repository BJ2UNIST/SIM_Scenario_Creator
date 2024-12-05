//  유틸리티 함수 모음
//  2024.09.01
//  last modified: 2024.11.01
//  @author beanpole

/**
 * 두 점 사이의 거리를 구하는 함수
 *
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 */
function distance(p1: number[], p2: number[]) {
  return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
}

/**
 * P1에서 P2 방향으로 일정 비율만큼 이동한 점 P3를 찾는 함수
 * @param p1
 * @param p2
 * @param desiredDistance P1에서 P2 방향으로 이동할 거리
 * @returns
 */
function findP3(p1: number[], p2: number[], desiredDistance: number) {
  const totalDistance = distance(p1, p2);
  const ratio = desiredDistance / totalDistance;

  const x = p1[0] + ratio * (p2[0] - p1[0]);
  const y = p1[1] + ratio * (p2[1] - p1[1]);
  return [x, y];
}

/**
 * 두 점 사이의 각도를 구하는 함수
 */
function calcAngle(source: any = [0, 0], target: any = [0, 0]) {
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
 * 두 점 사이의 중점을 구하는 함수
 * @param p1
 * @param p2
 * @param divider 중점을 구할 때 나눌 수 (기본값: 2)
 * @returns
 */
function getMidpoint(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  divider = 2
) {
  return {
    x: (p1.x + p2.x) / divider,
    y: (p1.y + p2.y) / divider,
  };
}

function getAngle(v: any) {
  return Math.atan2(v.y, v.x);
}

function determineDirection(c: any, p1: any, p2: any) {
  // console.log(c, p1, p2);
  // 중점에서 p1으로의 벡터
  const v1 = { x: p1.x - c.x, y: p1.y - c.y };

  // 중점에서 p2로의 벡터
  const v2 = { x: p2.x - c.x, y: p2.y - c.y };

  // 각도 계산
  const angle1 = getAngle(v1);
  const angle2 = getAngle(v2);

  // 각도 차이 계산
  let angleDiff = angle2 - angle1;

  // 각도 차이를 -π에서 π 사이로 정규화
  if (angleDiff > Math.PI) {
    angleDiff -= 2 * Math.PI;
  } else if (angleDiff < -Math.PI) {
    angleDiff += 2 * Math.PI;
  }

  // 15도를 라디안으로 변환 (약 0.26 라디안)
  const threshold = (25 * Math.PI) / 180;

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

type Point = { x: number; y: number };

/**
 * 세 점 사이의 각도를 계산하는 함수  (p1 -> p2 -> p3)
 */
function calcAngle3(p1: Point, p2: Point, p3: Point): number {
  // 벡터 계산
  const vector1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const vector2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  // 내적 계산
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;

  // 벡터의 크기 계산
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);

  // 코사인 값 계산
  const cosTheta = dotProduct / (magnitude1 * magnitude2);

  // 각도 계산 (라디안)
  let angleRadians = Math.acos(Math.min(Math.max(cosTheta, -1), 1)); // 수치 안정성을 위해 범위 제한

  // 외적 계산 (2D에서는 z 성분만 고려)
  const crossProduct = vector1.x * vector2.y - vector1.y * vector2.x;

  // 외적의 부호에 따라 각도 조정 (반시계 방향이 양수)
  if (crossProduct < 0) {
    angleRadians = 2 * Math.PI - angleRadians;
  }

  // 라디안을 도로 변환
  let angleDegrees = (angleRadians * 180) / Math.PI;

  // 소수점 둘째 자리까지 반올림
  const angle = Math.round(angleDegrees * 100) / 100;
  return angle;
}

function determineDirection2(
  p1: any,
  p2: any,
  p3: any
): "left" | "right" | "straight" {
  const angle = calcAngle3(p1, p2, p3);
  if (angle >= 0 && angle <= 100) {
    return "right";
  } else if (angle > 100 && angle <= 210) {
    return "straight";
  } else {
    return "left";
  }
}

export {
  findP3,
  getMidpoint,
  calcAngle,
  determineDirection,
  determineDirection2,
};
