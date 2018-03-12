uniform sampler2D inputTexture;
uniform vec2 iResolution;
uniform float radius;

#define MAX_RADIUS 100.0

void main() {
  float influence = 1.0/(radius*2.0+1.0);
  vec2 texel = vec2(1.0)/iResolution;
  vec2 c = gl_FragCoord.xy/iResolution;
  vec4 result = vec4(0.0);
  for(float i=0.0; i <=MAX_RADIUS*2.0; i++) {
    float ri = i-radius;
    result += influence*texture2D(inputTexture,
                                    vec2(c.x+ri*texel.x, c.y));
    
    if(ri >= radius) {
      break;
    }
  }
  result = clamp(result, 0.0, 1.0);
  result.a = clamp(result.b*10.0,0.0,1.0);
  gl_FragColor = result;
}
