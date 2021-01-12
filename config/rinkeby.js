module.exports = {
  mint: {
    admin: '0x2E9D15d024187477F85Ac7cD7154aD8556EDb8E2',
    interestRateMode: {
      stable: '1',
      variable: '2',
    },
    lpProvideAddr: '0xFe5E95e198C50E34519179A8CE21B3b4bF5A2A16',
    ethUsd: '380',
    tokenList: [
      {
        symbol: 'ETH',
        decimals: 18,
        priceEth: '1',
        address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        isActive: true,
        collateral: {
          //enableReserveAsCollateral(reserveAddr, "75", "80", "105")
          usageAsCollateralEnabled: true, // 是否用作抵押
          baseLTVasCollateral: '75', //资产抵押比率
          liquidationThreshold: '80', //清算的阈值
          liquidationBonus: '105', //清算奖励
        },
        borrow: {
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: '3.9%',
          marketLiquidityRate: '0%',
        },
        strategy: {
          baseVariableBorrowRate: '0%',
          variableRateSlope1: '7%',
          variableRateSlope2: '60%',
          stableRateSlope1: '6%',
          stableRateSlope2: '60%',
        },
      },
      {
        symbol: 'DAI',
        decimals: 18,
        priceEth: '0.0026286339',
        address: '0x58c360e4E1544cf9f6AA7cF75402B3E93620AcdA',
        isActive: true,
        collateral: {
          //enableReserveAsCollateral(reserveAddr, "75", "80", "105")
          usageAsCollateralEnabled: false, // 是否用作抵押
          baseLTVasCollateral: '75', //资产抵押比率
          liquidationThreshold: '80', //清算的阈值
          liquidationBonus: '102', //清算奖励
        },
        borrow: {
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: '3.90%',
          marketLiquidityRate: '0%',
        },
        strategy: {
          baseVariableBorrowRate: '1%',
          variableRateSlope1: '7%',
          variableRateSlope2: '60%',
          stableRateSlope1: '6%',
          stableRateSlope2: '60%',
        },
      },
      {
        symbol: 'BAT',
        decimals: 18,
        address: '0x5B10688D70B2FD453274E9B5E89254BEc99765F8',
        priceEth: '0.0009841900',
        isActive: true,
        collateral: {
          //enableReserveAsCollateral(reserveAddr, "75", "80", "105")
          usageAsCollateralEnabled: true, // 是否用作抵押
          baseLTVasCollateral: '75', //资产抵押比率
          liquidationThreshold: '80', //清算的阈值
          liquidationBonus: '102', //清算奖励
        },
        borrow: {
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: '3%',
          marketLiquidityRate: '0%',
        },
        strategy: {
          baseVariableBorrowRate: '0%',
          variableRateSlope1: '12%',
          variableRateSlope2: '50%',
          stableRateSlope1: '10%',
          stableRateSlope2: '60%',
        },
      },
      {
        symbol: 'LINK',
        decimals: 18,
        address: '0x8e5825f63cD8eEe70bD5D41575BBa70f01DE836c',
      },
      {
        symbol: 'USDT',
        decimals: 6,
        address: '0x6d2A5c65Ee95306BE1453aFbf0462613619aC33e',
      },
      {
        symbol: 'USDC',
        decimals: 6,
        address: '0xe655Df08399589Cd9a16c5AD326697e2C042bB9c',
      },
    ],
  },
};
