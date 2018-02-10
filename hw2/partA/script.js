var camera, scene, renderer;
var terrain, water;
var shaders = {};
var heightmap;
var input = new Input();
var lastFrameTime = 0;

load();
function load() {
    var todo = 5;
    (new THREE.TextureLoader()).load('heightmap.jpg', tex => {
        heightmap = tex;
        if(--todo == 0) {
            init();
        }
    });
    
    var fileLoader = new THREE.FileLoader();
    ['terrain.vert', 'terrain.frag', 'water.vert', 'water.frag'].forEach(name => {
        fileLoader.load(name, data => {
            shaders[name] = data;
            if(--todo == 0) {
                init();
            }
        });
    });
}

function init() {
    camera = new FirstPersonCamera(input);
    camera.position.y = 0.2;
    scene = new THREE.Scene();
    scene.add(camera.yaw);
    console.log(heightmap);
    var terrainMaterial = new THREE.ShaderMaterial({
        uniforms: {
            heightMap: { type: "t", value: heightmap }
        },
        vertexShader: shaders["terrain.vert"],
        fragmentShader: shaders["terrain.frag"],
        //blending:       THREE.AdditiveBlending,
	//depthTest:      false,
	transparent:    true
    });
    var waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { type: "1f", value: 0 }
        },
        vertexShader: shaders["water.vert"],
        fragmentShader: shaders["water.frag"]
    });
    var planeGeometry = new THREE.PlaneGeometry(1, 1, 100, 100);
    terrain = new THREE.Mesh(planeGeometry, terrainMaterial);
    terrain.rotation.x = 3*Math.PI/2;
    scene.add(terrain);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x999999 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    input.setup(document.body);

    window.addEventListener( 'resize', onWindowResize, false );
    animate();
}

function animate() {
    requestAnimationFrame( animate );
    var time = performance.now();
    var delta = time - lastFrameTime;
    camera.compute(delta);

    renderer.render( scene, camera.camera );

    lastFrameTime = time;
}

function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
