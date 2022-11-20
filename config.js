const MINE_RATE = 1000;
const INITIAL_DIFFICULTLY = 3;

const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '----',
    hash: 'hash-one',
    data: [],
    difficulty: INITIAL_DIFFICULTLY,
    nonce: 0
};

module.exports = { GENESIS_DATA, MINE_RATE };
