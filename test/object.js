/*
 * use mocha to test me
 * http://visionmedia.github.com/mocha/
 */
if (this['window'] !== this) {
    require('./helper.js');
    require('../object-clone.js');
}

var falsies = [null, void(0), false, +0, -0, NaN, ''];
describe('Object.is(nt)?', function () {
    falsies.concat([[],{}]).forEach(function(v) {
        it('Object.is('+v+','+v+') === true', 
           eq(Object.is(v,v), true));
    });
    it('Object.is(NaN,NaN) === true',    eq(Object.is(NaN,NaN), true));
    it('Object.isnt(NaN,NaN) === false', eq(Object.isnt(NaN,NaN), false));
    it('Object.is(+0,-0) === false',     eq(Object.is(+0,-0),   false));
    it('Object.isnt(+0,-0) === true',    eq(Object.isnt(+0,-0), true));
});
var wrappers = {Boolean:Boolean, Number:Number, String:String};
var jsonStr = function(o){ return JSON.stringify(o) };
describe('Object.equals', function () {
    falsies.concat([[],{}]).forEach(function(v) {
        it('Object.equals('+v+','+v+')===true', 
           eq(Object.equals(v,v), true));
    });
    // .is vs .equals
    it('Object.is([],[]) === false',    eq(Object.is([],[]), false));
    it('Object.equals([],[]) === true', eq(Object.equals([],[]), true));
    it('Object.is({},{}) === false',    eq(Object.is([],[]), false));
    it('Object.equals({},{}) === true', eq(Object.equals([],[]), true));
    Object.keys(wrappers).forEach(function(k) {
        it('Object.is(new '+k+',new ' +k+')===false', 
           eq(Object.is(new wrappers[k], new wrappers[k]), false));
        it('Object.equals(new '+k+',new ' +k+')===true', 
           eq(Object.equals(new wrappers[k], new wrappers[k]), true));
    });
    it('Object.is(new Date(0),new Date(0)) === false',
       eq(Object.is(new Date(0),new Date(0)), false));
    it('Object.equals(new Date(0),new Date(0)) === true',
       eq(Object.equals(new Date(0),new Date(0)), true));
    it('Object.is(/./,/./) === false',
       eq(Object.is(/./,/./), false));
    it('Object.equals(/./, /./) === true',
       eq(Object.equals(/./,/./), true));
    // complex objects
    var x = {'':[{undefined:[{0:0}]}]}, y = {'':[{undefined:[{0:false}]}]};
    it('Object.is('+jsonStr(x)+','+jsonStr(y)+') === false', 
       eq(Object.is(x, y), false));
    it('Object.equals('+jsonStr(x)+','+jsonStr(y)+') === true', 
       eq(Object.equals(x, y), false));
    x[''][0]['undefined'][0][0] = false;
    it('Object.equals('+jsonStr(x)+','+jsonStr(y)+') === true', 
       eq(Object.equals(x, y), true));
    // descriptors
    'enumerable configurable writable'.split(' ').forEach(function(d){
        var dx, dy;
        dx = Object.getOwnPropertyDescriptor(x, '');
        dx[d] = false;
        Object.defineProperty(x, '', dx);
        it('Object.equals() // different ' + d,
           eq(Object.equals(x, y), false));
        dy = Object.getOwnPropertyDescriptor(y, '');
        dy[d] = false;
        Object.defineProperty(y, '', dy);
        it('Object.equals() // same ' + d, 
           eq(Object.equals(x, y), true));
    });
    x = {0:1}, y = {0:1};
    'preventExtensions seal freeze'.split(' ').forEach(function(method){
        Object[method](x);
        it('Object.equals() // Object.' + method + '(x)',
           eq(Object.equals(x, y), false));
        Object[method](y);
        it('Object.equals() // Object.' + method + '(y)',
           eq(Object.equals(x, y), true));
    });
});

describe('Object.clone', function () {
    var src, jsrc, dst, err;
    falsies.forEach(function(v) {
        var jv = jsonStr(v);
        it('Object.clone('+jv+') === ' + jv, 
           ok(Object.is(Object.clone(v), v)));
    });
    [[],{}].forEach(function(v) {
        var jv = jsonStr(v);
        var c = Object.clone(v);
        it('Object.isnt(Object.clone('+jv+'),' + jv + ')', 
           ok(Object.isnt(c, v)));
        it('Object.equals(Object.clone('+jv+'),' + jv + ')', 
           ok(Object.equals(c, v)));
    });
    // wrapper objects
    Object.keys(wrappers).forEach(function(k) {
        var src = new wrappers[k];
        var dst = Object.clone(src, true);
        it('Object.isnt(Object.clone(new '+k+', true), new ' +k+')', 
           ok(Object.isnt(dst, src)));
        it('Object.equals(Object.clone(new '+k+' true), new ' +k+')', 
           ok(Object.equals(dst, src)));
    });
    src = new Date(0);
    dst = Object.clone(src, true);
    it('Object.isnt(Object.clone(new Date(0)),new Date(0))', 
       ok(Object.isnt(dst, src)));
    it('Object.isnt(Object.clone(new Date(0)),new Date(0))', 
       ok(Object.equals(dst, src)));
    src = /./;
    dst = Object.clone(src, true);
    it('Object.isnt(Object.clone(/./),/./)', 
       ok(Object.isnt(dst, src)));
    it('Object.isnt(Object.clone(/./),/./)', 
       ok(Object.equals(dst, src)));
    // complex objects
    src = {'':[{undefined:[{0:0}]}]};
    jsrc = jsonStr(src);
    dst = Object.clone(src, true);
    it('Object.isnt(Object.clone('+jsrc+'),' + jsrc + ')', 
       ok(Object.isnt(src, dst)));
    it('Object.equals(Object.clone('+jsrc+'),' + jsrc + ')', 
       ok(Object.equals(src, dst)));
    // descriptors
    'enumerable configurable writable'.split(' ').forEach(function(d){
        var dsrc;
        dsrc = Object.getOwnPropertyDescriptor(src, '');
        dsrc[d] = false;
        Object.defineProperty(src, '', dsrc);
        dst = Object.clone(src, true);
        it('Object.clone() //' + d,
           ok(Object.equals(src, dst)));
    });
    src = {'':[{undefined:[{0:0}]}]};
    'preventExtensions seal freeze'.split(' ').forEach(function(method){
        Object[method](src);
        dst = Object.clone(src, true);
        it('Object.clone() // Object.' + method + '(src)',
           ok(Object.equals(src, dst)));
    });
    src = {'':[{undefined:[{0:0}]}]};
    Object.defineProperty(src, 'x', {
        get:function(){ return 'x=' + this._x },
        set:function(v){ this._x = v }
    });
    dst = Object.clone(src, true);
    dst.x = 'x';
    it ('Object.clone() clones getter and setter', eq(dst.x, 'x=x'));
    try {
        err = '';
        src = new Error;
        dst = Object.clone(src);
    } catch(e) {
        err = e;
    }
    it('Object.clone(new Error)', ok(err));
});
