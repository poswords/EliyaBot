$(document).ready(function () {
    var clientid;
    var isIOS = ((/iphone|ipad/gi).test(navigator.appVersion));
    var inputDown = isIOS ? "touchstart" : "touchstart mousedown";
    var inputUp = isIOS ? "touchend" : "touchend mouseup";
    var w_width = $(window).width();
    var w_height = $(window).height();
    var dragging = false;
    var maxFinger = 10;	
    var socket = io();
    var eventId = [];
    var eventPair = [];
    var eventTarget = [];
    var eventType = [];
    var eventPoint = [];
    var eventStartPoint = [];
	

    function clearUI() {

    }

    function resizeCheck() {
        w_width = $(window).width();
        w_height = $(window).height();
    }
    $(window).resize(function () {
        resizeCheck();
    });
    resizeCheck();


    socket.on('connected', function () {
        socket.emit('device', 'client');
    });
    
    var area = $(".wrapper");
    // mouse events
    area.on(inputDown, function (e) {
        e.preventDefault();
    });
    area.bind("mousedown", function (e) {
        dumpEvent(e);
        forMouse(e, function (e2, id) {});
    }).bind("mousemove", function (e) {
        dumpEvent(e);
        forMouse(e, function (e2, id) {});
    }).bind("mouseup", function (e) {
        dumpEvent(e);
        forMouse(e, function (e2, id) {});
    });
	
    // touch events
    area.bind("touchstart", function (e) {
        clearUI();
        forEachChangedFinger(e, function (e2, id) {});
    }).bind("touchmove", function (e) {
        forEachChangedFinger(e, function (e2, id) {});
    }).bind("touchend", function (e) {
        forEachChangedFinger(e, function (e2, id) {});
    }).bind("touchcancel", function(e){
        forEachChangedFinger(e, function (e2, id) {});
	});

    function forMouse(e, cb) {
        e = e.originalEvent;
        switch (e.type) {
        case 'mousedown':
            dragging = true;
            var target = $(e.target);
            if (target.parent().hasClass("item")) {
                eventType[0] = "move";
                eventTarget[0] = target.closest('.itemAnchor');
                eventTarget[0].data('m_x', e.pageX - parseInt(eventTarget[0].css('left')));
                eventTarget[0].data('m_y', e.pageY - parseInt(eventTarget[0].css('top')));
                eventTarget[0].data("last_x", e.pageX);
                eventTarget[0].data("last_y", e.pageY);
            }
            break;
        case 'mousemove':
            if (dragging) {
                switch (eventType[0]) {
                case "move":
                    itemMoveHandler(eventTarget[0], e.pageX, e.pageY);
                    break;
                }
            }
            break;
        case 'mouseup':
            dragging = false;
            eventType[0] = "";
            eventTarget[0] = "";
            break;
        }
    }

    function forEachChangedFinger(e, cb) {
        e = e.originalEvent;
        var maxLength = e.changedTouches.length;
        if (maxLength > maxFinger) {
            maxLength = maxFinger;
        }
        for (var i = 0; i < maxLength; i++) {
            var finger = e.changedTouches[i];
            var fid = finger.identifier;
            switch (e.type) {
            case 'touchstart':
                eventId.push(fid);

				eventTarget[fid] = $(finger.target);
                break;
            case 'touchmove':
                eventPoint[fid] = {
                    x: finger.pageX,
                    y: finger.pageY
                };
                switch (eventType[fid]) {
					case "move":
						itemMoveHandler(eventTarget[fid], finger.pageX, finger.pageY);
						break;
                }
                break;
			case 'touchend':
			case 'touchcancel':
				switch (eventType[fid]) {
					case "move":
                    if (eventPair[fid] > -1) {
                        animationHandler(eventTarget[fid]);
                    }
					break;
                }
					
                break;
            }
        }
    }

	function itemMoveHandler(target_wp, s_x, s_y) {
        var n_x, n_y,
            o_x, o_y, o_width, o_height,
            min_x, max_x, min_y, max_y;
        o_x = target_wp.data("o_x");
        o_y = target_wp.data("o_y");
        n_x = s_x - target_wp.data('m_x');
        n_y = s_y - target_wp.data('m_y');
        o_width = target_wp.width();
        o_height = target_wp.height();
        min_x = 0 - o_width / 2;
        min_y = 0 - o_height / 2;
        max_x = w_width - o_width / 2;
        max_y = w_height - o_height / 2;
        if (n_x < min_x) n_x = min_x;
        if (n_y < min_y) n_y = min_y;
        if (n_x > max_x) n_x = max_x;
        if (n_y > max_y) n_y = max_y;
        target_wp.css({
            'left': n_x,
            'top': n_y
        });

        target_wp.data("o_x", n_x);
        target_wp.data("o_y", n_y);
        target_wp.data("speed_x", n_x - o_x);
        target_wp.data("speed_y", n_y - o_y);

    }
	
    function animationHandler(target_wp) {
        var friction = 0.92;
        var n_x, n_y, 
            o_x, o_y, o_width, o_height, speed_x, speed_y,
            min_x, max_x, min_y, max_y;
        o_width = target_wp.width();
        o_height = target_wp.height();
		min_x = 0 - o_width / 2;
		min_y = 0 - o_height / 2;
		max_x = w_width - o_width / 2;
		max_y = w_height - o_height / 2;


        o_x = target_wp.data("o_x");
        o_y = target_wp.data("o_y");
        var intid = setInterval(frame, 1e3 / 60);

        function frame() {
            speed_x = target_wp.data("speed_x");
            speed_y = target_wp.data("speed_y");
            if (Math.abs(speed_x) + Math.abs(speed_y) < 1) {
                target_wp.data("o_x", n_x);
                target_wp.data("o_y", n_y);
                target_wp.data("speed_x", 0);
                target_wp.data("speed_y", 0);
                clearInterval(intid);
            }
            else {
                n_x = o_x + speed_x;
                n_y = o_y + speed_y;
                if (n_x <= min_x) {
                    n_x = min_x;
                    speed_y = speed_y * 0.75;
                }
                if (n_y <= min_y) {
                    n_y = min_y;
                    speed_x = speed_x * 0.75;
                }
                if (n_x >= max_x) {
                    n_x = max_x;
                    speed_y = speed_y * 0.75;
                }
                if (n_y >= max_y) {
                    n_y = max_y;
                    speed_x = speed_x * 0.75;
                }
				target_wp.css({
					'left': n_x,
					'top': n_y
				});
				target_wp.data("speed_x", speed_x * friction);
				target_wp.data("speed_y", speed_y * friction);
				o_x = n_x;
				o_y = n_y;
            }
        }
    }


    function dumpEvent() {
        var etype = [];
        for (var p in eventType) {
            etype.push("finger" + p + " = " + eventType[p]);
        }
    }
});