const Block = require("./block");
const {GENESIS_DATA} = require("./config");
const cryptoHash = require("./crypto-hash");

describe('Block', () => {
    const timestamp = 'a-date';
    const lastHash = 'foo-lasthash';
    const hash = 'foo-hash';
    const data = ['blockchain', 'data'];
    const block = new Block({lastHash, hash, data, timestamp});

    it('has a timestamp, lastHash, hash, data properies', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('returns a Block instance', () => {
            expect(genesisBlock instanceof Block).toBeTruthy();
        });

        it('returns the genesis data', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mine data';
        const minedBlock = Block.mineBlock({
            data,
            lastBlock
        });

        it('returns a Block instance', () => {
            expect(minedBlock instanceof Block).toBeTruthy();
        })

        it('sets the `lastHash` to be the `hash` of the last block', () => {
            expect(lastBlock.hash).toEqual(minedBlock.lastHash);
        })

        it('sets the `data`', () => {
            expect(minedBlock.data).toBe(data);
        })

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        })

        it('creates a SHA-256`hash` pased on proper input', () => {
            expect(minedBlock.hash).toEqual(cryptoHash(minedBlock.timestamp, minedBlock.lastHash, minedBlock.data));
        })
    })
});
