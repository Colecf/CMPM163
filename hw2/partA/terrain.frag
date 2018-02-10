//uniform float frame;
varying vec3 V, N;
varying vec2 vUV;
uniform sampler2D heightMap;

void main() {
  gl_FragColor = texture2D(heightMap, vUV);
  if(gl_FragColor.r <= 0.02 &&
     gl_FragColor.g <= 0.02 &&
     gl_FragColor.b <= 0.02) {
    gl_FragColor.a = 0.0;
  }
}
