struct PointLight {
  vec3 color;
  vec3 position;
  float distance;
};

uniform PointLight pointLights[NUM_POINT_LIGHTS];

uniform float time;
uniform vec2 iResolution;
uniform float colorByNormal;
uniform float timeScale;

#define MAXSTEPS 100
#define EPSILON 0.001
#define NORMALDELTA 0.001

float QuinticEaseInOut(float p) {
  if(p < 0.5){
    return 1024.0 * p * p * p * p * p * p * p * p * p *p * p;
  }
  else {
    float f = ((2.0 * p) - 2.0);
    return  0.5 * f * f * f * f * f * f * f *f*f*f*f + 1.0;
  }
}

float cylinder( vec3 p, vec3 c, vec3 cy )
{
  p -= c;
  return length(p.yz-cy.xz)-cy.y;
}

float sphere(vec3 p, vec3 c, float r) {
  return length(p-c)-r;
}

float box( vec3 p, vec3 c, vec3 b) {
  return length(max(abs(p-c)-b/2.0,0.0));
}

float chairSDF(vec3 p) {
  float scene = box(p, vec3(0), vec3(0.5, 0.1, 0.5));

  scene = min(scene, box(p, vec3( 0.2, -0.25,  0.2), vec3(0.1, 0.6, 0.1)));
  scene = min(scene, box(p, vec3( 0.2, -0.25, -0.2), vec3(0.1, 0.6, 0.1)));
  scene = min(scene, box(p, vec3(-0.2, -0.25,  0.2), vec3(0.1, 0.6, 0.1)));
  scene = min(scene, box(p, vec3(-0.2, -0.25, -0.2), vec3(0.1, 0.6, 0.1)));

  for(int i=0; i<5; i++) {
    scene = min(scene, box(p, vec3(-0.2, 0.2, -0.2+float(i)*0.1), vec3(0.05, 0.4, 0.05)));
  }

  float header = cylinder(p, vec3(-0.2, 0.2, -0.25), vec3(0.25));
  header = max(header, box(p, vec3(-0.2, 0.65, 0.0), vec3(0.1, 0.5, 0.5)));

  scene = min(scene, header);
  
  return scene;
}

float carSDF(vec3 p) {
  float scene = box(p, vec3(0), vec3(0.5, 0.2, 1.0));
  scene = min(scene, max(cylinder(p, vec3(0.0, -0.3, -0.3), vec3(0.3)),
                         box(p, vec3(0.0, 1.0, 0.0), vec3(0.5, 2.0, 1.0))));
  scene = min(scene, max(cylinder(p, vec3(0.0, -0.25, -0.35), vec3(0.1)),
                         box(p, vec3(0.0, 1.0, 0.0), vec3(0.5, 10.0, 10.0))));
  scene = min(scene, max(cylinder(p, vec3(0.0, -0.25, 0.15), vec3(0.1)),
                         box(p, vec3(0.0, 1.0, 0.0), vec3(0.5, 10.0, 10.0))));
  return scene;
}

float sceneSDF(vec3 p) {
  float scene = mix(carSDF(p), chairSDF(p), QuinticEaseInOut(abs(mod(time*timeScale, 2.0)-1.0)));
  for(int i=0; i<NUM_POINT_LIGHTS; i++) {
    scene = min(scene, sphere(p, pointLights[i].position, 0.05));
  }
  return scene;
  //return sphere(p, vec3(0.0), 0.5);
}

mat3 calculateEyeRayTransformationMatrix(vec3 ro, vec3 ta, float roll) {
  vec3 ww = normalize( ta - ro );
  vec3 uu = normalize( cross(ww,vec3(sin(roll),cos(roll),0.0) ) );
  vec3 vv = normalize( cross(uu,ww));
  return mat3( uu, vv, ww );
}

vec3 getNormal(vec3 pos) {
  vec3 result;
  float center = sceneSDF(pos);
  result.x = sceneSDF(pos - vec3(NORMALDELTA, 0.0, 0.0)) - center;
  result.y = sceneSDF(pos - vec3(0.0, NORMALDELTA, 0.0)) - center;
  result.z = sceneSDF(pos - vec3(0.0, 0.0, NORMALDELTA)) - center;
  return normalize(-result);
}

void main() {
  vec2 p = (-iResolution.xy + 2.0 * gl_FragCoord.xy) / iResolution.y;
  vec3 eyePosition = vec3(sin(time*timeScale)*2.0, 2.0, cos(time*timeScale)*2.0);
  vec3 pointWeAreLookingAt = vec3(0.0);
  
  // eye, lookat, roll
  mat3 eyeTransformationMatrix = calculateEyeRayTransformationMatrix(eyePosition, pointWeAreLookingAt, 0.0);

  // 2 is lens length??
  vec3 rayDirection = normalize(eyeTransformationMatrix * vec3(p.xy , 2.0));

  vec3 pos = eyePosition;
  for(int i=0; i<MAXSTEPS; i++) {
    float sdf = sceneSDF(pos);
    if(sdf < EPSILON || abs(pos.z) > 100.0) break;
    pos += rayDirection*sdf;
  }

  if(sceneSDF(pos) < EPSILON) {
    if(colorByNormal > 0.0) {
      gl_FragColor = vec4(abs(getNormal(pos)), 1.0);
    } else {
      vec3 normal = getNormal(pos);
      vec3 diffuse = vec3(0.0);
      float spec = 0.0;
      for(int i=0; i<NUM_POINT_LIGHTS; i++) {
        vec3 lightDir = normalize(pointLights[i].position - pos);
        diffuse += pointLights[i].color * max(0.0, dot(normal, lightDir));
        //spec += pow(max(dot(rayDirection, reflect(lightDir, normal)), 0.0), 20.0);
      }
      gl_FragColor = vec4(diffuse+spec*vec3(1.0), 1.0);
      clamp(gl_FragColor, 0.0, 1.0);
    }
  } else {
    gl_FragColor = vec4(0.0);
  }
  
  gl_FragColor.a = 1.0;
}
