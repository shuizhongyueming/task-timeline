## timeline

this tool is inspired by a share from 杜伟 the douyu.com's fe in a ITA1024 WeChat Group Sharing;

and this is the [article](https://mp.weixin.qq.com/s?__biz=MzIzMzEzODYwOA==&mid=2665284396&idx=1&sn=e413c75bbf798151a8ffc1f0900e25b8&scene=1&srcid=0526NQNTqT1kBuP7JZddnJ1Q&key=f5c31ae61525f82e2f2d4963130f7e17f4508b8d6959ae8cf3d886b2ef08574b6590b424fbeab2854305962d341a1b14&ascene=0&uin=MjE2OTE2ODY2MQ%3D%3D&devicetype=iMac+MacBookPro11%2C1+OSX+OSX+10.11.5+build(15F34)&version=11020201&pass_ticket=7nC5RdfE16sZKVekh1a84wd8nzzu%2Bfg%2FS%2FIn1ChfE4%2FXmk1%2BsddJ84MLQBAveVjB) about that share.

## About

this tool is suitable for some project with many time based action or animation.

too many setTimeout and setInterval will drop down the page's performace.

so this tool will make the only one setInterval, and every action and animation will run base with it's tick.

## Concepts

### frame 

the core of timeline is a `setInterval`, and everytime the func pass to the `setInterval` be called, this is a `frame`

### node

the timeline will maintence a list, and the item in the list is a `node`. it contains enough information about a action or animation, and it will tell timeline how to excute itself every frame.

## Useage

you can start the timeline with 

```javascript
timeline.start();
```

and then you can add a `node` to it.


```javascript
timeline.add({
    id: 'timeCountDown', // the identify of the node, must
    data: null, // anything you need save for the node, not required but recommend
    state: 'live', // 'live', 'die', 'pending' etc. tell timeline wheather remove it or not
    tick: function(node, time){}, // this is the func will be called every frame
    destroy: function(node, time){} // this will be call before timeline remove node from it's list
});
```

## API

// TODO

## Testing

our test spec is under the spec directory

we use the jasmine to build the test environment.

```ssh
npm install jasmine -g // install the jasmine globally
```

and in the project's directory

```ssh
jasmine
```

will auto run the specs
