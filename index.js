var list = [],
    listLen = 0,
    intervalTime = 100,
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
            list.splice(i, 1);
        }
    }

    if (isEmpty(list)) {
        stop();
        return;
    }
}

module.exports = {
    start: start,
    add: add,
    stop: stop,
    STATE_LIVE: STATE_LIVE,
    STATE_PENDING: STATE_PENDING,
    STATE_DIE: STATE_DIE
};
