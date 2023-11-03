varying vec3 vColor;
// varying float vAlpha;
// varying vec2 vRandom;

uniform float uColor;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {

  if(distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {
    discard;
  }

  vec4 color1 = vec4(0.58, 0.63, 0.72, 1.0);
  vec4 color2 = vec4(0.44, 0.41, 0.45, 1.0);
  vec4 color3 = vec4(0.46, 0.5, 0.57, 1.0);

  // gl_FragColor = vec4(vColor, vAlpha);
  // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

  // 0〜1に正規化
  // float normalizedRandomValue = (vRandom.x + 2.0) / 4.0;
  // // 色の配分
  // if (normalizedRandomValue < 0.3) {
  //     gl_FragColor = color1;
  // } else if (normalizedRandomValue < 0.6) {
  //     gl_FragColor = color2;
  // } else {
  //     gl_FragColor = color3;
  // }



  // float rand = random(gl_PointCoord.xy);
  // // 色の配分
  // if (rand < 0.3) {
  //     gl_FragColor = color1;
  // } else if (rand < 0.6) {
  //     gl_FragColor = color2;
  // } else {
  //     gl_FragColor = color3;
  // }

  gl_FragColor = vec4(vColor, 1.0);
}