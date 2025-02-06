// Modules
require("dotenv").config();
const mongoose = require('mongoose');

// Custom Modules
const apis = require("./apis");
const config = require('./config');
const settings = require('./config/settings');
const walletService = require('./services/wallets');
const mainService = require('./services/main');
const tokenService = require('./services/tokens');
const utils = require('./utils');

Promise = require('bluebird');

const main = async () => {

    mongoose.Promise = Promise;
    await mongoose.connect(process.env.MONGODB_URL)
    .then(async () => {
        console.log("MongoDB is connected.");
    });

    settings.usingWalletsFromDB = await walletService.getItems(config.walletCount);
    settings.tokensFromDB = await tokenService.getItems();

    if(settings.usingWalletsFromDB.length < config.walletCount)
    {
        const needWalletCount = config.walletCount - settings.usingWalletsFromDB.length;
        // Create Wallets automatically using createWallet API
        let createWalletRequests = [];
        for (let i = 0; i < needWalletCount; i++) {
            createWalletRequests.push(apis.createWallet(config.defaultSubWalletPassword))
        }
        const walletResponses = await Promise.all(createWalletRequests);
    
        // Get auth_token from customAuth API
        let customAuthRequests = [];
        for (let i = 0; i < needWalletCount; i++) {
            customAuthRequests.push(apis.customAuth(walletResponses[i].wallet.pKey, config.defaultSubWalletPassword))
        }
        const customAuthResponses = await Promise.all(customAuthRequests);
    
        // add wallets to database;
        const addWalletsToDbRequests = [];
        for (let i = 0; i < needWalletCount; i++) {
            const item = {
                address: walletResponses[i].wallet.address,
                password: config.defaultSubWalletPassword,
                pkey: walletResponses[i].wallet.pKey,
                auth_token: customAuthResponses[i].token,
                expire_date: customAuthResponses[i].expire_date,
                mnemonic: walletResponses[i].mnemonic,
            }
            addWalletsToDbRequests.push(walletService.createItem(item));
        }
    
        await Promise.all(addWalletsToDbRequests);
        settings.usingWalletsFromDB = await walletService.getItems(config.walletCount);
    }

    const mainResult = await mainService.getItemByAddress(config.mainWallet.address);
    if(mainResult.length == 0) {
        const itemResult = await mainService.createItem();
        config.mainWallet.pKey = itemResult.pKey;
        config.mainWallet.auth_token = itemResult.auth_token
    } else {
        config.mainWallet.pKey = mainResult[0].pKey;
        config.mainWallet.auth_token = mainResult[0].auth_token
    }

    // let tokenTransferRequests = [];

    for(let buyWallet of settings.usingWalletsFromDB) {
        // tokenTransferRequests.push(
            await apis.tokenTransferOnchainWithMultisig(buyWallet.address, config.address.pawTokenAddress, config.pawAmountToSubWallet, '', config.mainWallet.auth_token)
        // )
        console.log(`${config.pawAmountToSubWallet} PAW sending to ${buyWallet.address}`);
        await utils.delay(10000);
        console.log(`Dealy 10s to next PAW sending`);
    }

    // await Promise.all(tokenTransferRequests);
    process.exit(0);
}

main();