obj-delta
=========
obj-delta is an object containing a set of changes to be applied to an object.
The library always generate a new object rather than mutating the original one. It reuse fragments of the original object when they didn't change (a simple structural sharing).

Using the library
-----------------
You can import the library from npm and require it:
```js
var Delta = require('obj-delta');
```
You can change an object like the following:
```js
var data = {
  heroes: [
    { name: 'Susan Storm', nickname: 'The invincible woman' },
    { name: 'Jonathan Storm', handle: 'The human torch' },
    { name: 'Reed Richards', handle: 'Mr Fantastic' },
    { name: 'Benjamin Grimm', handle: 'The thing' },
    { name: 'Viktor Van Doom', handle: 'Doctor Doom' },
  ]
};
```
You can create a delta object like this:
```js
var delta = Delta(); // or new Delta();
delta.set('heroes[0].nickname', 'The invisible woman');
delta.del('heroes[4]');
```
Every command is chainable, so you make things shorter:
```js
var delta = Delta()
  .set('heroes[0].nickname', 'The invisible woman');
  .del('heroes[4]');
```
Every command is called on a path. The path uses the same syntax used in lodash. It can be a string or an array:
```js
'heroes[0].nickname' is equivalent to ['heroes', 0, 'nickname']
```
You can apply the change using the "apply" method:
```js
var correctedData = delta.apply(data);
```
The original data does not mutate.
```js
data === correctedData // false

data.heroes === correctedData.heroes // false
data.heroes[0] === correctedData.heroes[0] // false
data.heroes[0].name === correctedData.heroes[0].name // true, quite obvious
data.heroes[0].nickName === correctedData.heroes[0].nickName // false, quite obvious

data.heroes[1] === correctedData.heroes[1] // true
data.heroes[2] === correctedData.heroes[2] // true
data.heroes[3] === correctedData.heroes[3] // true

correctedData.heroes[4] // is undefined
```
You can notice that correctedData reuse references to the data object where they are not changed.

Serializing/deserializing
-------------------------
delta can be serialized:
```js
var json = JSON.stringify(delta);
```
and deserialized:
```js
var newDelta = Delta(JSON.parse(json));
```
In this way the list of changes can be serialized, sent through the network, deserialized and applied remotely.
There is an important exception, all commands taking a function (transform, filter, map) can't be serialized. JSON.stringify will fire an exception if you used one of them.

Commands
--------
Here's a complete list of all commands:
* set
* del
* transform
* map
* filter
* append
* prepend
* insert
* merge
* slice
* removeKeys
* removeIndexes
* removeValues

set
---
Set a value. If the path doesn't exist, it creates the object/arrays necessary and then sets the value.
```js
delta
  .set('greetings/hello', 'world')
  .apply({ greetings: {} });

// { greetings: { hello: 'world' }}
```

del
---
