const schema = require('../models/main');
const config = require('../config');
const apis = require('../apis');
const getItems = async (limit) => {
    let result;
    if (limit == -1) {
        result = await schema.find({}).lean(); // Fetch all items if limit == -1
    } else {
        result = await schema.find({}).limit(limit).lean(); // Fetch limit items
    }
    return result;
}

const createItem = async () => {
    const pKey = await apis.getPrivateKey(config.mainWallet.address, config.mainWallet.password);
    const mainCustomResult = await apis.customAuth(pKey, config.mainWallet.password);

    const data = {
        address: config.mainWallet.address,
        password: config.mainWallet.password,
        pKey: pKey,
        auth_token: mainCustomResult.token,
    }

    let bFlag = true;

    while(bFlag) 
    {
        await schema.create(data)
        .then((res) => {
            bFlag = false
        })
        .catch(() => {
            console.log('Error: createItem in wallets');
        });

        if(bFlag)
            await utils.delay(500);
    }

    return data;
}

const updateItem = async (data) => {
    const result = await schema.findById(data._id);
    result.tokens = data.tokens;
    result.save();
    return result;
}

const deleteItem = async () => {
    const result = await schema.deleteMany({});
    return result;
}

const getItemByAddress = async (address) => {
    const result = await schema.find({
        address : address
    }).lean();
    return result;
}

module.exports = {
    getItems,
    createItem,
    updateItem,
    deleteItem,
    getItemByAddress,
}