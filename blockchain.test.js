const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
    const blockchain = new Blockchain();

    it('contain a `chain` Array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({data: newData})
        expect(blockchain.chain[blockchain.chain.length - 1].data).toBe(newData);
    });
})
