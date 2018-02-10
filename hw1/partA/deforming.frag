uniform float frame;
varying vec3 V, N;

struct PointLight {
  vec3 color;
  vec3 position;
  float distance;
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

vec3 getLightColor() {
  vec3 lightInfluence = vec3(0.0);
  for(int i=0; i<NUM_POINT_LIGHTS; i++) {
    lightInfluence += pointLights[i].color * max(0.0, dot(N, normalize(pointLights[i].position - V)));
  }
  return clamp(lightInfluence, 0.0, 1.0);
}

void main() {
  gl_FragColor = vec4(getLightColor(), 1.0);
}
