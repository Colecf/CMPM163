uniform samplerCube cubeMap;
varying vec3 V, N;
varying vec2 vUV;

void main() {
  gl_FragColor = textureCube(cubeMap, V);// + vec4(V, 0.0);
}
