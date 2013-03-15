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

This script installs following functions to *Object*

### Object.clone( _obj_ , _deep_ )

Clones the object _obj_.  When _deep_ is `true`, it attempts to deep clone _obj_.

Unlike many other implementations of object cloners,  This one:

+ can deep clone upon request
+ copies the ES5 descriptor of every property that `Object.getOwnPropertyDescriptor()` returns
+ copies the restriction of the object that the following functions cast upon:
 + `Object.preventExtensions()`
 + `Object.seal()`
 + `Object.freeze()`

#### Custom Objects

You can clone custom objects so long as its constructor is written in JavaScript:

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
log( Object.equals(src, dst)  );   // false
log( dst.distance(Point(0,0)) );   // 5
````

If the type of _obj_ is unsupported, it throws `TypeError`:

````javascript
dst = Object.clone(new Error);  //  [object Error] unsupported
````
#### Why DOM Elements are not supported

Note DOM Elements are not supported.  It already has `.cloneNode` so use it.

cf. https://developer.mozilla.org/en-US/docs/DOM/Node.cloneNode

It is rather trivial to add support for that since all you have to do is delegate it to _obj_.cloneNode( _deep_ ) (as a matter of fact my early code did support that).  But the author decided to drop that since `uneval()` of Firefox does not support that.

### Object.equals( _objX_, _objY_ )

Compares the _value_ of each property in _objX_ and _objY_ and returns `true` iff all properties are equal, otherwise `false`.

Like `Object.clone()`, `Object.equals()`:

+ compares ES5 descriptor
+ compares restriction

### `Object.is()` and `Object.isnt()`

The following ES6 functions are also defined unless predefined (like Chrome 25):

+ Object.is()
+ Object.isnt()

See http://wiki.ecmascript.org/doku.php?id=harmony:egal for details.

BUGS
----

Like `JSON`, `Object.clone()` and `Object.equals()` cannot handle circular references.

It is not impossible to handle circular references in JavaScript since you can check if the objects are identical via `===` operator. Yet it is very impractical without object ID like [object_id] of Ruby or `refaddr` of Perl.  Without object ID you have to linear search just to check if the object is already visited.  As a matter of fact the reference implementation of [Map and Set of ES6] resorts to linear search.

[object_id]:http://ruby-doc.org/core-2.0/Object.html#method-i-object_id
[refaddr]:http://perldoc.perl.org/Scalar/Util.html
[Map and Set of ES6]: http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets

With ES5 you can add hidden, immutable properties like `.__id__` via `Object.defineProperty` but mutating objects for that is rude if not unforgivable.

SEE ALSO
--------
### eval(uneval(obj))

Available only on firefox.  Handles circular references.

### _.clone() and _.cloneDeep()

Lacks deep cloning support and ES5 support.  One of the reason why I resorted to writing this.

Lo-dash has _.cloneDeep() yet still lacks ES5 suppport.

+ http://underscorejs.org/#clone
+ http://lodash.com/docs#cloneDeep

### The structured clone algorithm

Roughly the same but Blob, File and other user-agent specific objects are not yet supported.

+ https://developer.mozilla.org/en-US/docs/DOM/The_structured_clone_algorithm
+ http://www.w3.org/html/wg/drafts/html/master/infrastructure.html#safe-passing-of-structured-data
