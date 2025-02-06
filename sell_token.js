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

const sellProcess = async () => {
    let latestBlockNumber = 0;
    do {

        settings.tokensFromDB = await tokenService.getRefundedItems();

        if(settings.tokensFromDB.length == 0) {
            console.log(`Nothing not refunded token. Waiting 5 seconds...`);
            await utils.delay(5000);
            continue;
        }

        const currentBlockNumber = await apis.getBlockNumber();

        // Fixed to don't spam messages to groups
        latestBlockNumber = latestBlockNumber == 0? currentBlockNumber: latestBlockNumber;
  
        console.log(`latestBlockNumber: ${latestBlockNumber}, currentBlockNumber: ${currentBlockNumber}`);
  
        if(currentBlockNumber > latestBlockNumber) {
            const params =  {
                fromBlock: String(latestBlockNumber + 1),
                toBlock: String(currentBlockNumber),
            };

        // if(true) {
        //     const params =  {
        //         fromBlock: String(113032),
        //         toBlock: String(113032),
        //     };

        const eventsResponse = await apis.getEvents(params);

        const uniqueEvents = utils.uniqueEvents(eventsResponse);

        for(let event  of uniqueEvents || []) {

            if(event.eventType == 'swap') {
                let swapType = '';
                if (event.asset0In == '0' && event.asset1Out == '0') {
                    swapType = 'sell' // Swap ABC token To PAW
                } else if (event.asset0Out == '0' || event.asset1In == '0') {
                    swapType = 'buy' // Swap PAW to ABC token
                }
                
                for(let i = 0; i < settings.tokensFromDB.length; i++ ) {

                    if (settings.tokensFromDB[i].pairAddress == event.pairId && swapType == 'buy') {
                        settings.tokensFromDB[i].buyCount ++;
                    }

                    // if (settings.tokensFromDB[i].pairAddress == event.pairId && swapType == 'sell') {
                    //     settings.tokensFromDB[i].sellCount ++;
                    // }
                    
                    if (settings.tokensFromDB[i].buyCount >= config.buyTokenCount) {

                        const tokenAmountRequests = [];
                        for (let wallet of settings.tokensFromDB[i].wallets) {
                            const buyWallet = settings.allWalletsFromDB.filter(item => item.address == wallet.walletAddress)[0];
                            tokenAmountRequests.push(apis.getTokenAmountByWalletAddress(buyWallet.auth_token, settings.tokensFromDB[i].tokenAddress));
                        }
                        const tokenAmountResults = await Promise.all(tokenAmountRequests);

                        let j = 0;
                        for(let wallet of settings.tokensFromDB[i].wallets) {
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

                        // let tokenTransferRequests = [];
                        let k = 0;
                        for(let wallet of settings.tokensFromDB[i].wallets) {
                            const buyWallet = settings.allWalletsFromDB.filter(item => item.address == wallet.walletAddress)[0];
                            await apis.tokenTransferOnchainWithMultisig(config.mainWallet.address, config.address.pawTokenAddress, pawAmountResults[k], '', buyWallet.auth_token);
                            console.log(`Token refund: ${pawAmountResults[k]} PAW to Main Wallet ${config.mainWallet.address}`);
                            await utils.delay(10000);
                            console.log(`Dealy 10s to next refund`);
                            k++;
                        }
                        // await Promise.all(tokenTransferRequests);

                        settings.tokensFromDB[i].refund = true;
                        // await tokenService.updateItemRefund(settings.tokensFromDB[i]);
                    }
                    await tokenService.updateItemRefund(settings.tokensFromDB[i]);
                }
            }
        }

        latestBlockNumber = currentBlockNumber;
        } else {
          console.log('Wait for 15 seconds...');
          await utils.delay(15000);
        }
    } while(true)
}

const main = async () => {
    mongoose.Promise = Promise;
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("MongoDB is connected.")
    });
    settings.allWalletsFromDB = await walletService.getItems(-1);
    sellProcess();
}

main();