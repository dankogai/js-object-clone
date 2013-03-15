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

REQUIREMENT
-----------

EcmaScript 5 compliance.

DESCRIPTION
-----------

This script installs following functions to *Object*

### Object.clone(`obj`, `deep`)

Clones `obj`.  When `deep` is `true`, it attempts to deep clone `obj`.

Unlike many other implementations of object cloners,  This one:

+ can deep clone
+ copies the ES5 descriptor of every property that `Object.getOwnPropertyDescriptor()` returns
+ copies the restriction of the object that the following functions cast upon:
 + `Object.preventExtensions()`
 + `Object.seal()`
 + `Object.freeze()`

If the type of `obj` is unsupported, it throws `TypeError`:

````javascript
dst = Object.clone(new Error);  //  [object Error] unsupported
````

### Object.equals(`objX`, `objY`)

Compares the _value_ of each properties of `objX` and `objY` and returns true iff all properties are equal.  Like `Object.clone`, `Object.equals`:

+ compares ES5 descriptor
+ compares restriction

The following ES6 functions are also defined unless predefined (like Chrome 25):

+ Object.is()
+ Object.isnt()

BUGS
----

Like `JSON`, `Object.clone()` and `Object.equals()` cannot handle circular references.

It is not impossible to handle circular references in JavaScript since you can check if the objects are identical via `===` operator. Yet it is very impractical without object ID like [object_id] of Ruby or `refaddr` of Perl.  Without object ID you have to linear search just to check if the object is already visited.  As a matter of fact the reference implementation of [Map and Set of ES6] resorts to linear search.

[object_id]:http://ruby-doc.org/core-2.0/Object.html#method-i-object_id
[refaddr]:http://perldoc.perl.org/Scalar/Util.html
[Map and Set of ES6]: http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets

With ES5 you can add hidden, immutable properties like `.__id__` via `Object.defineProperty` but mutating objects for that is rude if not unforgivable.
