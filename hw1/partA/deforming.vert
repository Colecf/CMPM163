uniform float frame;
varying vec3 N, V;

void main() {
  vec3 alteredPosition = position+((sin(frame)+1.0)*0.2*position*normal.xyz);
  V = vec3(modelMatrix*vec4(alteredPosition, 1.0));
  N = vec3(normalize(modelMatrix * vec4(normal, 0.0)));
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(alteredPosition, 1.0);
}
