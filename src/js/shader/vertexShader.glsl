attribute vec3 color;
// attribute float alpha;
attribute vec3 aRandom;

varying vec3 vColor;
// varying float vAlpha;
// varying vec2 vRandom;

uniform float uTime;


// float random(vec2 st) {
//   return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
// }
// float randomRange(vec2 st) {
//   return 2.0 * random(st) - 1.0;
// }

void main() {
  vColor = color;
  // vAlpha = alpha;
  // vRandom = random;
  vec3 pos = position;

  // float randValue = randomRange(pos.xy);

  // pos.x += randValue;
  // pos.y += randValue;

  // pos.x += random.x;
  // pos.y += random.y;


  float time = uTime * 0.05;
  vec3 random = (aRandom * 10.0) + 1.0;
  pos.x += 5.0 * sin((time + random.x) * random.y);
  pos.y += 5.0 * cos((time + random.y) * random.x);
  pos.z += 10.0 * cos((time + random.z) * random.x);

  // float offsetTime = uTime + aRandom.x * 50.0;  // aRandom.xをオフセットとして使用
  // float speed = 1.0 + aRandom.y * 2.0;  // aRandom.yを速度の乗数として使用
  // pos.x += 2.0 * sin(offsetTime * speed);

  vec4 modelPosition = modelViewMatrix * vec4(pos, 1.0);

  gl_Position = projectionMatrix * modelPosition;
  // gl_PointSize = 2.0;
  gl_PointSize = 1.0 + 3000.0 / -modelPosition.z;
}