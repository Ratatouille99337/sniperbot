module.exports = {
    endpoint: 'https://wallet.pawchain.net',
    address: {
      usdcTokenAddress: 'pawc00000000000000000000000000000000000000000000000000',
      pawTokenAddress: 'pawx00000000000000000000000000000000000000000000000000',
      swapRouterAddress: 'pawr00000000000000000000000000000000000000000000000000',
      pawPairAddress: 'pawq0000000000000000000000000000000000000000000000000000000000',
    },
    snipingToken : 'ruI7u3yGofrBq136mrJshFt1qkn1CsmigFeuwseAm2yi6lby', // Sniping Token Address
    walletCount : 5, // wallet count you want to use
    pawAmountToSubWallet : 1000000000000, // PAW amount you want to send to sub wallets
    minLiquidity: 2000, // Minimum Price of Liquidity to buy token
    buyTokenCount: 6,  // To sell token after 6 buy
    defaultSubWalletPassword: process.env.DEFAULT_SUB_WALLET_PASSWORD,
    percentToBuy: 0.02, // 0.02 percent of total supply of token.
    mainWallet: {
      address: process.env.MAIN_WALLET_ADDRESS,
      password: process.env.MAIN_WALLET_PASSWORD,
    }
}