/*
 * $Id: object-clone.js,v 0.20 2013/03/16 11:08:13 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 */

(function(global) {
    'use strict';
    if (!Object.freeze || typeof Object.freeze !== 'function') {
        throw Error('ES5 support required');
    }
    // from ES5
    var create = Object.create,
    defineProperty = Object.defineProperty,
    defineProperties = Object.defineProperties,
    getOwnPropertyNames = Object.getOwnPropertyNames,
    getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor,
    getPrototypeOf = Object.getPrototypeOf,
    freeze = Object.freeze,
    isFrozen = Object.isFrozen,
    isSealed = Object.isSealed,
    seal = Object.seal,
    isExtensible = Object.isExtensible,
    preventExtensions = Object.preventExtensions,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    toString = Object.prototype.toString,
    isArray = Array.isArray,
    slice = Array.prototype.slice;
    // Utility functions; some exported
    var extend = function(dst, src) {
        getOwnPropertyNames(src).forEach(function(k) {
            defineProperty(
                dst, k, getOwnPropertyDescriptor(src, k)
            )
        });
        return dst;
    };
    var defaults = function(dst, src) {
        getOwnPropertyNames(src).forEach(function(k) {
            if (!hasOwnProperty.call(dst, k)) defineProperty(
                dst, k, getOwnPropertyDescriptor(src, k)
            );
        });
        return dst;
    };
    var defspec = extend( 
        create(null), getOwnPropertyDescriptor(Object, 'freeze')
    );
    delete defspec.value;
    var toSpec = function(v) { 
        return typeof(v) !== 'function' ? v
            : extend(extend(create(null), defspec), { value: v });
    };
    var defSpecs = function(src) {
        var specs = create(null);
        getOwnPropertyNames(src).forEach(function(k) {
            defineProperty(specs, k, toSpec(src[k]))
        });
        return specs;
    };
    var isObject = function(o) { return o === Object(o) };
    var isPrimitive = function(o) { return o !== Object(o) };
    var isFunction = function(f) { return typeof(f) === 'function' };
    var signatureOf = function(o) { return toString.call(o) };
    var HASWEAKMAP = (function() { // paranoia check
        try {
            var wm = WeakMap();
            wm.set(wm, wm);
            return wm.get(wm) === wm;
        } catch(e) {
            return false;
        }
    })();
    // exported
    function is (x, y) {
        return x === y
            ? x !== 0 ? true
            : (1 / x === 1 / y) // +-0
        : (x !== x && y !== y); // NaN
    };
    function isnt (x, y) { return !is(x, y) };
    function equals (x, y) {
        var vx, vy;
        if (HASWEAKMAP) {
            vx = WeakMap();
            vy = WeakMap();
        }
        return (function _equals(x, y) {
            if (isPrimitive(x)) return is(x, y);
            if (isFunction(x))  return is(x, y);
            // check deeply
            var sx = signatureOf(x), sy = signatureOf(y);
            var i, l, px, py, sx, sy, kx, ky, dx, dy, dk;
            if (sx !== sy) return false;
            switch (sx) {
            case '[object Array]':
            case '[object Object]':
                if (isExtensible(x) !== isExtensible(y)) return false;
                if (isSealed(x) !== isSealed(y)) return false;
                if (isFrozen(x) !== isFrozen(y)) return false;
                if (vx) {
                    if (vx.has(x)) {
                        // console.log('circular ref found');
                        return vy.has(y);
                    }
                    vx.set(x, true);
                    vy.set(y, true);
                }
                px = getOwnPropertyNames(x),
                py = getOwnPropertyNames(y);
                if (px.length != py.length) return false;
                px.sort(); py.sort();
                iter: for (i = 0, l = px.length; i < l; ++i) {
                    kx = px[i];
                    ky = py[i];
                    if (kx !== ky) return false;
                    dx = getOwnPropertyDescriptor(x, ky);
                    dy = getOwnPropertyDescriptor(y, ky);
                    if (!_equals(dx.value, dy.value)) return false
                    delete dx.value;
                    delete dy.value;
                    for (dk in dx) {
                        if (!is(dx[dk], dy[dk])) return false;
                    }
                }
                return true;
            case '[object RegExp]':
            case '[object Date]':
            case '[object String]':
            case '[object Number]':
            case '[object Boolean]':
                return ''+x === ''+y;
            default:
                throw TypeError(sx + ' not supported');
            }
        })(x, y);
    }
    function clone(src, deep) {
        var wm;
        if (deep && HASWEAKMAP) {
            wm = WeakMap();
        }
        return (function _clone(src) {
            // primitives and functions
            if (isPrimitive(src)) return src;
            if (isFunction(src)) return src;
            var sig = signatureOf(src);
            switch (sig) {
            case '[object Array]':
            case '[object Object]':
                if (wm) {
                    if (wm.has(src)) {
                        // console.log('circular ref found');
                        return src;
                    }
                    wm.set(src, true);
                }
                var isarray = isArray(src);
                var dst = isarray ? [] : create(getPrototypeOf(src));
                getOwnPropertyNames(src).forEach(function(k) {
                    // Firefox forbids defineProperty(obj, 'length' desc)
                    if (isarray && k === 'length') {
                        dst.length = src.length;
                    } else {
                        var desc = getOwnPropertyDescriptor(src, k);
                        if (deep && 'value' in desc) 
                            desc.value = _clone(src[k]);
                        defineProperty(dst, k, desc);
                    }
                });
                if (!isExtensible(src)) preventExtensions(dst);
                if (isSealed(src)) seal(dst);
                if (isFrozen(src)) freeze(dst);
                return dst;
            case '[object RegExp]':
            case '[object Date]':
            case '[object String]':
            case '[object Number]':
            case '[object Boolean]':
                return deep ? new src.constructor(src.valueOf()) : src;
            default:
                throw TypeError(sig + ' is not supported');
            }
        })(src);
    };
    // Object
    defaults(Object, defSpecs({
        clone: clone,
        is: is,
        isnt: isnt,
        equals: equals
    }));
})(this);
