var camera, scene, renderer;
var water, water2, skybox;
var shaders = {};
var particleSystem, options, spawnerOptions;
var cubemap;
var tick = 0;
var clock = new THREE.Clock();

load();
function load() {
    var todo = 5;

    cubeMap = new THREE.CubeTextureLoader()
	.setPath( '../partA/skybox/' )
	.load([
	    'posx.jpg',
	    'negx.jpg',
	    'posy.jpg',
	    'negy.jpg',
	    'posz.jpg',
	    'negz.jpg'
	]);
    
    var fileLoader = new THREE.FileLoader();
    ['../partA/water.vert', '../partA/water.frag',
     '../partA/skybox/skybox.vert', '../partA/skybox/skybox.frag',
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
    shaders['../partA/water.vert'] = shaders['../../lib/pnoise.glsl'] + shaders['../partA/water.vert'];
    scene = new THREE.Scene();

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
        vertexShader: shaders["../partA/water.vert"],
        fragmentShader: shaders["../partA/water.frag"]
    });
    var planeGeometry = new THREE.PlaneGeometry(1, 1, 200, 200);
    water = new THREE.Mesh(planeGeometry, waterMaterial);
    water.position.z = -5;
    scene.add(water);
    water2 = new THREE.Mesh(planeGeometry, waterMaterial);
    water2.rotation.x = 3*Math.PI/2;
    water2.position.z = -4;
    water2.position.y = -0.5;
    scene.add(water2);

    var skyboxMaterial = new THREE.ShaderMaterial({
        uniforms: {
            cubeMap: { type: "t", value: cubeMap }
        },
        vertexShader: shaders["../partA/skybox/skybox.vert"],
        fragmentShader: shaders["../partA/skybox/skybox.frag"]
    });
    skyboxMaterial.depthWrite = false;
    skyboxMaterial.side = THREE.BackSide;
    
    var cubeGeometry = new THREE.BoxGeometry(2000, 2000, 2000);
    skybox = new THREE.Mesh(cubeGeometry, skyboxMaterial);
    scene.add(skybox);

    particleSystem = new THREE.GPUParticleSystem({
	maxParticles: 250000
    });
    particleSystem.position.z = -5;
    particleSystem.position.y = -0.5;
    scene.add(particleSystem);
    options = {
        position: new THREE.Vector3(),
        positionRandomness: {x: 1.0, y:0, z:0.2},
        velocity: new THREE.Vector3(0, 1, 1),
        velocityRandomness: 1.14,
        color: 0xaaaaFF,
        colorRandomness: 0.0,
        turbulence: 0,
        lifetime: 0.08,
        size: 13,
        sizeRandomness: 1
    };

    spawnerOptions = {
        spawnRate: 15000,
        horizontalSpeed: 1.5,
        verticalSpeed: 1.33,
        timeScale: 0.1
    };
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x999999 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    renderer.domElement.tabIndex = "1"; // needed to receive keyboard presses
    camera = new THREE.PerspectiveCamera( 28, window.innerWidth / window.innerHeight, 0.1, 10000 );
    camera.position.z = -1;
    window.addEventListener( 'resize', onWindowResize, false );

    var gui = new dat.GUI();

    var waterFolder = gui.addFolder('Water');
    waterFolder.add(water.material.uniforms.reflectivity, 'value', 0, 1).name('Reflectivity');
    waterFolder.add(water.material.uniforms.offsetY, 'value', 0, 0.2).name('Sea Level');
    waterFolder.add(water.material.uniforms.waveAmplitude, 'value', 0, 1).name('Wave Amplitude');
    waterFolder.add(water.material.uniforms.waveSpeed, 'value', 0, 0.001).name('Wave Speed');
    waterFolder.add(water.material.uniforms.waveFrequency, 'value', 0, 40).name('Wave Frequency');

    var p = gui.addFolder('Particles');
    p.add( options, "velocityRandomness", 0, 3 );
    //p.add( options, "positionRandomness", 0, 3 );
    p.add( options, "size", 1, 20 );
    p.add( options, "sizeRandomness", 0, 25 );
    p.add( options, "colorRandomness", 0, 1 );
    p.add( options, "lifetime", .1, 10 );
    p.add( options, "turbulence", 0, 1 );

    p.add( spawnerOptions, "spawnRate", 10, 30000 );
    p.add( spawnerOptions, "timeScale", -1, 1 );
    
    animate();
}

function animate() {
    requestAnimationFrame( animate );
    
    var delta = clock.getDelta() * spawnerOptions.timeScale;
    tick += delta;
    water.material.uniforms.time.value = tick*100000;

    if ( tick < 0 ) tick = 0;

    if ( delta > 0 ) {
	//options.position.x = Math.sin( tick * spawnerOptions.horizontalSpeed ) * 20;
	//options.position.y = Math.sin( tick * spawnerOptions.verticalSpeed ) * 10;
	//options.position.z = Math.sin( tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 5;

	for ( var x = 0; x < spawnerOptions.spawnRate * delta; x++ ) {
            //console.log("Spawning");

	    particleSystem.spawnParticle( options );
	}

    }

    particleSystem.update( tick );
    
    renderer.render( scene, camera );
}

function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
