describe('timeline', function(){
    xdescribe('function add', function(){
        it('can add node and excute it every tick');
        it('will not add node that already in');
        it('require id, state and tick');
        it('will not alow the node that the state is false');
        it('will make the timeline run, if the added node is the first node for the started timeline');
    });
    xdescribe('function start', function(){
        it('if not start, node will not excute');
        it('can set start with param to set interval');
        it('will not run with a empty list');
    });
    xdescribe('node tick', function(){
        it('will be call each frame of timeline');
        it('will be called with node and time');
        it('every tick will get the same time of each frame');
    });
    xdescribe('garbage collection', function(){
        it('will remove node which has a state of false from list');
        it('will stop tick if list is empty');
        it('will call the destroy method if provide');
    });
    xdescribe('stop', function(){
        it('will stop the tick');
    });
});
