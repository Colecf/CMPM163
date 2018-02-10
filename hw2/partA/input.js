var Input = function(){
    this.drag = undefined;
    this.mousedown = undefined;
    this.leftdown = undefined;
    this.rightdown = undefined;
    this.mouseup = undefined;
    this.leftup = undefined;
    this.rightup = undefined;
    this.scroll = undefined;
    this.mousemove = undefined;

    this.startDrag = undefined;
    this.elem = undefined;
    this.buttonStates = [false, false, false];
    this.keys = {};

    this.isKeyDown = function(k) {
        return this.keys[k] || false;
    };
    
    var call = function(fn, arg1, arg2) {
        if(fn) {
            if(arg2 !== undefined) {
                fn(arg1, arg2);
            } else {
                fn(arg1);
            }
        }
    };
    var subtract = function(x, y) {
        return {
            x: x.x - y.x,
            y: x.y - y.y,
            z: x.z - y.z
        };
    };


    var t = this;
    var adjustMouseCoords = function(e) {
        
        if(t.canvas) {
            var x = e.clientX; // x coordinate of a mouse pointer
            var y = e.clientY; // y coordinate of a mouse pointer
            var rect = e.target.getBoundingClientRect() ;
            x = ((x - rect.left) - t.canvas.width/2)/(t.canvas.width/2);
            y = (t.canvas.height/2 - (y - rect.top))/(t.canvas.height/2);
            return {x:x, y:y, z: 0,
                    cx: e.clientX - rect.left, cy: e.clientY - rect.top};
        }
        return undefined;
    };
    this.setup = function(elem) {

        t.canvas = elem;
        
        elem.onmousedown = function(e) {
            var button = e.button;
            t.buttonStates[button] = true;
            var coords = adjustMouseCoords(e);
            e.coords = coords;
            if(t.startDrag) {
                var dragObject = {
                    type: t.startDrag.button,
                    coords: subtract(e.coords, t.startDrag.coords)
                };
                call(t.drag, dragObject, false);
            }
            t.startDrag = {
                button: button,
                coords: {x: coords.x, y: coords.y, z: 0}
            };
            if(button == 0) {
                call(t.leftdown, e);
            }
            if(button == 2) {
                call(t.rightdown, e);
            }
            call(t.mousedown, e);
        };

        elem.onmouseup = function(e) {
            var button = e.button;
            t.buttonStates[button] = false;
            var coords = adjustMouseCoords(e);
            e.coords = coords;
            if(t.startDrag) {
                var dragObject = {
                    type: t.startDrag.button,
                    coords: subtract(e.coords, t.startDrag.coords)
                };
                call(t.drag, dragObject, false);
                t.startDrag = undefined;
            }
            t.startDrag = undefined;
            if(button == 0) {
                call(t.leftup, e);
            }
            if(button == 2) {
                call(t.rightup, e);
            }
            call(t.mouseup, e);
        };

        elem.onmousemove = function(e) {
            e.coords = adjustMouseCoords(e);
            var button = e.button;
            call(t.mousemove, e);
            if(t.startDrag) {
                var dragObject = {
                    type: t.startDrag.button,
                    coords: subtract(e.coords, t.startDrag.coords)
                };
                call(t.drag, dragObject, true);
            }
        };

        elem.onkeydown = function(e) {
            t.keys[e.key] = true;
        };
        elem.onkeyup = function(e) {
            t.keys[e.key] = false;
        };

        
        var firefox = /Firefox/i.test(navigator.userAgent);
        var mousewheelevt= firefox ? "wheel" : "mousewheel";
        elem.addEventListener(mousewheelevt, function(e){
            if(firefox) {
                e.wheelDelta = -e.deltaY;
            }
            call(t.scroll, e, t.buttonStates[1]);
        }, false);
    };
};
