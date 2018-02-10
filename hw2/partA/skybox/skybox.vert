varying vec3 N, V;
varying vec2 vUV;

void main() {
  V = (modelMatrix*vec4(position, 1.0)).xyz;
  N = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  vUV = uv;
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
