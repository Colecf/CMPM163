precision highp float;

uniform vec2 iResolution;
uniform sampler2D inputTexture;
uniform float pixelAmt;

void main() {
  // Alternate implementation
  //gl_FragColor = texture2D(inputTexture, floor((gl_FragCoord.xy/iResolution)*pixelAmt)/pixelAmt);

  vec2 vUV = gl_FragCoord.xy / iResolution * vec2(pixelAmt, pixelAmt);
  
  // pixelAmount
  vec2 pixelAmount = vec2( 0.05 );
  vec2 x     = fract( vUV );
  vec2 x_    = clamp( 0.5 / pixelAmount * x, 0.0, 0.5 ) +
               clamp( 0.5 / pixelAmount * ( x - 1.0 ) + 0.5,
                	  0.0, 0.5 );

  vec2 texCoord = ( floor( vUV ) + x_) / vec2( pixelAmt, pixelAmt );
  gl_FragColor  = texture2D( inputTexture, texCoord );
}
