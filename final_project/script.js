var camera, scene, renderer;
var shaders = {};
var textures = {};

load();
function load() {
    var todo = 2;

    var fileLoader = new THREE.FileLoader();
    ['scene.vert', 'scene.frag'].forEach(name => {
        fileLoader.load(name, data => {
            shaders[name] = data;
            if(--todo == 0) {
                init();
            }
        });
    });
}

function init() {
    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x999999 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, 0.1, 1000 );
    camera.position.z = 0.3;

    window.addEventListener( 'resize', onWindowResize, false );

    var gui = new dat.GUI();
    //gui.add(plane.material.uniforms.timeScale, "value", 0, 0.01).name("Time scale");
    
    animate();
}

function animate() {
    requestAnimationFrame( animate );
    var time = performance.now();
    //plane.material.uniforms.time.value = time;
    renderer.render( scene, camera );
}

function onWindowResize( event ) {
    //plane.material.uniforms.iResolution.value = [window.innerWidth, window.innerHeight];
    renderer.setSize( window.innerWidth, window.innerHeight );
}
