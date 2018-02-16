uniform float time;
uniform float offsetY;
uniform float waveAmplitude;
uniform float waveSpeed;
uniform float waveFrequency;
uniform float vertexResolution;

varying vec3 N, V;
varying vec2 vUV;

float calcNoise(vec3 p) {
  return pnoise(p*waveFrequency + vec3(time*waveSpeed), vec3(10.0))*waveAmplitude/20.0 + offsetY;
}

void main() {
  float noise = calcNoise(position);
  vec4 alteredPosition = modelMatrix*vec4(position+vec3(0.0, 0.0, noise), 1.0);
  V = alteredPosition.xyz;

  vec3 vecA = vec3(vertexResolution, 0.0, calcNoise(vec3(position.x+vertexResolution, position.y, 0.0))-noise);
  vec3 vecB = vec3(0.0, vertexResolution, calcNoise(vec3(position.x, position.y+vertexResolution, 0.0))-noise);
  vec3 newNormal = cross(vecA, vecB);
  N = vec3(normalize(modelMatrix * vec4(newNormal, 0.0)));
  vUV = uv;
  gl_Position = projectionMatrix * viewMatrix * alteredPosition;
}
