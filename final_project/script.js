var camera, scene, renderer;
var shaders = {};
var textures = {};
var postProcessors = {};
var postProcessingNames = ['none', 'squares'];
var options = {
    activePostProcessor: 'none'
};

/*function nextPO2(x) {
    return Math.pow(2, Math.ceil(Math.log(x)/Math.log(2)));
}*/

load();
function load() {
    var shaderNames = [];
    var todo = shaderNames.length + postProcessingNames.length;

    var fileLoader = new THREE.FileLoader();
    shaderNames.concat(postProcessingNames.map(function(x) {
        return 'postProcessors/'+x+'.frag';
    })).forEach(name => {
        fileLoader.load(name, data => {
            var noExtension = name.substring('postProcessors/'.length, name.length-5);
            if(postProcessingNames.indexOf(noExtension) >= 0) {
                postProcessors[noExtension] = new PostProcessor(data);
            } else {
                shaders[name] = data;
            }
            if(--todo == 0) {
                init();
            }
        });
    });
}

function init() {
    scene = new THREE.Scene();

    var light1 = new THREE.PointLight(0xff0000, 1, 0);
    light1.position.set(0.0, 5.0, 5.0);
    scene.add(light1);
    var light2 = new THREE.PointLight(0x0000ff, 1, 0);
    light2.position.set(0.0, -5.0, 5.0);
    scene.add(light2);
    var basicMat = new THREE.MeshPhongMaterial({});

    var box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), basicMat);
    box.rotation.x = 20;
    box.rotation.z = 20;
    scene.add(box);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x999999 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.1, 50 );
    camera.position.z = 5;

    //camera = new THREE.OrthographicCamera( -1.5, 1.5, 1.5, -1.5, 0.1, 1000 );
    //camera.position.z = 0.3;

    window.addEventListener( 'resize', onWindowResize, false );

    var gui = new dat.GUI();
    //gui.add(plane.material.uniforms.timeScale, "value", 0, 0.01).name("Time scale");
    gui.add(options, 'activePostProcessor', postProcessingNames).name("Post Processor");
    
    animate();
}

var FBO = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
                                      { minFilter: THREE.MinFilter,
                                        magFilter: THREE.LinearFilter
                                      });
function animate() {
    requestAnimationFrame( animate );
    var time = performance.now();

    renderer.render( scene, camera, FBO);
    postProcessors[options.activePostProcessor].render(renderer, FBO);
}

function onWindowResize( event ) {
    FBO.width = window.innerWidth;
    FBO.height = window.innerHeight;
    //plane.material.uniforms.iResolution.value = [window.innerWidth, window.innerHeight];
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}
