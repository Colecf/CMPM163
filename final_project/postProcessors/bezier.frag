uniform sampler2D inputTexture;
uniform vec2 iResolution;
uniform float iTime;

#define TIMESCALE 1.

// Can't have unbounded loops in webgl :(
float fact(float n) {
  if(n == 0.) return 1.;
  if(n == 1.) return 1.;
  if(n == 2.) return 2.;
  if(n == 3.) return 6.;
  return 0.;
}

float B(float n, float i, float u) {
  return (fact(n)/(fact(i)*fact(n-i)))*pow(abs(u), i)*pow(abs(1.-u), n-i);
}

vec2 controlPoint(vec2 uv) {
  if(uv == vec2(1., 1.)) {
    return vec2(sin(iTime*TIMESCALE), cos(iTime*TIMESCALE)) * 0.5 + 0.5;
  }
  return vec2(uv/2.);
}

vec2 bez(vec2 uv) {
  vec2 result = vec2(0.);
  for(float i=0.; i<2.5; i++) {
    for(float j=0.; j<2.5; j++) {
      result += B(2., i, uv.x)*B(2., j, uv.y)*controlPoint(vec2(i, j));
    }
  }
  return result;
}

void main() {
  vec2 uv = gl_FragCoord.xy/iResolution;
  gl_FragColor = texture2D(inputTexture, bez(uv));
  if(uv.x < 0. || uv.y < 0. || uv.x > 1. || uv.y > 1.) {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
  }
}
