var camera, scene, renderer;
var plane;
var shaders = {};
var textures = {};
var options = {
    play: true,
    light1Color: {r: 255, g: 0, b: 0},
    light2Color: {r: 0, g: 0, b: 255}
};

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

    var light1 = new THREE.PointLight(0xff0000, 1, 0);
    light1.position.set(-0.6, 0.7, -0.5);
    scene.add(light1);
    var light2 = new THREE.PointLight(0x0000ff, 1, 0);
    light2.position.set(0.6, 0.7, 0.5);
    scene.add(light2);
    
    var planeMaterial = new THREE.ShaderMaterial({
        uniforms: THREE.UniformsUtils.merge([
            THREE.UniformsLib["lights"],
            {
                time: { type: "f", value: 0 },
                iResolution: { type: "2f", value: [window.innerWidth, window.innerHeight] },
                timeScale: { type: "1f", value: 0.0005 },
                colorByNormal: { type: "1f", value: false }
            }]),
        vertexShader: shaders["scene.vert"],
        fragmentShader: shaders["scene.frag"],
        lights: true
    });

    var planeGeometry = new THREE.PlaneGeometry(1, 1);
    plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x999999 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    camera = new THREE.OrthographicCamera( -0.5, 0.5, 0.5, -0.5, 0.1, 1000 );
    camera.position.z = 0.3;

    window.addEventListener( 'resize', onWindowResize, false );

    function update() {
        if(!options.play) animate(true);
    }
    var gui = new dat.GUI();
    gui.add(options, "play").name("Animate").onFinishChange(function(value) {
        if(value) requestAnimationFrame(animate);
    });
    gui.add(plane.material.uniforms.timeScale, "value", 0, 0.01).name("Time scale");
    gui.add(plane.material.uniforms.colorByNormal, "value").name("Color by normal").onFinishChange(update);

    gui.addColor(options, "light1Color").name("Light 1 Color").onFinishChange(function() {
        light1.color.r = options.light1Color.r / 255;
        light1.color.g = options.light1Color.g / 255;
        light1.color.b = options.light1Color.b / 255;
        update();
    });
    gui.addColor(options, "light2Color").name("Light 2 Color").onFinishChange(function() {
        light2.color.r = options.light2Color.r / 255;
        light2.color.g = options.light2Color.g / 255;
        light2.color.b = options.light2Color.b / 255;
        update();
    });
    
    animate(true);
}

function animate(dontUpdateTime) {
    if(options.play) {
        requestAnimationFrame( animate );
    }

    if(dontUpdateTime !== true) {
        var time = performance.now();
        plane.material.uniforms.time.value = time;
    }
    renderer.render( scene, camera );
}

function onWindowResize( event ) {
    plane.material.uniforms.iResolution.value = [window.innerWidth, window.innerHeight];
    renderer.setSize( window.innerWidth, window.innerHeight );
}
