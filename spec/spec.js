var timeline = require('../index');
describe('timeline', function(){
    beforeEach(function(){
        timeline.start();
        timeline.stop();
        timeline.clear();
    });
    var fakeFunc = null, node = null;

    beforeEach(function(){
        fakeFunc = jasmine.createSpy('fakeFunc');
        node = {
            id: 'test',
            state: timeline.STATE_LIVE,
            tick: function(node, timeNum, timeObj) {
                node.state = timeline.STATE_DIE;
                fakeFunc();
            }
        };
    });

    afterEach(function(){
        timeline.stop();
        timeline.clear();
    });
    describe('function add', function(){

        it('can add node and excute it every tick', function(done){
            timeline.add(node);
            timeline.start();

            setTimeout(function(){
                expect(fakeFunc).toHaveBeenCalled();
                done();
            }, 1000);
        });

        it('will not add node that already in', function(){
            timeline.add(node);
            timeline.add(node);
            expect(timeline._getList().length).toBe(1);
        });
        it('require id, state and tick', function(){
            
            var lessId = function(){
                timeline.add({
                    state: timeline.STATE_LIVE,
                    tick: function(node, timeNum, timeObj) {
                        node.state = timeline.STATE_DIE;
                        fakeFunc();
                    }
                });
            };
            var lessState = function(){
                timeline.add({
                    id: 'test',
                    tick: function(node, timeNum, timeObj) {
                        node.state = timeline.STATE_DIE;
                        fakeFunc();
                    }
                });
            };
            var lessTick = function(){
                timeline.add({
                    id: 'test',
                    state: timeline.STATE_LIVE
                });
            };
            expect(lessId).toThrow();
            expect(lessState).toThrow();
            expect(lessTick).toThrow();
        });
        it('will not alow the node that the state is false', function(){
            timeline.add({
                id: 'test',
                state: timeline.STATE_PENDING,
                tick: function(node, timeNum, timeObj) {
                    node.state = timeline.STATE_DIE;
                    fakeFunc();
                }
            });
            expect(timeline._getList().length).toBe(0);
            timeline.add({
                id: 'test',
                state: timeline.STATE_DIE,
                tick: function(node, timeNum, timeObj) {
                    node.state = timeline.STATE_DIE;
                    fakeFunc();
                }
            });
            expect(timeline._getList().length).toBe(0);
            timeline.add(node);
            expect(timeline._getList().length).toBe(1);
        });

        it('will make the timeline run, if the added node is the first node for the started timeline', function(done){
            var time1, time2;

            /**
             * we set interval 300
             * and add node at 100ms
             * if start with empty list will run
             * after 200ms the node.tick will call
             *
             * if start not call run, but the first added node call
             * the time between add node and call tick will not less than intervalTime
             */
            timeline.start();
            setTimeout(function(){
                node.tick = function(node, timeNum, timeObj) {
                    node.state = timeline.STATE_DIE;
                    time2 = +(new Date());

                    expect(time2 - time1).not.toBeLessThan(timeline._getIntervalTime());
                    done();
                };
                timeline.add(node);
                time1 = +(new Date());
            }, 100);
        });
    });
    describe('function start', function(){
        it('if not start, node will excute with add', function(done){
            timeline.clear();
            var node = {
                id: 'test-for-func-start',
                state: timeline.STATE_LIVE,
                tick: function(node, timeNum, timeObj) {
                    node.state = timeline.STATE_DIE;
                }
            };
            spyOn(node, 'tick');
            timeline.add(node);
            setTimeout(function(){
                expect(node.tick).toHaveBeenCalled();
                done();
            }, timeline._getIntervalTime()*2);
        });
    });
    describe('node tick', function(){
        it('will be call each frame of timeline', function(done){
            node.tick = function(node, timeNum, timeObj) {
            };
            spyOn(node, 'tick');
            timeline.add(node);
            timeline.start();

            // 2.8 because two times interval may bigger than 2 but less than 3
            // but if your cpu is busy, this may be failure
            setTimeout(function(){
                expect(node.tick).toHaveBeenCalledTimes(2);
                done();
            }, timeline._getIntervalTime() * 2.8);
        });
        it('will be called with node and time', function(done){
            node.tick = function(node, timeNum, timeObj) {
                expect(node).toEqual(jasmine.any(Object));
                expect(node.id).toBeDefined();
                expect(node.state).toBeDefined();
                expect(node.tick).toBeDefined();
                expect(timeNum).toEqual(jasmine.any(Number));
                expect(timeObj).toEqual(jasmine.any(Date));
                done();
            };
            timeline.add(node);
            timeline.start();
        });
        it('every tick will get the same time of each frame', function(done){
            var time1, time2;
            timeline.add({
                id: 'test2',
                state: timeline.STATE_LIVE,
                tick: function(node, timeNum, timeObj){
                    time1 = timeNum;
                }
            });
            node.tick = function(node, timeNum, timeObj){
                time2 = timeNum;
            };
            timeline.add(node);
            timeline.start();
            setTimeout(function(){
                expect(time1).toBe(time2);
                done();
            }, timeline._getIntervalTime() * 3);
        });
    });
    describe('garbage collection', function(){
        it('will remove node which has a state of false from list', function(done){
            timeline.add(node);
            timeline.start();
            expect(timeline._getList().length).toBe(1);

            setTimeout(function(){
                expect(timeline._getList().length).toBe(0);
                done();
            }, timeline._getIntervalTime() * 2);
        });
        xit('will stop tick if list is empty');
        it('will call the destroy method if provide', function(done){
            node.destroy = function(){};
            spyOn(node, 'destroy');
            timeline.add(node);
            timeline.start();

            setTimeout(function(){
                expect(node.destroy).toHaveBeenCalled();
                done();
            }, timeline._getIntervalTime() * 2);
        });
    });
    describe('stop', function(){
        it('will stop the tick', function(done){
            node.tick = function(node, timeNum, timeObj){
            };
            spyOn(node, 'tick');
            timeline.add(node);
            timeline.start();

            setTimeout(function(){
                expect(node.tick).toHaveBeenCalledTimes(1);
                timeline.stop();
            }, timeline._getIntervalTime() * 1.5);

            setTimeout(function(){
                expect(node.tick).toHaveBeenCalledTimes(1);
                done();
            }, timeline._getIntervalTime() * 4);
        });
    });

    describe('system like time func', function(){
        it('interval', function(done){

            var token = timeline.setInterval(fakeFunc, 1);

            setTimeout(function(){
                var count = fakeFunc.calls.count(); 

                expect(count).toBeGreaterThan(1);

                timeline.clearInterval(token);


                setTimeout(function(){
                    expect(fakeFunc.calls.count()).toBe(count);
                    done();
                }, 400);

            }, 2500);
        });

        it('set timeout', function(done){
            var token = timeline.setTimeout(fakeFunc, 1);
            setTimeout(function(){
                expect(fakeFunc.calls.count()).toBe(1);
                done();
            }, 1500);
        });

        it('clear timeout', function(done){
            var token = timeline.setTimeout(fakeFunc, 1);

            setTimeout(function(){
                timeline.clearTimeout(token);
            },50);

            setTimeout(function(){
                expect(fakeFunc).not.toHaveBeenCalled();
                done();
            }, 1500);
        });
    });
});
