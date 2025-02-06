const mongoose = require('mongoose');

const WalletsSchema = new mongoose.Schema({
    address: {
        type: String
    },
    password: {
        type: String
    },
    pkey: {
        type: String
    },
    auth_token: {
        type: String
    },
    expire_date: {
        type: String
    },
    mnemonic: {
        type: Array
    },
});

module.exports = mongoose.model("wallets", WalletsSchema);