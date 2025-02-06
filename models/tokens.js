const mongoose = require('mongoose');

const TokensSchema = new mongoose.Schema({
    tokenAddress: {
        type: String
    },
    wallets: {
        type: Array
    },
    pairAddress: {
        type: String
    },
    buyCount: {
        type: Number
    },
    buyAmount: {
        type: Number
    },
    sellCount: {
        type: Number
    },
    sellAmount: {
        type: Number
    },
    refund: {
        type: Boolean
    }
});

module.exports = mongoose.model("tokens", TokensSchema);