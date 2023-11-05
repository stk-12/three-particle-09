varying vec3 vColor;
// varying float vAlpha;
// varying vec2 vRandom;

// uniform float uColor;

void main() {

  if(distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {
    discard;
  }

  float alpha = 1.0;
  if(vColor.r < 0.2) {
    alpha = 0.0;
  }

  gl_FragColor = vec4(vColor, alpha);
}