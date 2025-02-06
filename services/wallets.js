const schema = require('../models/wallets');

const getItems = async (limit) => {
    let result;
    if (limit == -1) {
        result = await schema.find({}).lean(); // Fetch all items if limit == -1
    } else {
        result = await schema.find({}).limit(limit).lean(); // Fetch limit items
    }
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

module.exports = {
    getItems,
    createItem,
    updateItem,
    deleteItem
}