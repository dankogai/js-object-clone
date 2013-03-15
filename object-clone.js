/*
 * $Id$
 *
 *  Licensed under the MIT license.
 *  http://www.opensource.org/licenses/mit-license.php
 *
 *  References:
 *    http://es5.github.com/
 *    http://wiki.ecmascript.org/doku.php?id=harmony:proposals
 *    https://github.com/paulmillr/es6-shim/
 */

(function(global) {
    'use strict';
    if (!Object.freeze || typeof Object.freeze !== 'function') {
        throw Error('ES5 unsupported');
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
    var hasProtoFunction = function(name) {
        return function(e) {
            return isPrimitive(o)              ? false
                : !o[name]                     ? false
                : hasOwnProperty.call(o, name) ? false
                : !isFunction(o[name])         ? false
                : true;
        };
    };
    var canCloneNode = hasProtoFunction('cloneNode');
    var canClone = hasProtoFunction('clone');
    // exported
    function is (x, y) {
        return x === y
            ? x !== 0 ? true
            : (1 / x === 1 / y) // +-0
        : (x !== x && y !== y); // NaN
    };
    function isnt(x, y) { return !is(x, y) };
    function equals(x, y) {
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
            px = getOwnPropertyNames(x),
            py = getOwnPropertyNames(y);
            if (px.length != py.length) return false;
            px.sort(); py.sort();
            for (i = 0, l = px.length; i < l; ++i) {
                kx = px[i];
                ky = py[i];
                if (kx !== ky) return false;
                dx = getOwnPropertyDescriptor(x, ky);
                dy = getOwnPropertyDescriptor(y, ky);
                if (!equals(dx.value, dy.value)) return false
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
            throw TypeError(sx + ' unsupported');
        }
    };
    function clone(src, deep) {
        // primitives and functions
        if (isPrimitive(src)) return src;
        if (isFunction(src)) return src;
        var sig = signatureOf(src);
        switch (sig) {
        case '[object Array]':
        case '[object Object]':
            var dst = isArray(src) ? [] : create(getPrototypeOf(src));
            getOwnPropertyNames(src).forEach(function(k) {
                var desc = getOwnPropertyDescriptor(src, k);
                if (deep && 'value' in desc) desc.value = clone(src[k], deep);
                defineProperty(dst, k, desc);
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
            throw TypeError(sig + ' unsupported');
        }
    };
    // Object
    defaults(Object, defSpecs({
        clone: clone,
        is: is,
        isnt: isnt,
        equals: equals
    }));
})(this);
