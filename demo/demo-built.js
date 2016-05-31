/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var timeline = __webpack_require__(1);


	// make domBlock move circle with 300, 300 as center point
	var centerX = 300,
	    centerY = 300,
	    angle = 0,
	    radius = 300,
	    speed = 0.01;

	timeline.add({
	    id: 'block',
	    state: timeline.STATE_LIVE,
	    data: {
	        centerX: 300,
	        centerY: 300,
	        angle: 0,
	        speed: 0.01,
	        dom: document.getElementById('block')
	    }, 
	    tick: function(node, timeNum, timeObj){
	        var top, left;
	        top = centerY + Math.sin(angle) * radius;
	        left = centerX + Math.cos(angle) * radius;
	        node.data.dom.style.top = top+'px';
	        node.data.dom.style.left = left+'px';
	        angle += speed;
	    }
	});

	var domTime = document.getElementById('time');
	timeline.setInterval(function(node, timeNum, timeObj){
	        domTime.innerText = timeObj.toString();
	}, 1000);

	timeline.start();



/***/ },
/* 1 */
/***/ function(module, exports) {

	var list = [],
	    listLen = 0,
	    intervalTime = 1000/60,
	    intervalToken = 0,
	    isTimelineStarted = false,
	    STATE_LIVE = 'live',
	    STATE_DIE = 'die',
	    STATE_PENDING = 'pending';

	/**
	 * is list empty
	 * @return {Boolean} true empty
	 */
	function isEmpty(list){
	    return list.length === 0;
	}

	/**
	 * 根据id在list里面查找指定的node
	 * @param {Object} 如果找不到 返回null
	 */
	function findNodeWithId(id){
	    var i,
	        node = null;

	    if (listLen === 0) {
	        return node;
	    }

	    for (i = 0; i < listLen; i++) {
	        if (list[i].id === id) {
	            return list[i]
	        }
	    }

	    return node;
	}

	function checkRequire(obj, requires){
	    var i,
	        prop = '';
	    if (!requires.push) {
	        requires = [requires];
	    }

	    for (i = requires.length - 1; i >= 0; i--) {
	        prop = obj[requires[i]];
	        if (typeof prop === 'undefined') {
	            throw new Error(prop+' is required');
	        }
	    }
	}

	function start(time){
	    if (isTimelineStarted) {
	        return;
	    }

	    if (time) {
	        intervalTime = time;
	    }

	    isTimelineStarted = true;

	    if (!isEmpty(list)) {
	        run();
	    }
	}

	function run(){
	    intervalToken = setInterval(tick, intervalTime);
	}

	function tick(){
	    var i = 0,
	        node = null,
	        currTime = new Date(),
	        currTimeNum = currTime.valueOf();


	    try{
	        for (i; i < listLen; i++) {
	            node = list[i];
	            if (node.state === STATE_LIVE) {
	                node.tick(node, currTimeNum, currTime);
	            }
	        }
	    } catch(e) {
	        // do nothing
	    }

	    garbageCollect();
	}

	function stop(){

	    isTimelineStarted = false;

	    if (intervalToken !== 0) {
	        clearInterval(intervalToken);
	        intervalToken = 0;
	    }
	}

	function add(node){
	    checkRequire(node, ['id', 'state', 'tick']);

	    if (findNodeWithId(node.id) === null && node.state === STATE_LIVE) {
	        list.push(node);
	        listLen++;


	        // only started and before this add there is no node in the list
	        if (listLen === 1 && isTimelineStarted) {
	            run();
	        }
	    }
	}

	function garbageCollect(){
	    var i,
	        node = null;

	    // loop from the end, so the splice will not break the list's index
	    for (i = listLen - 1; i >= 0; i--) {
	        node = list[i];
	        if (node.state === STATE_DIE) {
	            if (node.destroy) {
	                node.destroy();
	            }
	            list.splice(i, 1);
	        }
	    }

	    if (isEmpty(list)) {
	        stop();
	        return;
	    }
	}

	// a window.setInterval like func
	// but the timeInterval small than intervalTime will not work
	function intervalSet(cb, timeInterval){
	    var time =  new Date(),
	        id = time.valueOf();

	    add({
	        id: id,
	        state: STATE_LIVE,
	        data: {
	            token: id,
	            time: id,
	            timeInterval: timeInterval
	        },
	        tick: function(node, timeNow, timeObj){
	            if (timeNow - node.data.time >= node.data.timeInterval) {
	                cb(node, timeNow, timeObj);
	                node.data.time = timeNow;
	            }
	        }
	    });
	    start();
	    return id;
	}

	// a window.clearInterval like func
	function intervalClear(id){
	    var node = findNodeWithId(id);

	    if (node) {
	        node.state = STATE_DIE;
	    }
	}

	// a window.setTimeout like func
	// but the timeInterval small than intervalTime will not work
	function timeoutSet(cb, timeInterval){
	    var time =  new Date(),
	        id = time.valueOf();
	    add({
	        id: id,
	        state: STATE_LIVE,
	        data: {
	            token: id,
	            time: id,
	            timeInterval: timeInterval
	        },
	        tick: function(node, timeNow, timeObj){
	            if (timeNow - node.data.time >= node.data.timeInterval) {
	                cb(node, timeNow, timeObj);
	                intervalClear(node.id);
	            }
	        }
	    });
	    start();
	    return id;
	}

	function clear(){
	    stop();
	    list = [];
	    listLen = 0;
	}

	module.exports = {
	    start: start,
	    add: add,
	    stop: stop,
	    clear: clear,
	    STATE_LIVE: STATE_LIVE,
	    STATE_PENDING: STATE_PENDING,
	    STATE_DIE: STATE_DIE,

	    setTimeout: timeoutSet,
	    setInterval: intervalSet,
	    clearTimeout: intervalClear,
	    clearInterval: intervalClear,

	    // for test
	    _tick: tick,
	    _getList: function(){return list;},
	    _getIntervalTime: function(){return intervalTime}
	};


/***/ }
/******/ ]);