var FirstPersonCamera = function(input) {
    this.yaw = new THREE.Object3D();
    this.pitch = new THREE.Object3D();
    this.camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.01, 3000 );
    this.yaw.add(this.pitch);
    this.pitch.add(this.camera);
    this.enabled = false;
    this.rotationSpeed = 0.002;
    this.moveSpeed = 0.0005;
    var t = this;
    input.mousemove = function(e) {
        if(t.enabled) {
            t.yaw.rotation.y -= e.movementX * t.rotationSpeed;
            t.pitch.rotation.x -= e.movementY * t.rotationSpeed;

            t.pitch.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, t.pitch.rotation.x));
        }
    };

    input.mousedown = function(e) {
        input.canvas.requestPointerLock();
    };

    this.compute = function(delta) {
        if(t.enabled) {
            if(input.isKeyDown("ArrowUp") || input.isKeyDown("w")) {
                t.yaw.translateZ(-delta*t.moveSpeed);
            }
            if(input.isKeyDown("ArrowDown") || input.isKeyDown("s")) {
                t.yaw.translateZ(delta*t.moveSpeed);
            }
            if(input.isKeyDown("ArrowLeft") || input.isKeyDown("a")) {
                t.yaw.translateX(-delta*t.moveSpeed);
            }
            if(input.isKeyDown("ArrowRight") || input.isKeyDown("d")) {
                t.yaw.translateX(delta*t.moveSpeed);
            }
        }
    };

    this.pointerLockChange = function(e) {
        t.enabled = document.pointerLockElement === input.canvas;
    };

    document.addEventListener('pointerlockchange', this.pointerLockChange, false);

    this.updateProjectionMatrix = function() {
        t.camera.updateProjectionMatrix();
    };
    
    Object.defineProperties(this, {
        'position': {
            get: function() { return t.yaw.position; },
            set: function(x) { t.yaw.position = x; }
        },
        'aspect': {
            get: function() { return t.camera.aspect; },
            set: function(x) { t.camera.aspect = x; }
        }
    });
};
