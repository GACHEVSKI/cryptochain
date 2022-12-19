const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const Blockchain = require("./blockchain/blockchain");
const PubSub = require('./app/pubsub');
const TransactionPool = require("./wallet/transaction-pool");
const Wallet = require("./wallet");
const TransactionMiner = require("./app/transaction-miner");

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubSub = new PubSub({blockchain, transactionPool});
const transactionMiner = new TransactionMiner({ blockchain, transactionPool, pubSub, wallet });

const DEFAULT_PORT = 3000;
const ROOT_NODE_REQUEST = `http://localhost:${DEFAULT_PORT}`;

app.use(bodyParser.json());

app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain);
});

app.post('/api/mine', (req, res) => {
    const {data} = req.body;
    blockchain.addBlock({data});
    pubSub.broadcastChain();

    res.redirect('/api/blocks');
});

app.post('/api/transact', (req, res) => {
    const {amount, recipient} = req.body;
    let transaction = transactionPool.existingTransaction({ inputAddress: wallet.publicKey });

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount })
        } else {
            transaction = wallet.createTransaction({recipient, amount, chain: blockchain.chain});
        }
    } catch (err) {
        return res.status(400).json({type: 'error', message: err.message});
    }

    transactionPool.setTransaction(transaction);

    pubSub.broadcastTransaction(transaction);

    res.json({type: 'success', transaction});
});

app.get('/api/transaction-pool-map', (req, res) => {
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransaction();

    res.redirect('/api/blocks')
});

const syncWithRootState = () => {
    axios.get(`${ROOT_NODE_REQUEST}/api/blocks`).then(res => {
        blockchain.replaceChain(res.data)
    }, err => {
        console.error(err)
    });

    axios.get(`${ROOT_NODE_REQUEST}/api/transaction-pool-map`).then(res => {
        console.log('res.data', res.data);
        transactionPool.setMap(res.data)
    }, err => {
        console.error(err)
    })
};

let PEER_PORT;

if (process.env.GENERATE_PEER_PORT) {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`Listening on ${PORT} port`);
    if (PORT !== DEFAULT_PORT) {
        syncWithRootState();
    }
});
