uniform sampler2D heightMap;
varying vec3 N, V;
varying vec2 vUV;
varying float displacement;

void main() {
  displacement = texture2D(heightMap, uv).r*0.2;
  vec4 alteredPosition = modelMatrix*vec4(position+displacement*normal.xyz, 1.0);
  V = alteredPosition.xyz;
  N = vec3(normalize(modelMatrix * vec4(normal, 0.0)));
  vUV = uv;
  gl_Position = projectionMatrix * viewMatrix * alteredPosition;
}
