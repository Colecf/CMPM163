var fileLoader = new THREE.FileLoader();
var shaders = {};
var scene = new THREE.Scene();
var renderer;
var kernels;
var camera;
var mesh;

load();

function load() {
    var todo = 3;
    (new THREE.TextureLoader()).load('../ice_crust3.jpg', tex => {
        texture = tex;
        if(--todo == 0) {
            init();
        }
    });
    ['imageProcessing.vert', 'imageProcessing.frag'].forEach(name => {
        fileLoader.load(name, data => {
            shaders[name] = data;
            if(--todo == 0) {
                init();
            }
        });
    });
}

function init() {
    kernels = {
        identity: new THREE.Matrix3(),
        blur: new THREE.Matrix3(),
        edge: new THREE.Matrix3(),
        sharpen: new THREE.Matrix3()
    };
    kernels.identity.set(0, 0, 0,
                         0, 1, 0,
                         0, 0, 0);
    kernels.blur.set(1/9, 1/9, 1/9,
                     1/9, 1/9, 1/9,
                     1/9, 1/9, 1/9);
    kernels.edge.set(0, 1, 0,
                     1, -4, 1,
                     0, 1, 0);
    kernels.sharpen.set(0, -1, 0,
                        -1, 5, -1,
                        0, -1, 0);
                     
    camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.1, 50 );
    camera.position.z = 2;
    var geometry = new THREE.BufferGeometry();
    var vertices = new Float32Array([
            -1.0, -1.0, 0.0,
	    +1.0, -1.0, 0.0,
            +1.0, +1.0, 0.0,
        
	    -1.0, -1.0, 0.0,
	    +1.0, +1.0, 0.0,
	    -1.0, +1.0, 0.0,
    ]);
    var texCoords = new Float32Array([
	0.0, 0.0,
	1.0, 0.0,
        1.0, 1.0,
        
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ]);
    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    geometry.addAttribute( 'texCoords', new THREE.BufferAttribute( texCoords, 2 ) );

    var texture = new THREE.TextureLoader().load( 'dog.jpg' );
    var material = new THREE.RawShaderMaterial({
        uniforms: {
            t1: { type: "t", value: texture },
            rx: { type: 'f', value: 512 },
            ry: { type: 'f', value: 512 },
            intensity: { type: "f", value: 1.0 },
            kernel: new THREE.Uniform(kernels.identity)
        },
        vertexShader: shaders['imageProcessing.vert'],
        fragmentShader: shaders['imageProcessing.frag']
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.material.side = THREE.DoubleSide;
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0x999999 );
    renderer.setSize( window.innerWidth, window.innerHeight-30 );
    console.log(document.getElementById('container'));
    document.getElementById('container').appendChild( renderer.domElement );
    
    window.addEventListener( 'resize', onWindowResize, false );
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render( scene, camera );
}

function changeFilter(filter) {
    mesh.material.uniforms.kernel.value = kernels[filter];
}

function onWindowResize( event ) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight-30 );
}
