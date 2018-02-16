uniform float time;
uniform float reflectivity;
varying vec3 V, N;
varying vec2 vUV;
uniform samplerCube skybox;

void main() {
  vec3 reflection = reflect(V-cameraPosition, N);
  gl_FragColor = mix(vec4(0.0, 1.0, 1.0, 1.0), textureCube(skybox, reflection), reflectivity);
}
