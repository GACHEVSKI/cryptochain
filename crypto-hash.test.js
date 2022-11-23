const cryptoHash = require("./crypto-hash");

describe('cryptoHash()', () => {
    const FOO_HASH = '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae';
    it('generates a SHA-256 hashed output', () => {
        expect(cryptoHash('foo')).toEqual(FOO_HASH);
    });

    it('produced the same hash with the same input arguments in any orders', () => {
        expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'one', 'two'));
    })
})
