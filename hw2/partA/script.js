var camera, scene, renderer;
var terrain, water, skybox;
var shaders = {};
var heightmap;
var input = new Input();
var lastFrameTime = 0;
var cubemap;

load();
function load() {
    var todo = 7;

    cubeMap = new THREE.CubeTextureLoader()
	.setPath( './skybox/' )
	.load([
	    'posx.jpg',
	    'negx.jpg',
	    'posy.jpg',
	    'negy.jpg',
	    'posz.jpg',
	    'negz.jpg'
	]);

    (new THREE.TextureLoader()).load('heightmap.jpg', tex => {
        heightmap = tex;
        if(--todo == 0) {
            init();
        }
    });
    
    var fileLoader = new THREE.FileLoader();
    ['terrain.vert', 'terrain.frag',
     'water.vert', 'water.frag',
     'skybox/skybox.vert', 'skybox/skybox.frag'].forEach(name => {
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

    var planeGeometry = new THREE.PlaneGeometry(1, 1, 200, 200);
    terrain = new THREE.Mesh(planeGeometry, terrainMaterial);
    terrain.rotation.x = 3*Math.PI/2;
    scene.add(terrain);
    
    var waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { type: "1f", value: 0 }
        },
        vertexShader: shaders["water.vert"],
        fragmentShader: shaders["water.frag"]
    });

    var skyboxMaterial = new THREE.ShaderMaterial({
        uniforms: {
            cubeMap: { type: "t", value: cubeMap }
        },
        vertexShader: shaders["skybox/skybox.vert"],
        fragmentShader: shaders["skybox/skybox.frag"]
    });
    skyboxMaterial.depthWrite = false;
    skyboxMaterial.side = THREE.BackSide;
    
    var cubeGeometry = new THREE.BoxGeometry(2000, 2000, 2000);
    skybox = new THREE.Mesh(cubeGeometry, skyboxMaterial);
    scene.add(skybox);
    
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
