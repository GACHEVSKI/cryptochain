const Block = require("./block");
const {GENESIS_DATA, MINE_RATE} = require("../config");
const cryptoHash = require("../util/crypto-hash");
const hexToBinary = require("hex-to-binary");

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'foo-lasthash';
    const hash = 'foo-hash';
    const data = ['blockchain', 'data'];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({lastHash, hash, data, timestamp, nonce, difficulty});

    it('has a timestamp, lastHash, hash, data properies', () => {
        expect(block.timestamp).toEqual(timestamp);
        expect(block.lastHash).toEqual(lastHash);
        expect(block.hash).toEqual(hash);
        expect(block.data).toEqual(data);
        expect(block.nonce).toEqual(nonce);
        expect(block.difficulty).toEqual(difficulty);
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
        });

        it('sets the `lastHash` to be the `hash` of the last block', () => {
            expect(lastBlock.hash).toEqual(minedBlock.lastHash);
        });

        it('sets the `data`', () => {
            expect(minedBlock.data).toBe(data);
        });

        it('sets a `timestamp`', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('creates a SHA-256`hash` passed on proper input', () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    minedBlock.nonce,
                    minedBlock.difficulty,
                    minedBlock.lastHash,
                    minedBlock.data
                )
            );
        });

        it('sets a `hash` that matches the difficulty criteria', () => {
            expect(hexToBinary(minedBlock.hash).substr(0, minedBlock.difficulty)).toEqual('0'.repeat(minedBlock.difficulty));
        });

        describe('adjusts the difficulty', () => {
            const possibleResults = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];

            expect(possibleResults.includes(minedBlock.difficulty)).toBeTruthy();
        });
    });

    describe('adjustDifficulty', () => {
        it('raises the difficulty for a quickly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100
            })).toEqual(block.difficulty + 1);
        });

        it('raises the difficulty for a slowly mined block', () => {
            expect(Block.adjustDifficulty({
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100
            })).toEqual(block.difficulty - 1);
        });

        it('has a lower limit of 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({originalBlock: block})).toEqual(1);
        });
    });
});
