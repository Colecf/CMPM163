uniform float frame;
varying vec3 N, V;

void main() {
  V = vec3(modelMatrix*vec4(position, 1.0));
  N = vec3(normalize(modelMatrix * vec4(normal, 0.0)));
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
