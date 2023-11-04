varying vec3 vColor;
// varying float vAlpha;
// varying vec2 vRandom;

// uniform float uColor;

void main() {

  if(distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {
    discard;
  }

  gl_FragColor = vec4(vColor, 1.0);
}