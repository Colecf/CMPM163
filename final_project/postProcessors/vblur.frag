uniform sampler2D inputTexture;
uniform vec2 iResolution;
uniform float radius;

#define MAX_RADIUS 100.0

void main() {
  float sigma = 20.0;
  float weight = 5.0/sqrt(2.0*3.14159*pow(sigma, 2.0));
  float powConstant = -1.0/(2.0*pow(sigma, 2.0));
  vec2 texel = vec2(1.0)/iResolution;
  vec2 c = gl_FragCoord.xy/iResolution;
  vec4 result = vec4(0.0);
  for(float i=0.0; i <=MAX_RADIUS*2.0; i++) {
    float ri = i-radius;
    result += exp(pow(ri, 2.0)*powConstant)*weight*texture2D(inputTexture,
                                    vec2(c.x, c.y+ri*texel.y));
    
    if(ri >= radius) {
      break;
    }
  }
  result = clamp(result, 0.0, 1.0);
  result.a = clamp(1.0,0.0,1.0);
  gl_FragColor = result;
}
