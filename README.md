[![build status](https://secure.travis-ci.org/dankogai/js-object-clone.png)](http://travis-ci.org/dankogai/js-object-clone)

object-clone.js
===============

Object.clone() with deep cloning support

SYNOPSIS
--------
````javascript
// just for convenience
var log = function(){ console.log.apply(console, [].slice.call(arguments)) };
````
````javascript
var src = { name: 'dankogai', lang: ['perl'] };
var dst = Object.clone(src);    // shallow copy
log(Object.is(src, dst));       // false
log(Object.equals(src, dst));   // true;
dst.lang.push('javascript');
log(JSON.stringify(dst.lang));  // ["perl","javascript"] because dst is shallow copied.
dst = Object.clone(src, true);  // deep copy
dst.lang = dst.lang.reverse();
log(JSON.stringify(src.lang));  // ["perl","javascript"]
log(JSON.stringify(dst.lang));  // ["javascript","perl"]
````
