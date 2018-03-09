uniform sampler2D inputTexture;
uniform vec2 iResolution;

void main() {
  gl_FragColor = texture2D(inputTexture, gl_FragCoord.xy/iResolution);
  if(mod(floor(gl_FragCoord.x/8.0), 2.0) == mod(floor(gl_FragCoord.y/8.0), 2.0)) {
    gl_FragColor = vec4(vec3(1.0) - gl_FragColor.rgb, 1.0);
  }
}
