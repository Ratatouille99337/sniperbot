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

const buyProcess = async () => {
    let bFlag = true;
    do {
        const liquidityTokens = await apis.getLiquidityTokens();

        const filteredToken = settings.tokensFromDB.filter(token => token.tokenAddress == config.snipingToken);
        if (filteredToken.length > 0) {
            console.log(`Token is already bought. ${filteredToken[0].tokenAddress}`);
            bFlag = false;
            continue;
        }

        let snipingTokenLiquidity = liquidityTokens.filter(item => config.snipingToken == item.token_address)

        if(snipingTokenLiquidity.length == 0) {
            console.log(`Token doesn't have liquidty yet. ${filteredToken[0].tokenAddress} \n Continue...`);
            continue;
        }

        snipingTokenLiquidity = snipingTokenLiquidity[0];

        if(snipingTokenLiquidity.pair_data.token_a == config.address.pawTokenAddress) {

            // Making API Request to reduce await delay.
            const apiRequests = [ apis.getTokenPriceByTokenAddress(config.address.pawTokenAddress), apis.getTokenPriceByTokenAddress(config.snipingToken), apis.getTotalSupplyByTokenAddress(config.snipingToken), apis.getTokenAmountByWalletAddress(config.mainWallet.auth_token, config.address.pawTokenAddress), apis.getPawPrice() ];

            const responses = await Promise.all(apiRequests);

            const pawPrice = responses[0];
            const snipingTokenPrice = responses[1];
            const snipingTokenTotalSupply = responses[2];
            // const mainWalletPawAmount = Number(responses[3]);

            const snipingTokenAmount = snipingTokenTotalSupply * config.percentToBuy; // 0.02 %

            // const safeGasFee = 5 / pawPrice; // Safe Gas Fee is 5 USD in PAW.
            const pawSwapAmount = ((snipingTokenAmount * snipingTokenPrice) / pawPrice); // Calculate PAW amount to swap
            
            // if(mainWalletPawAmount < ((pawSwapAmount + safeGasFee) * settings.usingWalletsFromDB.length)) {
            //     console.log(`PAW balance of main wallet is not enough! Minimum PAW: ${((pawSwapAmount + safeGasFee) * settings.usingWalletsFromDB.length)} to buy ${config.snipingToken} \n Continue...`);
            //     continue;
            // }

            const liquidityPrice = pawPrice * Number(snipingTokenLiquidity.pair_data.token_a_amount);

            if (liquidityPrice <= config.minLiquidity) // if liquidity price is more than 2000 USD
            {
                console.log(`Low Liquidity: ${config.snipingToken}\n Waiting Add Liquidity. Continue...`)
                continue;
            }

            // let tokenTransferRequests = [];

            // for(let buyWallet of settings.usingWalletsFromDB) {
            //     tokenTransferRequests.push(
            //         apis.tokenTransferOnchainWithMultisig(buyWallet.address, config.address.pawTokenAddress, (pawSwapAmount + safeGasFee), '', config.mainWallet.auth_token)
            //     )
            // }

            // await Promise.all(tokenTransferRequests);

            let swapTokenInfo = {
                tokenAddress: config.snipingToken,
                pairAddress: '',
                wallets: [],
                buyCount: 0,
                buyAmount: 0,
                sellCount: 0,
                sellAmount: 0,
                refund: false,
            }

            for (let buyWallet of settings.usingWalletsFromDB) {
                const swapToAmountResult = await apis.getSwapToAmount(config.address.pawTokenAddress, config.snipingToken, pawSwapAmount, buyWallet.address);
                const estimatedOut = swapToAmountResult.impact.amount;
                swapTokenInfo.pairAddress = swapToAmountResult.impact.steps[0].pair;

                await apis.swapProcess(config.address.pawTokenAddress, config.snipingToken, pawSwapAmount, estimatedOut, buyWallet.auth_token);
                console.log(`Token Buy: ${pawSwapAmount} PAW to ${estimatedOut} ${config.snipingToken} using wallet: ${buyWallet.address}`);
                swapTokenInfo.wallets.push({
                    walletAddress: buyWallet.address,
                    amount: estimatedOut
                });
            }

            settings.tokensFromDB.push(swapTokenInfo);
            await tokenService.createItem(swapTokenInfo);
        }

        console.log("Waiting for 5 seconds...");
        await utils.delay(5000);
    } while(bFlag)
    process.exit(0);
}

const main = async () => {
    mongoose.Promise = Promise;
    await mongoose.connect(process.env.MONGODB_URL).then(() => {
        console.log("MongoDB is connected.")
    });
    
    settings.usingWalletsFromDB = await walletService.getItems(config.walletCount);
    settings.tokensFromDB = await tokenService.getItems();
    const mainResult = await mainService.getItemByAddress(config.mainWallet.address);
    if (mainResult.length == 0) {
        console.log('Main Account does not exist!. Pleaes start wallet.js at first');
    } else {
        config.mainWallet.pKey = mainResult[0].pKey;
        config.mainWallet.auth_token = mainResult[0].auth_token;
        buyProcess();
    }
}

main();