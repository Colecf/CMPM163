var postProcessingVertexShader = `
void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

function PostProcessor(frag, uniforms) {
    if(!uniforms) uniforms = {};
    
    this.planeMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([uniforms, {
            inputTexture: { type: 't', value: undefined },
            iResolution: { type: "2f", value: [window.innerWidth, window.innerHeight] }
        }]),
        vertexShader: postProcessingVertexShader,
        fragmentShader: frag
    });
    this.plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.planeMaterial);
    this.camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, 0.1, 1000 );
    this.camera.position.z = 50;
    this.scene = new THREE.Scene();
    this.scene.add(this.plane);

    var t = this;
    this.render = function(renderer, input, FBO) {
        t.plane.material.uniforms.inputTexture.value = input.texture;
        if(FBO) {
            renderer.render(t.scene, t.camera, FBO);
        } else {
            renderer.render(t.scene, t.camera);
        }
    };

    this.onWindowResize = function(e) {
        t.plane.material.uniforms.iResolution.value = [window.innerWidth, window.innerHeight];
    };

    Object.defineProperties(this, {
        'uniforms': {
            get: function() { return t.planeMaterial.uniforms; },
            set: function(x) { t.planeMaterial.uniforms = x; }
        }
    });
}
