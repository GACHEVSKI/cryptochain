const Blockchain = require('./blockchain');
const Block = require('./block');

describe('Blockchain', () => {
    let blockchain;
    let newChain;
    let originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
    });

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

    describe('isValidChain', () => {
        describe('When tha chain doesn`t start with genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-data'};

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            })

        });

        describe('When the chain starts with the genesis block and has multiple blocks', () => {
            beforeEach(() => {
                blockchain.addBlock({ data: 'Bear' });
                blockchain.addBlock({ data: 'Beets' });
                blockchain.addBlock({ data: 'Battlestar Galactica' });
            });

            describe('and lastHash refernce has changed ', () => {
                it('returns false', () => {

                    blockchain.chain[2].lastHash = 'broken-last-hash';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe('and the chain contains block with invalid field', () => {
               it('returns false', () => {
                   blockchain.chain[2].data = 'Bad and evil data';
                   expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
               });

               describe('and the chaind doesn`t contain invaalid blocks', () => {
                   it('returns true', () => {
                       expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                   });
               })
            });
        })

    });

    // Replace chain
    describe('replaceChain()', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('when the new chain is not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'};
                blockchain.replaceChain(newChain.chain);
            });

            it('does not replace the chain', () => {
                expect(originalChain).toBe(blockchain.chain);
            });

            it('logs an error', () => {
                expect(errorMock).toBeCalled();
            });
        });

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'Bear' });
                newChain.addBlock({ data: 'Beets' });
                newChain.addBlock({ data: 'Battlestar Galactica' });
            });

            describe('and chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash';
                    blockchain.replaceChain(newChain.chain);
                });

                it('doesn`t replaces the chain', () => {
                    expect(originalChain).toBe(blockchain.chain);
                });

                it('logs an error', () => {
                    expect(errorMock).toBeCalled();
                });
            });

            describe('and chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('replaces the chain', () => {
                    expect(newChain.chain).toBe(blockchain.chain);
                });

                it('logs about chain replacement', () => {
                    expect(logMock).toBeCalled();
                });
            });
        });
    });
})
