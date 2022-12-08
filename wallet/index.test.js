const Walled = require('./index');
const {verifySignature} = require("../util");

describe('Wallet', () => {
    let wallet;

    beforeEach(() => {
        wallet = new Walled();
    });

    it('has a balance', () => {
        expect(wallet).toHaveProperty('balance');
    });

    it('has a public key', () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe('signing data', () => {
        const data = 'foobar';

        it('verifies a signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: wallet.sign(data)
            })).toBeTruthy();
        });

        it('does not verifies an invalid signature', () => {
            expect(verifySignature({
                publicKey: wallet.publicKey,
                data,
                signature: new Walled().sign(data)
            })).toBeFalsy();
        })
    });
});
