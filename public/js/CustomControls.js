/**
 * @author Eberhard Graether / http://egraether.com/
 * @author Mark Lundin 	/ http://mark-lundin.com
 * @author Simone Manini / http://daron1337.github.io
 * @author Luca Antiga 	/ http://lantiga.github.io
 */

THREE.TimelineControls = function ( object, domElement ) {

	var _this = this;
	var STATE = { NONE: - 1, ROTATE: -1, ZOOM: 1, PAN: 0, TOUCH_ROTATE: 3, TOUCH_ZOOM_PAN: 4 };

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	this.enabled = true;

	this.screen = { left: 0, top: 0, width: 0, height: 0 };

	this.rotateSpeed = 1.0;
	this.zoomSpeed = 0.1;
	this.panSpeed = 0.6;
	this.reboundSpeed = 0.6;

	this.noRotate = false;
	this.noZoom = false;
	this.noPan = false;
	this.noControl = false;	

	this.staticMoving = false;
	this.dynamicDampingFactor = 0.1;

	this.minDistance = 0;
	this.maxDistance = Infinity;

	this.minTimeline;
	this.maxTimeline;
	
	this.keys = [ 65 /*A*/, 83 /*S*/, 68 /*D*/ ];

	// internals

	this.target = new THREE.Vector3();
	this.lookat = new THREE.Vector3();
	this.moveto = new THREE.Vector3();
	this.origin = new THREE.Vector3();
	this.topdown = new THREE.Vector3();	
	
	this.moveMode = 0; /*0: 3D camera movement  1: normal movement*/

	var EPS = 0.000001;

	var lastPosition = new THREE.Vector3();
	var lastLookat = new THREE.Vector3();

	var _state = STATE.NONE,
		_prevState = STATE.NONE,

		_eye = new THREE.Vector3(),

		_movePrev = new THREE.Vector2(),
		_moveCurr = new THREE.Vector2(),

		_lastAxis = new THREE.Vector3(),
		_lastAngle = 0,

		_zoomStart = new THREE.Vector2(),
		_zoomEnd = new THREE.Vector2(),
	
		
		_zoomToEnd = 0,		
		_zoomToStart = 0,
		_zoomToBase = 33000,
		_zoomToStep = 2000,

		_touchZoomDistanceStart = 0,
		_touchZoomDistanceEnd = 0,

		_panStart = new THREE.Vector2(),
		_panEnd = new THREE.Vector2(),
		_moveStart = new THREE.Vector2(),
		_moveEnd = new THREE.Vector2(),
	
		_mouseStart = new THREE.Vector2(),
		_mouseEnd = new THREE.Vector2();
	

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.up0 = this.object.up.clone();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };


	// methods

	this.handleResize = function () {

		if ( this.domElement === document ) {

			this.screen.left = 0;
			this.screen.top = 0;
			this.screen.width = window.innerWidth;
			this.screen.height = window.innerHeight;

		} else {

			var box = this.domElement.getBoundingClientRect();
			// adjustments come from similar code in the jquery offset() function
			var d = this.domElement.ownerDocument.documentElement;
			this.screen.left = box.left + window.pageXOffset - d.clientLeft;
			this.screen.top = box.top + window.pageYOffset - d.clientTop;
			this.screen.width = box.width;
			this.screen.height = box.height;

		}


	};

	var getMouseOnScreen = ( function () {

		var vector = new THREE.Vector2();

		return function getMouseOnScreen( pageX, pageY ) {

			vector.set(
				( pageX - _this.screen.left ) / _this.screen.width,
				( pageY - _this.screen.top ) / _this.screen.height
			);

			return vector;

		};

	}() );

	var getMouseOnCircle = ( function () {

		var vector = new THREE.Vector2();

		return function getMouseOnCircle( pageX, pageY ) {

			vector.set(
				( ( pageX - _this.screen.width * 0.5 - _this.screen.left ) / ( _this.screen.width * 0.5 ) ),
				( ( _this.screen.height + 2 * ( _this.screen.top - pageY ) ) / _this.screen.width ) // screen.width intentional
			);

			return vector;

		};

	}() );

	this.rotateCamera = ( function () {

		var axis = new THREE.Vector3(),
			quaternion = new THREE.Quaternion(),
			eyeDirection = new THREE.Vector3(),
			objectUpDirection = new THREE.Vector3(),
			objectSidewaysDirection = new THREE.Vector3(),
			moveDirection = new THREE.Vector3(),
			angle;

		return function rotateCamera() {

			moveDirection.set( _moveCurr.x - _movePrev.x, _moveCurr.y - _movePrev.y, 0 );
			angle = moveDirection.length();

			if ( angle ) {

				_eye.copy( _this.object.position ).sub( _this.target );

				eyeDirection.copy( _eye ).normalize();
				objectUpDirection.copy( _this.object.up ).normalize();
				objectSidewaysDirection.crossVectors( objectUpDirection, eyeDirection ).normalize();

				objectUpDirection.setLength( _moveCurr.y - _movePrev.y );
				objectSidewaysDirection.setLength( _moveCurr.x - _movePrev.x );

				moveDirection.copy( objectUpDirection.add( objectSidewaysDirection ) );

				axis.crossVectors( moveDirection, _eye ).normalize();

				angle *= _this.rotateSpeed;
				quaternion.setFromAxisAngle( axis, angle );

				_eye.applyQuaternion( quaternion );
				_this.object.up.applyQuaternion( quaternion );

				_lastAxis.copy( axis );
				_lastAngle = angle;

			} else if ( ! _this.staticMoving && _lastAngle ) {

				_lastAngle *= Math.sqrt( 1.0 - _this.dynamicDampingFactor );
				_eye.copy( _this.object.position ).sub( _this.target );
				quaternion.setFromAxisAngle( _lastAxis, _lastAngle );
				_eye.applyQuaternion( quaternion );
				_this.object.up.applyQuaternion( quaternion );

			}

			_movePrev.copy( _moveCurr );

		};

	}() );


	this.zoomCamera = function () {

		var factor;

		if ( _state === STATE.TOUCH_ZOOM_PAN ) {

			factor = _touchZoomDistanceStart / _touchZoomDistanceEnd;
			_touchZoomDistanceStart = _touchZoomDistanceEnd;
			_eye.multiplyScalar( factor );

		} else {

			factor = 1.0 + ( _zoomEnd.y - _zoomStart.y ) * _this.zoomSpeed;

			if ( factor !== 1.0 && factor > 0.0 ) {
				
				_eye.multiplyScalar( factor );
				
			}

			if ( _this.staticMoving ) {

				_zoomStart.copy( _zoomEnd );

			} else {

				_zoomStart.y += ( _zoomEnd.y - _zoomStart.y ) * this.dynamicDampingFactor;

			}

		}

	};
	
	
	var zooming = false; 
	this.zoomCameraTo = function () {

		var factor;

		var distance = _zoomToEnd - _zoomToStart;

		factor =distance*_this.zoomSpeed;

		if ( Math.pow(distance/_zoomToStep, 2) >= 0.000001) {
			_eye.z += factor;
		}else{
			_eye.z = _zoomToEnd;
		}
		if ( Math.pow(distance/_zoomToStep, 2) >= 0.01) {
			zooming = true;
		}else{
			zooming = false;
		}
		if ( _this.staticMoving ) {

			_zoomToStart.copy( _zoomToEnd );

		} else {

			_zoomToStart += (_zoomToEnd - _zoomToStart) * _this.zoomSpeed;

		}

	};	

	var zoomTimer;
	var focusing;
	this.zoomInAt = function (position) {
		_panStart.copy(_this.object.position);
		_panEnd = new THREE.Vector2(position.x,0);
		_zoomToEnd = _zoomToBase+timeline*_zoomToStep-position.z;
		_this.lookat.copy(new THREE.Vector3(position.x,0,_this.target.z));
		focusing=true;		
		//lookMode = 1;
		
	}
		
	
	this.topDownOn = function (position) {

		topDown = true;		

				
	}
	this.topDownOff = function (position) {

		topDown = false;		
				
	}
	
	this.undoCamera = function () {
		zooming = false;
		_zoomToEnd = _zoomToBase+timeline*_zoomToStep;	
		focusing=false;	
		lookMode = 0;
	}
	

	this.panOff = function () {
		_this.noControl = true;
		_this.noPan = true;
		_this.noZoom = true;
		_this.noRotate = true;
	}
	this.panOn = function () {
		_this.noControl = false;
		_this.noPan = false;
		_this.noZoom = false;
		_this.noRotate = false;		
	}


	var timeline;
	var startTimeline;	
	this.setLayers = function(min, max,start){
		_this.minTimeline = min;
		_this.maxTimeline = max;
		timeline = start;
		startTimeline = start;
		_zoomToStart= _zoomToBase+timeline*_zoomToStep;
		_zoomToEnd = _zoomToBase+timeline*_zoomToStep;
	}	
	
	
	var lookMode = 0;	
	var offset = 0;

	var moving = false;
	var topDown = false;

	this.inputControl = ( function(){

		if (!zooming){
			var mouseChange = new THREE.Vector2();
			mouseChange.copy( _mouseEnd ).sub( _mouseStart );
			thresholdY = _this.screen.height * 0.04;
			if(Math.abs(mouseChange.x) < Math.abs(mouseChange.y) && mouseChange.y>thresholdY && timeline > _this.minTimeline ){
				_zoomToStart = _eye.z;	
				timeline -=1;
				_panStart.copy( _panEnd );
				_zoomToEnd = _zoomToBase+timeline*_zoomToStep;
				jumpEvent = { type: "jump", timeline: timeline };
				_this.dispatchEvent( jumpEvent );
			}else if (Math.abs(mouseChange.x) < Math.abs(mouseChange.y) && mouseChange.y  < -1*thresholdY && timeline < _this.maxTimeline ){
				_zoomToStart = _eye.z;	
				timeline +=1;
				_panStart.copy( _panEnd );
				_zoomToEnd = _zoomToBase+timeline*_zoomToStep;
				jumpEvent = { type: "jump",timeline: timeline };					
				_this.dispatchEvent( jumpEvent );
			}else if ( Math.pow(mouseChange.x,2) > 1 ){
				_panEnd.add(new THREE.Vector2(mouseChange.x*-1,0));
			}	
		}			
	});

	_panStart.copy(_this.object.position);
	_panEnd.copy(_this.object.position);
	this.panCameraTo = ( function () {

		var pointChange = new THREE.Vector2(),
			objectUp = new THREE.Vector3(),
			pan = new THREE.Vector3(),
			tar = new THREE.Vector3();

		return function panCameraTo() {
			var diff = new THREE.Vector2(0,0,0);

			diff.subVectors( _panEnd, _panStart );
			if ( diff.lengthSq() > 3 ) {		
				if (focusing ==1){
					pointChange.copy(diff);
					pan.x = pointChange.x*_this.dynamicDampingFactor ;
					if (moving){
						lookMode = 0;
					}else{
						lookMode = 1;
					}
				}else{
					_this.undoCamera();
					pointChange.copy(diff).multiplyScalar( _this.panSpeed );
					pan.x = pointChange.x ;
					moving = true;
		
				}
				
				
				_this.target.add( pan );


				if ( _this.staticMoving ) {

					_panStart.copy( _panEnd );

				} else {

					_panStart.add( diff.multiplyScalar( _this.dynamicDampingFactor ) );

				}

			}else{
				focusing=false;			
				moving = false;
				lookMode = 0;
			}
			
		};

	}() );	

	this.checkDistances = function () {

		if ( ! _this.noZoom || ! _this.noPan ) {
/*
			if ( _eye.lengthSq() > _this.maxDistance * _this.maxDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.maxDistance ) );
				_zoomStart.copy( _zoomEnd );

			}

			if ( _eye.lengthSq() < _this.minDistance * _this.minDistance ) {

				_this.object.position.addVectors( _this.target, _eye.setLength( _this.minDistance ) );
				_zoomStart.copy( _zoomEnd );

			}
*/
		}

	};
	
	

	this.update = function () {


		if (!topDown){		
			 _this.object.position.copy(lastPosition);			
			_eye.subVectors( _this.object.position, _this.target );

			if ( ! _this.noControl ) {		
				_this.inputControl();
			}

			if ( ! _this.noRotate ) {

				_this.rotateCamera();

			}

			if ( ! _this.noZoom ) {

				_this.zoomCameraTo();

			}
			if ( ! _this.noPan ) {

				_this.panCameraTo();
			}		
			
			_this.object.position.addVectors( _this.target, _eye );

			_this.checkDistances();

			_this.lookat.setComponent (2, _eye.z-1000);


			if (lookMode == 1 || (_this.moveMode!=0)){
				_this.lookat.copy(new THREE.Vector3(_this.object.position.x,_this.object.position.y,_this.target.z));

			}else{

				var diff = (_this.target.x-_this.lookat.x)*_this.reboundSpeed* _this.dynamicDampingFactor;

				if (diff > 0.001 || diff < -0.001){

					_this.lookat.add(new THREE.Vector3(diff,0,0));

					if (_this.lookat.x - _this.target.x > 1000){
						_this.lookat.setComponent (0, _this.target.x+1000);
					}
					if (_this.lookat.x - _this.target.x < -1000){
						_this.lookat.setComponent (0, _this.target.x-1000);
					}				
				}else{
					_this.lookat.copy( _this.target);
				}
			}
			_this.object.lookAt( _this.lookat );

			if ( lastPosition.distanceToSquared( _this.object.position ) > EPS ) {

				lastPosition.copy( _this.object.position );
			}else if ( lastLookat.distanceToSquared( _this.lookat ) > EPS ) {

				lastLookat.copy( _this.lookat );	
			
			}
		}else{
			_this.object.position.copy( _this.position0 );
			_this.object.position.setComponent (1, _this.position0.y+20000+_this.maxTimeline/2*_zoomToStep);
			_this.object.position.setComponent (2, _this.position0.z+20000+_this.maxTimeline/2*_zoomToStep);
			
			_this.lookat.copy( _this.target0 );
			_this.lookat.setComponent (2, _this.target0.z+_this.maxTimeline/2*_zoomToStep);
			_this.object.lookAt( _this.lookat );
		}
		_this.dispatchEvent( changeEvent );	
	};

	
	this.reset = function () {

		_state = STATE.NONE;
		_prevState = STATE.NONE;

		_this.target.copy( _this.target0 );
		_this.object.position.copy( _this.position0 );
		_this.object.up.copy( _this.up0 );

		_eye.subVectors( _this.object.position, _this.target );
		_zoomStart = _eye.z;
		_zoomToEnd = _zoomStart;
		_this.object.lookAt( _this.target );

		_this.dispatchEvent( changeEvent );

		lastPosition.copy( _this.object.position );

	};

	// listeners

	function keydown( event ) {

		if ( _this.enabled === false ) return;

		window.removeEventListener( 'keydown', keydown );

		_prevState = _state;

		if ( _state !== STATE.NONE ) {

			return;

		} else if ( event.keyCode === _this.keys[ STATE.ROTATE ] && ! _this.noRotate ) {

			_state = STATE.ROTATE;

		} else if ( event.keyCode === _this.keys[ STATE.ZOOM ] && ! _this.noZoom ) {

			_state = STATE.ZOOM;

		} else if ( event.keyCode === _this.keys[ STATE.PAN ] && ! _this.noPan ) {

			_state = STATE.PAN;

		}

	}

	function keyup( event ) {

		if ( _this.enabled === false ) return;

		_state = _prevState;

		window.addEventListener( 'keydown', keydown, false );

	}

	function mousedown( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.NONE ) {

			_state = event.button;
			

		}

		if ( _state === STATE.ROTATE && ! _this.noRotate ) {

			_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );
			_movePrev.copy( _moveCurr );

		} else if ( _state === STATE.ZOOM && ! _this.noZoom ) {

			_zoomStart.copy( getMouseOnScreen( event.pageX, event.pageY ) );
			_zoomEnd.copy( _zoomStart );

		} else if ( _state === STATE.PAN && ! _this.noPan ) {
		
			
	
			_mouseStart = new THREE.Vector2(  event.pageX , event.pageY);		
			_mouseEnd.copy( _mouseStart );	


		}


		document.addEventListener( 'mousemove', mousemove, false );
		document.addEventListener( 'mouseup', mouseup, false );

		_this.dispatchEvent( startEvent );

	}

	function mousemove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		if ( _state === STATE.ROTATE && ! _this.noRotate ) {

		/*	_movePrev.copy( _moveCurr );
			_moveCurr.copy( getMouseOnCircle( event.pageX, event.pageY ) );*/

		} else if ( _state === STATE.ZOOM && ! _this.noZoom ) {

			_zoomEnd.copy( getMouseOnScreen( event.pageX, event.pageY ) );

		} else if ( _state === STATE.PAN && ! _this.noPan ) {
				dragging = true;

			_mouseStart.copy(_mouseEnd);
			_mouseEnd = new THREE.Vector2(  event.pageX , event.pageY);			
			

		}


	}

	function mouseup( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		_state = STATE.NONE;

		_mouseEnd = new THREE.Vector2( event.pageX , event.pageY);
		_mouseStart.copy(_mouseEnd);		
		dragging = false;
		document.removeEventListener( 'mousemove', mousemove );
		document.removeEventListener( 'mouseup', mouseup );
		_this.dispatchEvent( endEvent );

	}

	function mousewheel( event ) {
		return
		if ( _this.enabled === false ) return;

		if ( _this.noZoom === true ) return;

		event.preventDefault();
		event.stopPropagation();

		switch ( event.deltaMode ) {

			case 2:
				// Zoom in pages
				_zoomStart.y -= event.deltaY * 0.025;
				
				_zoomToEnd -=  event.deltaY * 0.25;
				break;

			case 1:
				// Zoom in lines
				_zoomStart.y -= event.deltaY * 0.01;
				_zoomToEnd -=  event.deltaY * 0.025;
				break;

			default:
				// undefined, 0, assume pixels
				//_zoomStart.y -= event.deltaY * 0.00025;
				_zoomToEnd -=  event.deltaY * 2.5;
				break;

		}


		_this.dispatchEvent( startEvent );
		_this.dispatchEvent( endEvent );

	}
	var firstfinger = 0;
	var dragging = false;
	function touchstart( event ) {

		if ( _this.enabled === false ) return;

			event.preventDefault();
        var maxLength = event.changedTouches.length;
		for (var i = 0; i < maxLength; i++) {
			var finger = event.changedTouches[i];
			var fid = finger.identifier;
			if (fid == 0){
				var x = (  finger.pageX ) ;
				var y = (  finger.pageY ) ;
				_mouseStart = new THREE.Vector2( x , y);
				_mouseEnd.copy( _mouseStart );			

			
			}
		}
		_this.dispatchEvent( startEvent );

	}

	function touchmove( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();
		var maxLength = event.changedTouches.length;
        for (var i = 0; i < maxLength; i++) {
			var finger = event.changedTouches[i];
			var fid = finger.identifier;
			if (fid == 0){			
				dragging = true;		
				var x = ( finger.pageX ) ;
				var y = ( finger.pageY ) ;
				_mouseStart.copy(_mouseEnd);
				_mouseEnd = new THREE.Vector2( x , y);

			}
		}		
		
		

	}

	function touchend( event ) {

		if ( _this.enabled === false ) return;
		var maxLength = event.changedTouches.length;
        for (var i = 0; i< maxLength ; i++) {
			var finger = event.changedTouches[i];
			var fid = finger.identifier;
			if (fid == 0){				
				dragging = false;
				
				var x = ( finger.pageX ) ;
				var y = ( finger.pageY ) ;
				_mouseEnd = new THREE.Vector2( x , y);
				_mouseStart.copy(_mouseEnd);
				
				_state = STATE.NONE;	
			}
		}			
		
		_this.dispatchEvent( endEvent );

	}

	function contextmenu( event ) {

		if ( _this.enabled === false ) return;

		event.preventDefault();

	}

	this.dispose = function () {

		this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', mousedown, false );
		this.domElement.removeEventListener( 'wheel', mousewheel, false );

		this.domElement.removeEventListener( 'touchstart', touchstart, false );
		this.domElement.removeEventListener( 'touchend', touchend, false );
		this.domElement.removeEventListener( 'touchmove', touchmove, false );

		document.removeEventListener( 'mousemove', mousemove, false );
		document.removeEventListener( 'mouseup', mouseup, false );

		window.removeEventListener( 'keydown', keydown, false );
		window.removeEventListener( 'keyup', keyup, false );

	};

	this.domElement.addEventListener( 'contextmenu', contextmenu, false );
	this.domElement.addEventListener( 'mousedown', mousedown, false );
	this.domElement.addEventListener( 'wheel', mousewheel, false );

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchcancel', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', keydown, false );
	window.addEventListener( 'keyup', keyup, false );

	this.handleResize();

	// force an update at start
	this.update();

};

THREE.TimelineControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.TimelineControls.prototype.constructor = THREE.TimelineControls;
