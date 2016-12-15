import math from 'mathjs';
import martinez from 'martinez-polygon-clipping';

function orientation(p1, p2, p3) {
  return math.sign(math.det([[p1.x, p1.y, 1], [p2.x, p2.y, 1], [p3.x, p3.y, 1]]));
}

function intersection(s1, s2) {
  const [p1, p2] = s1;
  const [p3, p4] = s2;
  if (orientation(p1, p2, p3) * orientation(p1, p2, p4) !== 1
    && orientation(p1, p3, p4) * orientation(p2, p3, p4) !== 1) {
    return math.intersect([p1.x, p1.y], [p2.x, p2.y], [p3.x, p3.y], [p4.x, p4.y]);
  } else {
    return null;
  }
}

function intersectAll(p) {
  let currentIntersection = p[0];
  for (let i = 1; i < p.length; i += 1) {
    currentIntersection = martinez.intersection([currentIntersection], [p[i]]);
    if (currentIntersection === null || currentIntersection.length === 0) {
      return null;
    }
  }
  return currentIntersection;
}

function triangleContainsPoint(t, p) {
  const [p1, p2, p3] = t;
  return (orientation(p, p2, p3) * orientation(p1, p2, p3) !== -1)
    && (orientation(p, p1, p3) * orientation(p2, p1, p3) !== -1)
    && (orientation(p, p1, p2) * orientation(p3, p1, p2) !== -1);
}

export { intersection, triangleContainsPoint, intersectAll };
