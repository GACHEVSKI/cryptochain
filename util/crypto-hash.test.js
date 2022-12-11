const cryptoHash = require("./crypto-hash");

describe('cryptoHash()', () => {
    const FOO_HASH = 'b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b';
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('foo')).toEqual(FOO_HASH);
    });

    it('produced the same hash with the same input arguments in any orders', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    });

    it('produces a unique hash when the properties have change on an input', () => {
        const foo = {};
        const originalHash = cryptoHash(foo);
        foo['a'] = 'a';
        const newHash = cryptoHash(foo);
        expect(originalHash).not.toEqual(newHash);
    });
})
