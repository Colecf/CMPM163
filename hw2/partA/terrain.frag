//uniform float frame;
varying vec3 V, N;
varying vec2 vUV;
uniform sampler2D heightMap;
uniform sampler2D rock;
uniform sampler2D snow;
varying float displacement;

void main() {
  vec4 rockColor = texture2D(rock, vUV);
  vec4 snowColor = texture2D(snow, vUV);

  gl_FragColor = mix(rockColor, snowColor, min(1.0, max(0.0, (displacement-0.10)*20.0)));
  gl_FragColor.a = 1.0;
}
