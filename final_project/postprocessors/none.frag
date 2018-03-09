uniform sampler2D inputTexture;
uniform vec2 iResolution;

void main() {
  gl_FragColor = texture2D(inputTexture, gl_FragCoord.xy/iResolution);
}
