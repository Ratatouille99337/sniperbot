const mongoose = require('mongoose');

const MainSchema = new mongoose.Schema({
    address: {
        type: String
    },
    password: {
        type: String
    },
    pKey: {
        type: String
    },
    auth_token: {
        type: String
    },
});

module.exports = mongoose.model("main", MainSchema);