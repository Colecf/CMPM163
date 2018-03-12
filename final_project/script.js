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
    camera.position.z = 5;
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    window.addEventListener( 'resize', onWindowResize, false );

    var gui = new dat.GUI();
    gui.add(options, "timeScale", 0, 2.0).name("Time scale");
    gui.add(options, 'activePostProcessor',
            postProcessingDefinitions.map(x => x.name)).name("Post Processor");
    gui.add(options, 'glowState', ['none', 'pre glow', 'hblur', 'h+vblur', 'composited']);
    gui.add(postProcessors['hblur'].uniforms.radius, 'value', 0, 100).name("Glow radius");
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
    requestAnimationFrame(animate);
    controls.update();
    var time = performance.now() * options.timeScale/1000;

    light1.position.x = 5*Math.sin(time);
    light1.position.z = 5*Math.cos(time);

    light2.position.x = 5*Math.sin(time);
    light2.position.z = 5*Math.cos(time);

    renderer.render(scene, camera, basicFBO);

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
