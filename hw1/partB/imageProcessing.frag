precision highp float;
precision highp int;
uniform sampler2D t1;

//need to know the resolution of texture so that we can grab neighbors of current pixel
uniform float rx;
uniform float ry;

uniform float intensity;
uniform mat3 kernel;

varying vec2 UV;

void main() {
  vec2 texel = vec2( 1.0 / rx, 1.0 / ry );

  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  for(int i=0; i<3; i++) {
    mat3 t;
    for(int x = -1; x <= 1; x++) {
      for(int y = -1; y <= 1; y++) {
        t[x+1][y+1] = texture2D( t1, UV + texel * vec2( x, y ) )[i];
      }
    }

    float value = dot(kernel[0].xyz, t[0].xyz) + dot(kernel[1].xyz, t[1].xyz) + dot(kernel[2].xyz, t[2].xyz);
    gl_FragColor[i] = value;
  }
}
