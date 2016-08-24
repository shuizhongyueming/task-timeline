var list = [],
    intervalTime = 1000,
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
        node = null,
        listLen = list.length;

    if (listLen === 0) {
        return node;
    }

    for (i = 0; i < listLen; i++) {
        if (list[i].id === id) {
            return list[i];
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

function start(){
    if (isTimelineStarted) {
        return;
    }

    isTimelineStarted = true;

    if (!isEmpty(list)) {
        run();
    }
}

function run(){

    // if intervalToken !== 0 means there is a count going
    // same time only one count will run
    if (intervalToken !== 0) {
        return;
    }
    intervalToken = setTimeout(_run, intervalTime);
}

function _run(){
    intervalToken = 0;
    tick();
    if (garbageCollect()) {
        run();
    }
}

function tick(){
    var i = 0,
        node = null,
        currTime = new Date(),
        currTimeNum = currTime.valueOf(),
        listLen = list.length;


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

}

function stop(){

    isTimelineStarted = false;

    if (intervalToken !== 0) {
        clearTimeout(intervalToken);
        intervalToken = 0;
    }
}

function add(node){
    checkRequire(node, ['id', 'state', 'tick']);

    if (findNodeWithId(node.id) === null && node.state === STATE_LIVE) {
        list.push(node);

        // only started and before this add there is no node in the list
        if (list.length === 1) {
            run();
        }
    }
}

/**
 * clear the unnecessary node
 * @return {Boolean} false the timeline is stop; true the timeline will continue
 */
function garbageCollect(){
    var i,
        node = null,
        listLen = list.length;

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
        return false;
    }

    return true;
}

// a window.setInterval like func
// but timeInterval will always same as 1000ms
function intervalSet(cb ,timeInterval){
    var time =  new Date(),
        logTime = time.valueOf(),
        id = makeUniqueId(logTime);

    add({
        id: id,
        state: STATE_LIVE,
        data: {
            token: id,
            time: logTime,
            timeInterval: timeInterval * 1000
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

/**
 * can't just use the time number as unique id
 * because in chrome, some time, if two timeoutSet closely, the time number will be same
 */
function makeUniqueId(timeNum){
    return 'time' + timeNum + 'random' + Math.random();
}

// a window.setTimeout like func
// but the timeInterval small than intervalTime will not work
function timeoutSet(cb, timeInterval){
    var time =  new Date(),
        logTime = time.valueOf(),
        id = makeUniqueId(logTime);

    add({
        id: id,
        state: STATE_LIVE,
        data: {
            token: id,
            time: logTime,
            timeInterval: timeInterval * 1000
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
    _getIntervalTime: function(){return intervalTime;},
    _logSt: function(){
        console.log('list', list);
        console.log('intervalTime', intervalTime);
        console.log('intervalToken', intervalToken);
        console.log('isTimelineStarted', isTimelineStarted);
    }
};
