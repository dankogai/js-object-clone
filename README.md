[![build status](https://secure.travis-ci.org/dankogai/js-object-clone.png)](http://travis-ci.org/dankogai/js-object-clone)

object-clone.js
===============

Deep cloning and comparison for ES5

SYNOPSIS
--------
````javascript
// just for convenience
var log = function(){ console.log.apply(console, [].slice.call(arguments)) };
````
````javascript
var src = { name: 'dankogai', lang: ['perl'] };
var dst = Object.clone(src);        // shallow copy
log( Object.is(src, dst)      );    // false
log( Object.equals(src, dst)  );    // true
dst.lang.push('javascript');
log(JSON.stringify(src.lang)  );    // ["perl","javascript"] because dst is shallow-copied
dst = Object.clone(src, true);      // deep copy
dst.lang = dst.lang.reverse();
log( JSON.stringify(src.lang) );    // ["perl","javascript"]
log( JSON.stringify(dst.lang) );    // ["javascript","perl"]
````

REQUIREMENT
-----------

EcmaScript 5 compliance.

DESCRIPTION
-----------

This script installs following functions to `Object`.

If the follwing ES6 functions are missing they are polyfilled.

+ `Object.is()`
+ `Object.isnt()`

cf. http://wiki.ecmascript.org/doku.php?id=harmony:egal


### Object.clone( _obj_ , _deep_, _spec_ )

Clones the object _obj_.  When _deep_ is `true`, it attempts to deep
clone _obj_.

For _spec_, see below.

Unlike many other implementations of object cloners,  This one:

+ can deep clone upon request
+ copies the ES5 descriptor of every property that 
`Object.getOwnPropertyDescriptor()` returns
+ copies the restriction of the object that the following functions cast upon:
 + `Object.preventExtensions()`
 + `Object.seal()`
 + `Object.freeze()`

#### Custom Objects

You can clone custom objects so long as its constructor is written in
JavaScript:

````javascript
var Point = function(x, y) {
    if (!(this instanceof Point)) return new Point(x, y);
    this.x = x*1;
    this.y = y*1;
};
Point.prototype = {
    distance: function(pt) {
        if (!pt) pt = Point(0,0);
        var dx = this.x - pt.x;
        var dy = this.y - pt.y;
        return Math.sqrt(dx*dx + dy*dy);
    }
};
var src = Point(3,4);
var dst = Object.clone(src, true);
log( src === dst              );   // false
log( Object.equals(src, dst)  );   // true
log( dst.distance(Point(0,0)) );   // 5
````

If the type of _obj_ is unsupported, it throws `TypeError`:

````javascript
dst = Object.clone(new Error);  //  [object Error] unsupported
````
#### Why DOM Elements are not supported

Note DOM Elements are not supported.  It already has `.cloneNode` so use it.

cf. https://developer.mozilla.org/en-US/docs/DOM/Node.cloneNode

It is rather trivial to add support for that since all you have to do
is delegate it to _obj_.cloneNode( _deep_ ) (as a matter of fact my
early code did support that).  But the author decided to drop that
since `uneval()` of Firefox does not support that.

### Object.equals( _objX_, _objY_, _spec_ )

Compares the _value_ of each property in _objX_ and _objY_ and returns
`true` iff all properties are equal, otherwise `false`.

Like `Object.clone()`, `Object.equals()`:

+ compares ES5 descriptor
+ compares restriction

### Minute controls via _spec_

Version 0.3.0 introduced the third argument to `Object.clone()` and
`Object.equals()` which enables more minute control on how objects 
are compared or cloned.  It is a object with following default.

````javascript
{
  descriptors:          true,
  extensibility:        true,
  enumerator:           Object.getOwnPropertyNames
}
````

#### .descriptor

If `false`, descriptor specs are ignored except for `value`.

````javascript
src = {};
defineProperty(src, 0, {value:1});
dst = Object.clone(src, true, {descriptor:false} );
log(Object.equals(dst, src)                      ); // false;
log(Object.equals(dst, src,   {descriptor:false})); // true;
````
#### .extensibility

If `false`, extensibility is ignored

````javascript
src = {};
Object.freeze(src);
dst = Object.clone(src, true, {extensibility:false});
log(Object.equals(dst, src)                        ); // false;
log(Object.equals(dst, src,   {extensibility:true})); // true;
````

#### .enumerator

Set the function used to enumurate object.  Change it to `Object.keys`
and all non-enumerable properties are ignored.
The example below emulates `_.clone` and `_.isEqual()`:

````javascript
var spec = {
  descriptors:          false,
  extensibility:        false,
  enumerator:           Object.keys
};
if (!_) _ = {};
_.clone   = function(src) { return Object.clone(src, false, spec) };
_.isEqual = function(x, y){ return Object.equals(x, y, spec) };
````

#### .filter

You can even set filter like this:

````javascript
var ignore__ = function(desc, key, obj) {
    return !key.match(/^__/);
};
src = {0:1, __id__:'src'};
dst = Object.clone(src, true, {filter:ignore__});
log(Object.equals(dst, src)                     ); // false;
log(Object.equals(dst, src,   {filter:ignore__})); // true;
````

Like `[].filter`, the call back function take three arguments

+ `desc` 
  The _descriptor_ of the value.  Note it is not the value itself
+ `key`
  The key.  For most cases you need only this.  
  Should I make this the first argument?
  This is more consistent with array iterators, though.
+ `obj`
  The whole object

Circular Reference Support
--------------------------

As of 0.2.0, `Object.clone()` and `Object.equals()` handle
circular references iff ES6 `WeakMap` is supported.  As of this writing,
the following JS engines suppor that.

+ node.js with `--harmony`
+ Chrome with Experimental JavaScript enabled via `chrome://flags/`.
+ FireFox since 6.0

cf.  https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/WeakMap

BUGS
----

Like `JSON`, `Object.clone()` and `Object.equals()` cannot handle
circular references unless WeakMap is supported.

It is not impossible to handle circular references in JavaScript since
you can check if the objects are identical via `===` operator. Yet it
is very impractical without object ID like [object_id] of Ruby or
`refaddr` of Perl.  Without object ID you have to linear search just
to check if the object is already visited.  As a matter of fact the
reference implementation of [Map and Set of ES6] resorts to linear
search.

[object_id]:http://ruby-doc.org/core-2.0/Object.html#method-i-object_id
[refaddr]:http://perldoc.perl.org/Scalar/Util.html
[Map and Set of ES6]: http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets

With ES5 you can add hidden, immutable properties like `.__id__` via
`Object.defineProperty` but mutating objects for that is rude if not
unforgivable.

SEE ALSO
--------
### eval(uneval(obj))

Available only on firefox.  Handles circular references.

### _.clone() and _.cloneDeep()

Lacks deep cloning support and ES5 support.  One of the reason why I
resorted to writing this.

Lo-dash has _.cloneDeep() yet still lacks ES5 suppport.

+ http://underscorejs.org/#clone
+ http://lodash.com/docs#cloneDeep

### The structured clone algorithm

Roughly the same but Blob, File and other user-agent specific objects
are not yet supported.  Unfortunately it is used only internally to
exchange data with WebWorkers.

+ https://developer.mozilla.org/en-US/docs/DOM/The_structured_clone_algorithm
+ http://www.w3.org/html/wg/drafts/html/master/infrastructure.html#safe-passing-of-structured-data
