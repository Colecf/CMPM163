var camera, scene, renderer;
var shaders = {};
var textures = {};

load();
function load() {
    var shaderNames = ['scene.vert', 'scene.frag'];
    var todo = shaderNames.length;

    var fileLoader = new THREE.FileLoader();
    shaderNames.forEach(name => {
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
