var timeline = require('../index');


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

