precision mediump float;
uniform float blurAmount;
uniform sampler2D inputTexture;
uniform float iTime;

varying vec2 vUv;

void main() {
	vec2 blur = blurAmount * vec2( cos(iTime), sin(iTime));
	vec4 red = texture2D(inputTexture, vUv + blur);
	vec4 green = texture2D(inputTexture, vUv);
	vec4 blue = texture2D(inputTexture, vUv - blur);
	gl_FragColor = vec4(red.r, green.g, blue.b, green.a);
}
