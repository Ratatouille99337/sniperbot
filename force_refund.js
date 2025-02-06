// Modules
require("dotenv").config();
const mongoose = require('mongoose');

// Custom Modules
const apis = require("./apis");
const config = require('./config');
const settings = require('./config/settings');
const utils = require('./utils');
const walletService = require('./services/wallets');
const mainService = require('./services/main');
const tokenService = require('./services/tokens');

Promise = require('bluebird');

const forceRefund = async () => {

    settings.tokensFromDB = await tokenService.getItems();

    if(settings.tokensFromDB.length == 0) {
        console.log(`Nothing token. Process exit.`);
        process.exit();
    }

    for(let i = 0; i < settings.tokensFromDB.length; i++ ) {

        const tokenAmountRequests = [];
        for (let wallet of settings.tokensFromDB[i].wallets) {
            const buyWallet = settings.allWalletsFromDB.filter(item => item.address == wallet.walletAddress)[0];
            tokenAmountRequests.push(apis.getTokenAmountByWalletAddress(buyWallet.auth_token, settings.tokensFromDB[i].tokenAddress));
        }
        const tokenAmountResults = await Promise.all(tokenAmountRequests);

        let j = 0;
        for(let wallet of settings.tokensFromDB[i].wallets) {

            if(tokenAmountResults[j] == 0) {
                console.log(`${wallet.walletAddress} token balance is 0. continue;`);
                continue;
            }

            const buyWallet = settings.allWalletsFromDB.filter(item => item.address == wallet.walletAddress)[0];

            const swapToAmountResult = await apis.getSwapToAmount(settings.tokensFromDB[i].tokenAddress, config.address.pawTokenAddress, tokenAmountResults[j], buyWallet.address);
            // const swapToAmountResult = await apis.getSwapToAmount(settings.tokensFromDB[i].tokenAddress, config.address.pawTokenAddress, wallet.amount, buyWallet.address);
            const estimatedOut = swapToAmountResult.impact.amount;

            const swapProcessResult = await apis.swapProcess(settings.tokensFromDB[i].tokenAddress, config.address.pawTokenAddress, tokenAmountResults[j], estimatedOut, buyWallet.auth_token);
            // const swapProcessResult = await apis.swapProcess(settings.tokensFromDB[i].tokenAddress, config.address.pawTokenAddress, wallet.amount, estimatedOut, buyWallet.auth_token);
            console.log(`Selling SwapProcessResult: ${tokenAmountResults[j]}: ${settings.tokensFromDB[i].tokenAddress}`);

            j++;
        }

        // PAW Amount
        const pawAmountRequests = [];
        for (let wallet of settings.tokensFromDB[i].wallets) {
            const buyWallet = settings.allWalletsFromDB.filter(item => item.address == wallet.walletAddress)[0];
            pawAmountRequests.push(apis.getTokenAmountByWalletAddress(buyWallet.auth_token, config.address.pawTokenAddress));
        }
        const pawPrice = apis.getPawPrice();
        const pawAmountResults = await Promise.all(pawAmountRequests);

        let k = 0;
        for(let wallet of settings.tokensFromDB[i].wallets) {
            if ( pawAmountResults[k] == 0) {
                console.log(`${wallet.walletAddress} paw balance is 0. continue;`);
                continue;
            }
            const buyWallet = settings.allWalletsFromDB.filter(item => item.address == wallet.walletAddress)[0];
            await apis.tokenTransferOnchainWithMultisig(config.mainWallet.address, config.address.pawTokenAddress, pawAmountResults[k], '', buyWallet.auth_token);
            console.log(`Token refund: ${pawAmountResults[k]} PAW to Main Wallet ${config.mainWallet.address}`);
            await utils.delay(10000);
            console.log(`Dealy 10s to next refund`);
            k++;
        }
    }
    console.log('Process exit.');
    process.exit();
}

const main = async () => {
    mongoose.Promise = Promise;
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("MongoDB is connected.")
    });
    
    settings.allWalletsFromDB = await walletService.getItems(-1);

    forceRefund();
}

main();