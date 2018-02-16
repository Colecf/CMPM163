var camera, scene, renderer;
var terrain, water, skybox;
var shaders = {};
var textures = {};
var input = new Input();
var lastFrameTime = 0;
var cubemap;

load();
function load() {
    var todo = 10;

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

    var texLoader = new THREE.TextureLoader();
    ['heightmap2.jpg', 'snow.jpg', 'rock.png'].forEach(name => {
        texLoader.load(name, tex => {
            textures[name] = tex;
            if(--todo == 0) {
                init();
            }
        });
    });
    
    var fileLoader = new THREE.FileLoader();
    ['terrain.vert', 'terrain.frag',
     'water.vert', 'water.frag',
     'skybox/skybox.vert', 'skybox/skybox.frag',
     '../../lib/pnoise.glsl'].forEach(name => {
        fileLoader.load(name, data => {
            shaders[name] = data;
            if(--todo == 0) {
                init();
            }
        });
    });
}

function init() {
    shaders['water.vert'] = shaders['../../lib/pnoise.glsl'] + shaders['water.vert'];
    scene = new THREE.Scene();

    var terrainMaterial = new THREE.ShaderMaterial({
        uniforms: {
            heightMap: { type: "t", value: textures['heightmap2.jpg'] },
            rock: { type: "t", value: textures['rock.png'] },
            snow: { type: "t", value: textures['snow.jpg'] }
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
            time: { type: "1f", value: 0 },
            skybox: { type: "t", value: cubeMap },
            reflectivity: { type: "f", value: 0.8 },
            offsetY: { type: "f", value: 0.08 },
            waveAmplitude: { type: "f", value: 0.5 },
            waveSpeed: { type: "f", value: 0.0002 },
            waveFrequency: { type: "f", value: 15 },
            vertexResolution: { type: "f", value: 1/200 }
        },
        vertexShader: shaders["water.vert"],
        fragmentShader: shaders["water.frag"]
    });
    water = new THREE.Mesh(planeGeometry, waterMaterial);
    water.rotation.x = 3*Math.PI/2;
    scene.add(water);

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
    renderer.domElement.tabIndex = "1"; // needed to receive keyboard presses
    input.setup(renderer.domElement);
    camera = new FirstPersonCamera(input);
    camera.position.y = 0.3;
    scene.add(camera.yaw);

    window.addEventListener( 'resize', onWindowResize, false );

    var gui = new dat.GUI();
    gui.add(camera, 'moveSpeed', 0.0001, 0.001).name('Move Speed');
    var waterFolder = gui.addFolder('Water');
    waterFolder.add(water.material.uniforms.reflectivity, 'value', 0, 1).name('Reflectivity');
    waterFolder.add(water.material.uniforms.offsetY, 'value', 0, 0.2).name('Sea Level');
    waterFolder.add(water.material.uniforms.waveAmplitude, 'value', 0, 1).name('Wave Amplitude');
    waterFolder.add(water.material.uniforms.waveSpeed, 'value', 0, 0.001).name('Wave Speed');
    waterFolder.add(water.material.uniforms.waveFrequency, 'value', 0, 40).name('Wave Frequency');
    
    animate();
}

function animate() {
    requestAnimationFrame( animate );
    
    var time = performance.now();
    var delta = time - lastFrameTime;
    camera.compute(delta);
    water.material.uniforms.time.value = time;
    renderer.render( scene, camera.camera );

    lastFrameTime = time;
}

function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
