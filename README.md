obj-delta
=========
obj-delta helps you to apply a set of changes to an object.
It always generates a new object rather than mutating the original one. But it reuses fragments of the original object (a simple structural sharing).

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
Every command is chainable, so you can write:
```js
var delta = Delta()
  .set('heroes[0].nickname', 'The invisible woman');
  .del('heroes[4]');
```
Every command is called on a path. The path uses the same syntax used in [lodash](https://lodash.com/docs/4.17.4#set). It can be a string or an array:
```js
'heroes[0].nickname' is equivalent to ['heroes', 0, 'nickname']
```
You can apply the change using the "apply" method:
```js
var correctedData = delta.apply(data);
```
The original object: "data" does not mutate.
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
You can notice that correctedData reuses references to the data object where they are not changed.

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
Sets a value. If the path doesn't exist, it creates the object/arrays necessary and then sets the value.
```js
delta()
  .set('greetings/hello', 'world')
  .apply({ greetings: {} });

// { greetings: { hello: 'world' }}
```

del
---
Removes a value.
```js
delta()
  .del('greetings/hello')
  .apply({ greetings: { hello: 'world'} });

// { greetings: { }}
```
If used on an array index, it will compact the array after removing the item.
```js
delta()
  .del('greetings/hello[1]')
  .apply({ greetings: { hello: ['world', 'mars', 'sun']} });

// { greetings: { hello: ['world', 'sun']} }
```

transform
---------
It replaces an item using a function that runs on the original value.
```js
delta()
  .transform('greetings/hello', (greeting) => greeting.toUpperCase())
  .apply({ greetings: { hello: 'world'} });

// { greetings: { hello: 'WORLD' }}
```
If the original item is undefined, it will create the item.
NOTE: you can't serialize an object if you use this command.

map
---
It replaces an array of items using a function that runs on the original value.
The function takes (item, index, array) as arguments.
```js
delta()
  .map('greetings', (greeting) => greeting.toUpperCase())
  .apply({ greetings: ['hello', 'hola', 'ciao'] });

// { greetings: ['HELLO', 'HOLA', 'CIAO'] }
```
It runs over objects too, replacing all object values.
In this case the function takes (value, key, object) as arguments.
```js
delta()
  .map('greetings', (greeting) => greeting.toUpperCase())
  .apply({ greetings: { eng: 'hello', es: 'hola', it: 'ciao' } });

// { greetings: { eng: 'HELLO', es: 'HOLA', it: 'CIAO' } }
```
If the path is pointing to an item that is not an object or an array, this function works the same as the transform.

filter
------
It filters an array of items using a function. If the function returns a truthy value the item will be included.
The function takes (item, index, array) as arguments.
```js
delta()
  .filter('greetings', (greeting) => greeting.startsWith('h'))
  .apply({ greetings: ['hello', 'hola', 'ciao'] });

// { greetings: ['hello', 'hola'] }
```
It runs over objects too, filtering key/value pairs.
In this case the function takes (value, key, object) as arguments.
```js
delta()
  .filter('greetings', (greeting) => greeting.startsWith('h'))
  .apply({ greetings: { eng: 'hello', es: 'hola', it: 'ciao' } });

// { greetings: { eng: 'hello', es: 'hola' } }
```
If the path is pointing to an item that is not an object or an array, this function will run on that item. If it returns false the item will be undefined.

append
------
It appends one or more items to an array.
```js
delta()
  .append('greetings', 'ciao')
  .apply({ greetings: ['hello', 'hola'] });

// { greetings: ['hello', 'hola', 'ciao'] }

delta()
  .append('greetings', ['ciao', 'hi'])
  .apply({ greetings: ['hello', 'hola'] });

// { greetings: ['hello', 'hola', 'ciao', 'hi'] }
```
If the original item is not an array, it will be transformed in an array.
```js
delta()
  .append('greetings', 'ciao')
  .apply({ greetings: 'hello' });

// { greetings: ['hello', 'ciao'] }
```

prepend
-------
It prepends one or more items to an array.
```js
delta()
  .prepend('greetings', 'ciao')
  .apply({ greetings: ['hello', 'hola'] });

// { greetings: ['ciao', 'hello', 'hola'] }

delta()
  .prepend('greetings', ['ciao', 'hi'])
  .apply({ greetings: ['hello', 'hola'] });

// { greetings: ['ciao', 'hi', 'hello', 'hola'] }
```
If the original item is not an array, it will be transformed in an array.
```js
delta()
  .prepend('greetings', 'ciao')
  .apply({ greetings: 'hello' });

// { greetings: ['ciao', 'hello'] }
```

insert
------
It inserts one or more items in an array.
```js
delta()
  .insert('greetings', 'ciao', 1) // 1 is the index
  .apply({ greetings: ['hello', 'hola'] });

// { greetings: ['hello', 'ciao', 'hola'] }

delta()
  .insert('greetings', ['ciao', 'hi'], 1) // 1 is the index
  .apply({ greetings: ['hello', 'hola'] });

// { greetings: ['hello', 'ciao', 'hi', 'hola'] }
```
If the original item is not an array, it will be transformed in an array and behave just like prepend ( ignoring the index ).
```js
delta()
  .insert('greetings', 'ciao', 1) // 1 is the index
  .apply({ greetings: 'hello' });

// { greetings: ['ciao', 'hello'] }
```
By default the index is 0.
```js
delta()
  .insert('greetings', 'ciao', 1) // 1 is the index
  .apply({ greetings: ['hello', 'hola'] });

// { greetings: ['hello', 'ciao', 'hola'] }
```

merge
-----
It merges an object on top of an existing one.
```js
delta()
  .merge('greetings', { eng: 'hello', it: 'ciao' })
  .apply({ greetings: { eng: 'hi', es: 'hola' } });

// { greetings: { eng: 'hello', es: 'hola', it: 'ciao' } }
```
If the original element is not an object it returns that unchanged.

slice
-----
It slices an array. Same api as Array.prototype.slice.
```js
delta()
  .slice('greetings', 1, -1)
  .apply({ greetings: ['hello', 'hola', 'ciao', 'hi'] });

// { greetings: ['hola', 'ciao'] }
```
If the original element is not an array it returns that unchanged.

removeKeys
----------
It removes all items from an object with a certain key.
```js
delta()
  .removeKeys('greetings', 'eng')
  .apply({ greetings: { eng: 'hello', es: 'hola', it: 'ciao' } });

// { greetings: { es: 'hola', it: 'ciao' } }
```
It can also remove more than one key. If a key doesn't exist, is ignored.
```js
delta()
  .removeKeys('greetings', ['eng', 'es', 'rus'])
  .apply({ greetings: { eng: 'hello', es: 'hola', it: 'ciao' } });

// { greetings: { it: 'ciao' } }
```

removeIndexes
-------------
It removes all items from an array with a certain index.
```js
delta()
  .removeIndexes('greetings', 1)
  .apply({ greetings: ['hello', 'hola', 'ciao'] });

// { greetings: ['hello', 'ciao'] }
```
It can also remove more than one index. If an index doesn't exist, is ignored.
```js
delta()
  .removeIndexes('greetings', [1, 10])
  .apply({ greetings: ['hello', 'hola', 'ciao'] });

// { greetings: ['hello', 'ciao'] }
```

removeValues
------------
It removes all items from an array or object with a certain value.
```js
delta()
  .removeValues('greetings', 'hola')
  .apply({ greetings: ['hello', 'hola', 'ciao'] });

// { greetings: ['hello', 'ciao'] }
```
It can also remove more than one value. If the value doesn't exist, is ignored.
```js
delta()
  .removeValues('greetings', ['hola', 'hi'])
  .apply({ greetings: ['hello', 'hola', 'ciao'] });

// { greetings: ['hello', 'ciao'] }
```
An example with an object:
```js
delta()
  .removeValues('greetings', ['hello', 'hola'])
  .apply({ greetings: { eng: 'hello', es: 'hola', it: 'ciao' } });

// { greetings: { it: 'ciao' } }
```
