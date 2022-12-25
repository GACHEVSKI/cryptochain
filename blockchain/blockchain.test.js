const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require("../util/crypto-hash");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");

describe('Blockchain', () => {
    let blockchain;
    let newChain;
    let originalChain;
    let errorMock, logMock;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();
        originalChain = blockchain.chain;
        errorMock = jest.fn();
        logMock = jest.fn();

        global.console.error = errorMock;
        global.console.log = logMock;
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

                describe('and the chain contains block with a jump difficulty', () => {
                    it('returns false', () => {
                        const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                        const lastHash = lastBlock.hash;
                        const timestamp = Date.now();
                        const nonce = 0;
                        const data = [];
                        const difficulty = lastBlock.difficulty - 3;
                        const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);

                        const badBlock = new Block({
                            data, lastHash, hash, timestamp, nonce, difficulty
                        });

                        blockchain.chain.push(badBlock);
                        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                    });
                });

               describe('and the chain doesn`t contain invalid blocks', () => {
                   it('returns true', () => {
                       expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                   });
               })
            });
        })

    });

    // Replace chain
    describe('replaceChain()', () => {
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

        describe('and the valid transaction is flag is true ', () => {
           it('calls a validTransactionData()', () => {
               const validTransactionDataMock = jest.fn();
               blockchain.validTransactionData = validTransactionDataMock;

               newChain.addBlock({ data: 'foo' });
               blockchain.replaceChain(newChain.chain, true);
               expect(validTransactionDataMock).toBeCalled();
           });
        });
    });

    describe('validTransactionData()', () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({
                recipient: 'foo-address',
                amount: 65
            });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });

        });

        describe('and the transaction data is valid', () => {
            it('returns true', () => {
                newChain.addBlock({data: [transaction, rewardTransaction]});
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeTruthy();
                expect(errorMock).not.toBeCalled();

            });
        });

        describe('and transaction data has multiple rewards', () => {
            it('returns false', () => {
                newChain.addBlock({data: [transaction, rewardTransaction, rewardTransaction]});
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                expect(errorMock).toBeCalled();
            });
        });

        describe('and the transaction data has at least one malformed output map', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false', () => {
                    transaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({data: [transaction, rewardTransaction]});
                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                    expect(errorMock).toBeCalled();
                });
            });

            describe('and the transaction is reward transaction', () => {
                it('returns false', () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;
                    newChain.addBlock({ data: [transaction, rewardTransaction] });
                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                    expect(errorMock).toBeCalled();
                });
            });
        });

        describe('and the transaction data has at least one malformed input', () => {
            it('returns false', () => {
                wallet.balance = 9000;

                const evilOutputMap = {
                    [wallet.publicKey]: 8900,
                    fooRecipient: 100
                };

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOutputMap)
                    },
                    outputMap: evilOutputMap
                }

                newChain.addBlock({
                    data: [evilTransaction, rewardTransaction]
                });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                expect(errorMock).toBeCalled();
            });
        });

        describe('and a block contains multiple identical transactions', () => {
            it('returns false', () => {
                newChain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction]
                });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBeFalsy();
                expect(errorMock).toBeCalled();
            });
        });
    });
})
