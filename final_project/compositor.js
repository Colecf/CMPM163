var compositorVertexShader = `
void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;
var compositorFragmentShader = `
uniform vec2 iResolution;
uniform sampler2D textures[NUM_TEXTURES];

void main() {
  vec2 uv = gl_FragCoord.xy / iResolution;
  gl_FragColor.a = 1.0;
  gl_FragColor.rgb = texture2D(textures[0], uv).rgb;
  for(int i=1; i<NUM_TEXTURES; i++) {
    vec4 curr = texture2D(textures[i], uv);
    gl_FragColor.rgb += curr.rgb * curr.a;
  }
  gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
}
`;

function Compositor(framebuffers) {
    var geo = new THREE.PlaneGeometry(1, 1);
    this.scene = new THREE.Scene();
    var frag = "#define NUM_TEXTURES "+framebuffers.length+"\n"+
            compositorFragmentShader;
    this.planeMaterial = new THREE.ShaderMaterial({
        uniforms: {
            textures: { type: 'tv', value: framebuffers.map(x => x.texture)},
            iResolution: { type: "2f", value:
                           [window.innerWidth, window.innerHeight] }
        },
        vertexShader: compositorVertexShader,
        fragmentShader: frag
    });
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1),
                                this.planeMaterial);
    this.scene.add(this.plane);
    this.camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, 0.1, 1000 );
    this.camera.position.z = 50;

    var t = this;
    this.render = function(renderer, FBO) {
        if(FBO) {
            renderer.render(t.scene, t.camera, FBO);
        } else {
            renderer.render(t.scene, t.camera);
        }
    };
}
