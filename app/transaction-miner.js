const Transaction = require("../wallet/transaction");

class TransactionMiner {
    constructor({ blockchain, transactionPool, wallet, pubSub }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubSub = pubSub;
    }

    mineTransaction() {
        const validTransaction = this.transactionPool.validTransactions();

        validTransaction.push(
            Transaction.rewardTransaction({minerWallet: this.wallet})
        );
        this.blockchain.addBlock({data: validTransaction});
        this.pubSub.broadcastChain();
        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;
