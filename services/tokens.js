const schema = require('../models/tokens');
const utils = require('../utils');

const getItems = async () => {
    const result = await schema.find({}).lean();
    return result;
}

const getRefundedItems = async () => {
    const result = await schema.find({
        refund : false
    }).lean();
    return result;
}

const createItem = async (data) => {
    let result;
    let bFlag = true;
    while(bFlag) 
    {
        await schema.create(data)
        .then((res) => {
            result = res;
            bFlag = false
        })
        .catch(() => {
            console.log('Error: createItem in wallets');
        });

        if(bFlag)
            await utils.delay(500);
    }

    return result;
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

const updateItemRefund = async (data) => {
    const result = await schema.findById(data._id);
    result.buyCount = data.buyCount;
    result.buyAmount = data.buyAmount;
    result.sellCount = data.sellCount;
    result.sellAmount = data.sellAmount;
    result.refund = data.refund;
    await result.save();
    return result;
}

module.exports = {
    getItems,
    createItem,
    updateItem,
    deleteItem,
    updateItemRefund,
    getRefundedItems
}