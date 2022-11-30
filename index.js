const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const Blockchain = require("./blockchain");
const PubSub = require('./pubsub');

const app = express();
const blockchain = new Blockchain();
const pubSub = new PubSub({blockchain});

const DEFAULT_PORT = 3000;
const ROOT_NODE_REQUEST = `http://localhost:${DEFAULT_PORT}`;
setTimeout(() => pubSub.broadcastChain(), 1000);

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

const syncChains = () => {
    axios.get(`${ROOT_NODE_REQUEST}/api/blocks`).then(res => {
        blockchain.replaceChain(res.data)
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
    syncChains();
});
