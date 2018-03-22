//setting up off-screen rendering
var bufferObject;
var bufferScene;
var bufferCamera;
var planeMesh;

/////////////////////////////////////////////////////////////////////////////

var camera, renderer;
var scene = new THREE.Scene();
var controls;
var shaders = {};
var textures = {};
var postProcessors = {};
var postProcessingDefinitions = [
    {name: 'none'},
    {name: 'pixelation', uniforms: {
        pixelAmt: {type: 'f', value: 32.0}
    }},
    {name: 'squares'},
    {name: 'hblur', uniforms: {
        radius: {type: 'f', value: 15}
    }},
    {name: 'vblur', uniforms: {
        radius: {type: 'f', value: 15}
    }}
];

var options = {
    activePostProcessor: 'none',
    glowState: 'composited',
    timeScale: 0
};

var glowMaterial  = new THREE.MeshBasicMaterial({color: 0x0022FF});
var blackMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

var light1, light2;

load();
function load() {
    var shaderNames = [];
    
    var todo = shaderNames.length +
            postProcessingDefinitions.length;

    var fileLoader = new THREE.FileLoader();
    shaderNames.concat(postProcessingDefinitions.map(function(x) {
        return 'postProcessors/'+x.name+'.frag';
    })).forEach(name => {
        fileLoader.load(name, data => {
            var noExtension = name.substring('postProcessors/'.length, name.length-5);
            for(var i=0; i<postProcessingDefinitions.length; i++) {
                if(postProcessingDefinitions[i].name == noExtension) {
                    postProcessors[noExtension] = new PostProcessor(data, postProcessingDefinitions[i].uniforms);
                    if(--todo == 0) {
                        init();
                    }
                    return;
                }
            }
            shaders[name] = data;

            if(--todo == 0) {
                init();
            }
        });
    });
}

function init() {
/////////////////////////////////////////////////////////////////////////////

    bufferObject = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight);
    bufferCamera = new THREE.PerspectiveCamera( 90.0, window.innerWidth / window.innerHeight, 0.1, 1000 );
    bufferCamera.position.z += 5.0;

////// adding all objects to main scene /////////////////////////////////////
    // adding computer
    addObj("assets/computer.mtl", "assets/computer.obj", function( object ) {
        object.scale.set(2, 2, 2); 
        object.position.z += -3;
        scene.add(object);
    });

    // adding lamp
    addObj("assets/lamp.mtl", "assets/lamp.obj", function( object ) {
        object.scale.set(1, 1, 1);
        object.position.x += 3.5;
        object.position.y += 1;
        object.position.z += -4;
        scene.add(object);
    });

    // adding room corner
    addObj("assets/room.mtl", "assets/room.obj", function( object ) {
        object.scale.set(2, 2, 2);
        object.rotateY(-Math.PI / 2);
        object.position.y -= 1;
        object.position.z += -3;
        scene.add(object);
    });

    // adding desk
    addObj("assets/desk.mtl", "assets/desk.obj", function( object ) {
        object.scale.set(2, 2, 4);
        object.position.y += -1.3;
        object.position.z += -3;
        scene.add(object);
    });

    // adding lamp light
    lampLight = new THREE.PointLight(0xaaaaaa, 1, 0);
    lampLight.position.set(3.5, 1.0, -4.0);
    scene.add(lampLight);

/////////////////////////////////////////////////////////////////////////////

    light1 = new THREE.PointLight(0xaaaaaa, 1, 0);
    light1.position.set(1.0, 5.0, 5.0);
    scene.add(light1);

    light2 = new THREE.PointLight(0xaaaaaa, 1, 0);
    light2.position.set(-1.5, -5.0, 5.0);
    scene.add(light2);
    
    var green = new THREE.MeshPhongMaterial({color: 0x00ff00});
    var head = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), green);
    scene.add(head);
    
    var eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), glowMaterial);
    eyeL.position.z = 0.7;
    eyeL.position.x = 0.3;
    scene.add(eyeL);
    
    var eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.3, 32, 32), glowMaterial);
    eyeR.position.z = 0.7;
    eyeR.position.x = -0.3;
    scene.add(eyeR);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x000000 );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.1, 50 );
    camera.position.x += -0.1;
    camera.position.y += 0.4;
    camera.position.z += -2.5;

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0.0, 0.0, -4.0);

    window.addEventListener( 'resize', onWindowResize, false );

    var gui = new dat.GUI();
    gui.add(options, "timeScale", 0, 2.0).name("Time scale");
    gui.add(options, 'activePostProcessor',
            postProcessingDefinitions.map(x => x.name)).name("Post Processor");
    gui.add(options, 'glowState', ['none', 'pre glow', 'hblur', 'h+vblur', 'composited']);
    gui.add(postProcessors['hblur'].uniforms.radius, 'value', 0, 100).name("Glow radius").onFinishChange(function() {
        postProcessors['vblur'].uniforms.radius.value = postProcessors['hblur'].uniforms.radius.value;
    });
    gui.add(postProcessors['pixelation'].uniforms.pixelAmt, 'value', 4, 100).name("pixelation");
    
    animate();
}

function makeTexture() {
    return new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight,
                                       { minFilter: THREE.MinFilter,
                                         magFilter: THREE.LinearFilter
                                       });
}

var basicFBO = makeTexture();
var preGlowFBO = makeTexture();
var hblurFBO = makeTexture();
var vblurFBO = makeTexture();
var compositedGlowFBO = makeTexture();
var glowCompositor = new Compositor([basicFBO, vblurFBO]);

function animate() {

/////////////////////////////////////////////////////////////////////////////

    var planeMaterial = new THREE.MeshBasicMaterial({map:bufferObject.texture});
    var planeGeometry = new THREE.PlaneGeometry( 5, 5 );
    planeMesh = new THREE.Mesh(planeGeometry,planeMaterial);
    planeMesh.scale.set(0.3, 0.3, 0.3);
    planeMesh.position.x += -0.1;
    planeMesh.position.y += 0.45;
    planeMesh.position.z += -3.6;

    scene.add( planeMesh );

/////////////////////////////////////////////////////////////////////////////
    
    requestAnimationFrame(animate);
    controls.update();
    var time = performance.now() * options.timeScale/1000;

    light1.position.x = 5*Math.sin(time);
    light1.position.z = 5*Math.cos(time);

    light2.position.x = 5*Math.sin(time);
    light2.position.z = 5*Math.cos(time);

    renderer.render(scene, camera, basicFBO);

/////////////////////////////////////////////////////////////////////////////

    renderer.setClearColor( 0xCCCCCC );
    renderer.render(scene,bufferCamera,bufferObject);

/////////////////////////////////////////////////////////////////////////////

    if(options.glowState != 'none') {
        // Make everything black except what's supposed to glow
        scene.traverse(function( node ) {
            if ( node instanceof THREE.Mesh ) {
                node.materialBackup = node.material;
                if(node.material != glowMaterial) {
                    node.material = blackMaterial;
                }
            }
        });
        renderer.render(scene, camera, preGlowFBO);
        // Return the original materials to everything
        scene.traverse( function( node ) {
            if ( node instanceof THREE.Mesh ) {
                node.material = node.materialBackup;
            }
        });
        if(options.glowState != 'pre glow') {
            postProcessors['hblur'].render(renderer, preGlowFBO, hblurFBO);
            if(options.glowState != 'hblur') {
                postProcessors['vblur'].render(renderer, hblurFBO, vblurFBO);
                if(options.glowState != 'h+vblur') {
                    glowCompositor.render(renderer, compositedGlowFBO);
                }
            }
        }
    }

    if(options.glowState == 'none') {
        postProcessors[options.activePostProcessor].render(renderer, basicFBO);
    } else if (options.glowState == 'pre glow') {
        postProcessors[options.activePostProcessor].render(renderer, preGlowFBO);
    } else if (options.glowState == 'hblur') {
        postProcessors[options.activePostProcessor].render(renderer, hblurFBO);
    } else if (options.glowState == 'h+vblur') {
        postProcessors[options.activePostProcessor].render(renderer, vblurFBO);
    } else {
        postProcessors[options.activePostProcessor].render(renderer, compositedGlowFBO);
    }
}

function onWindowResize( event ) {
    FBO.width = window.innerWidth;
    FBO.height = window.innerHeight;
    //plane.material.uniforms.iResolution.value = [window.innerWidth, window.innerHeight];
    renderer.setSize( window.innerWidth, window.innerHeight );
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    for(var key in postProcessors) {
        postProcessors[key].onWindowResize(event);
    }
}
