/*
 * use mocha to test me
 * http://visionmedia.github.com/mocha/
 */
var assert;
if (this['window'] !== this) {
    assert = require("assert");
}
ok = function (pred) {
    return function () {
        assert(pred)
    }
};
eq = function (a, e, m) {
    return function () {
        assert.equal(a, e, m)
    }
};
eq_deeply = function (a, e, m) {
    return function () {
        assert.equal(JSON.stringify(a), JSON.stringify(e), m)
    }
};
