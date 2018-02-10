//uniform float frame;
varying vec3 V, N;
varying vec2 vUV;
uniform sampler2D heightMap;

void main() {
  gl_FragColor = texture2D(heightMap, vUV);
}
