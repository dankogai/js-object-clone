/*
 * usage:
 *   mocha --harmony test/harmony.js
 * use mocha to test me
 * http://visionmedia.github.com/mocha/
 */
if (this['window'] !== this) {
    require('./helper.js');
    require('../object-clone.js');
}
var HASWEAKMAP = (function() { // paranoia check
    try {
        var wm = new WeakMap();
        wm.set(wm, wm);
        return wm.get(wm) === wm;
    } catch(e) {
        return false;
    }
})();
if (!HASWEAKMAP) {
    describe('No WeakMap, No Circular Reference', function(){
        var err;
        try {
            var mom = [], kid;
            mom.push(mom);
            kid = Object.clone(mom, true);
        } catch(e) {
            err = e;
        }
        it(err, ok(err));
    })
} else {
     describe('Object.equals() w/ circular reference', function () {  
        var a = [], b = [];
        a.push(a); 
        it ('Object.equals(a, b) == false', eq(Object.equals(a,b), false));
        b.push(b);
        it ('Object.equals(a, b) === true', eq(Object.equals(a,b), true));
        a.push(b); 
        it ('Object.equals(a, b) === false', eq(Object.equals(a,b), false));
        b.push(a);
        it ('Object.equals(a, b) === true', eq(Object.equals(a,b), true));
    })
    describe('Object.clone() w/ circular reference', function () {
        var mom = [], kid;
        mom.push(mom);
        kid = Object.clone(mom, true);
        it('Object.isnt(mom,kid)   // mom[0] = mom',  
           ok(Object.isnt(mom, kid)));
        it('Object.equals(mom,kid) // mom[0] = mom', 
           ok(Object.isnt(mom, kid)));
        mom = []; kid = []; mom.push(kid); kid.push(mom);
        it('Object.isnt(mom,kid)   // mom[0] = kid, kid[0] = mom',
           ok(Object.isnt(mom, kid)));
        it('Object.equals(mom,kid) // mom[0] = kid, kid[0] = mom', 
           ok(Object.isnt(mom, kid)));
        mom = new Map();
        mom.set(mom, mom);
        it('Object.isnt(mom,kid)   // mom.set(mom, mom)',
           ok(Object.isnt(mom, kid)));
        it('Object.equals(mom,kid) // mom.set(mom,mom)',
           ok(Object.isnt(mom, kid)));
    })
}
