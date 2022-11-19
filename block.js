const {GENESIS_DATA} = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
    timestamp;
    lastHash;
    hash;
    data;
    nonce;
    difficulty;

    constructor({timestamp, lastHash, hash, data, nonce, difficulty}) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }

    static genesis() {
        return new this(GENESIS_DATA);
    }

    static mineBlock({ lastBlock, data}) {
        let timestamp, hash;
        const lastHash = lastBlock.hash;
        const {difficulty} = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            hash = cryptoHash(timestamp, lastBlock.hash, data, nonce, difficulty)
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this({ timestamp, lastHash, data, hash, difficulty, nonce });
    };
}

module.exports = Block;
