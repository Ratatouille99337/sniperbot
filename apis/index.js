// Modules
const axios = require("axios");

// Custome
const utils = require('../utils');
const config = require('../config');

const getTxById = async (txnId) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.get(
      `${config.endpoint}/api/chart/getTxById/${txnId}`,
    {
      headers: { 
        "x-api-key": process.env.API_KEY,
        timeout: 180000
      },
    }).then((res) => {
      result = res.data;
      bFlag = false;
    }).catch((error) => {
      console.error( "Error: getTxById" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getPairPrice = async (pairAddress) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.get(
      `${config.endpoint}/api/pairPrice`,
    {
      headers: { 
        params: {pairAddress},
        "x-api-key": process.env.API_KEY,
        timeout: 180000
      },
    }).then((res) => {
      result = res.data;
      bFlag = false;
    }).catch((error) => {
      console.error( "Error: getPairPrice" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getWalletTokensByAddress = async (address) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.get(
      `${config.endpoint}/api/getWalletTokensByAddress`,
    {
      headers: { "x-api-key": process.env.API_KEY },
      params: {address},
      timeout: 180000,
    }).then((res) => {
      result = res.data;
      bFlag = false;
    }).catch((e) => {
      console.error( "Error: getWalletTokensByAddress" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getWalletTokens = async (auth_token) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.get(
      `${config.endpoint}/api/getWalletTokens`,
    {
      headers: { "Authorization": `Bearer ${auth_token}` },
      timeout: 180000,
    }).then((res) => {
      result = res.data;
      bFlag = false;
    }).catch((e) => {
      console.error( "Error: getWalletTokens" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getTokenAmountByWalletAddress = async (auth_token, tokenAddress) => {
  const result = await getWalletTokens(auth_token);
  const filteredToken = result.tokens.filter((token) => token.token_address == tokenAddress)
  if (filteredToken.length <= 0) {
      return 0;
  } else {
    return filteredToken[0].value;  
  }
}

const getTokenPriceByTokenAddress = async (tokenAddress) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.get(`${config.endpoint}/api/getTokenPriceByTokenAddress`, {
      params: {tokenAddress},
      timeout: 180000
    })
    .then((res) => {
      result = res.data.price;
      bFlag = false;
    })
    .catch((error) => {
      console.error( "Error: getTokenPriceByTokenAddress" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getTotalSupplyByTokenAddress = async (tokenAddress) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.get(
      `${config.endpoint}/api/getTotalSupplyByTokenAddress`,
    {
      params: {tokenAddress},
      timeout: 180000
    }).then((res) => {
      result = res.data.totalSupply;
      bFlag = false;
    }).catch((error) => {
      console.error( "Error: getTotalSupplyByTokenAddress" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getPawPrice = async () => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.get(
      `${config.endpoint}/api/pawPrice`,
    {
        timeout: 180000,
    }).then((res) => {
      result = res.data.price;
      bFlag = false;
    }).catch((error) => {
      // console.error( "Error: getPawPrice" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getTokenInfo = async (tokenAddress) => {
    let bFlag = true;
    let result;
    while(bFlag)
    {
      await axios.get(`${config.endpoint}/api/chart/asset`, {
        params: {id: tokenAddress},
        headers: { "x-api-key": process.env.API_KEY },
        timeout: 180000
      })
      .then((res) => {
        result = res.data;
        bFlag = false;
      })
      .catch((error) => {
        console.error( "Error: getTokenInfo" );
      });
  
      if(bFlag)
        await utils.delay(500);
    }
  
    return result;
}

const getLiquidityTokens = async () => {
    let bFlag = true;
    let result;
    while(bFlag)
    {
      await axios.get(`${config.endpoint}/api/getLiquidityTokens`, {
        headers: { "Authorization": `Bearer ${config.mainWallet.auth_token}` },
        timeout: 180000
      })
      .then((res) => {
        result = res.data.tokens;
        bFlag = false;
      })
      .catch((error) => {
        console.error( "Error: getLiquidityTokens" );
      });
  
      if(bFlag)
        await utils.delay(500);
    }

    return result;
}

const getSwapToAmount = async (address_A, address_B, value_A, fromAddress) => {
    let bFlag = true;
    let result;
    while(bFlag)
    {
      await axios.get(`${config.endpoint}/api/getSwapToAmount`, {
        params: {
            address_A, 
            address_B, 
            value_A, 
            fromAddress
        },
        timeout: 180000
      })
      .then((res) => {
        result = res.data;
        bFlag = false;
      })
      .catch((error) => {
        console.error( "Error: getSwapToAmount" );
      });
  
      if(bFlag)
        await utils.delay(500);
    }
  
    return result;
}

const swapProcess = async (address_A, address_B, value_A, estimatedOut, auth_token) => {
    let bFlag = true;
    let result;
    while(bFlag)
    {
      await axios.post(
        `${config.endpoint}/api/swap`,
        { address_A, address_B, value_A, estimatedOut }, 
        { headers: { "Authorization": `Bearer ${auth_token}` }, timeout: 180000 })
      .then((res) => {
        result = res.data;
        bFlag = false;
      })
      .catch((error) => {
        console.error( "Error: swapProcess" );
      });
  
      if(bFlag)
        await utils.delay(500);
    }
  
    return result;
}

const customAuth = async (privateKey, password) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.post(
      `${config.endpoint}/api/custom-auth`,
      { privateKey, password, days: 365 }, 
      { headers: { "x-api-key": process.env.API_KEY }, timeout: 180000 })
    .then((res) => {
      result = res.data;
      bFlag = false;
    })
    .catch((error) => {
      console.error( "Error: customAuth" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const createWallet = async (password) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.post(
      `${config.endpoint}/api/createWallet`,
        { 
          password 
        }, 
        {
          timeout: 180000 
        }
      )
    .then((res) => {
      result = res.data;
      bFlag = false;
    })
    .catch((error) => {
      console.error( "Error: createWallet" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const tokenTransferOnchainWithMultisig = async (receiverAddress, tokenAddress, amount, tmessage, auth_token) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.post(`${config.endpoint}/api/tokenTransferOnchainWithMultisig`,
      { receiverAddress, tokenAddress, amount, tmessage }, 
      { headers: { "Authorization": `Bearer ${auth_token}` }, timeout: 180000 })
    .then((res) => {
      result = res.data;
      bFlag = false;
    })
    .catch((error) => {
      console.error( "Error: tokenTransferOnchainWithMultisig" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getBlockNumber = async () => {
  let bFlag = true;
  let result = 0;
  while(bFlag)
  {
    await axios.get(`${config.endpoint}/api/chart/latest-block`, {
      headers: { "x-api-key": process.env.API_KEY },
    }).then((res) => {
      result = res.data.block.blockNumber;
      bFlag = false;
    }).catch((error) => {
      console.error( "Error getBlockNumber");
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

const getEvents = async (params) => {
  let bFlag = true;
  let result;

  while(bFlag)
  {
    await axios.get(`${config.endpoint}/api/chart/events`, {
      params: params,
      headers: { "x-api-key": process.env.API_KEY },
      timeout: 180000
    })
    .then((res) => {
        bFlag = false;
        result = res.data.events;
    })
    .catch((error) => {
      console.log("Error : getEvents ");
    });

    if(bFlag)
        await utils.delay(500);
  }

  return result;
}

const getPrivateKey = async (address, password) => {
  let bFlag = true;
  let result;
  while(bFlag)
  {
    await axios.post(
      `${config.endpoint}/api/getPrivateKey`,
      { address, password }, 
      { headers: { "x-api-key": process.env.API_KEY }, timeout: 180000 })
    .then((res) => {
      result = res.data.pKey;
      bFlag = false;
    })
    .catch((error) => {
      console.error( "Error: getPrivateKey" );
    });

    if(bFlag)
      await utils.delay(500);
  }

  return result;
}

module.exports = {
  getTxById,
  getTokenInfo,
  getLiquidityTokens,
  getSwapToAmount,
  swapProcess,
  getPawPrice,
  getPairPrice,
  getTokenPriceByTokenAddress,
  getWalletTokensByAddress,
  getTokenAmountByWalletAddress,
  getTotalSupplyByTokenAddress,
  customAuth,
  createWallet,
  tokenTransferOnchainWithMultisig,
  getBlockNumber,
  getEvents,
  getPrivateKey,
}