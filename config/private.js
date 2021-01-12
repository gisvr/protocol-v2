const newLocal = 'bignumber.js';
const BigNumber = require(newLocal);

let toRay = (num) => {
  const oneRay = new BigNumber(Math.pow(10, 27));
  return new BigNumber(num).multipliedBy(oneRay).toFixed();
};

const oneEth = new BigNumber(Math.pow(10, 18));
// strategy: {
//     optimalUtilizationRate:toRay(0.65),
//     baseVariableBorrowRate: toRay(0),
//     variableRateSlope1: toRay(0.08),
//     variableRateSlope2: toRay(0.6),
//     stableRateSlope1: toRay(0.6),
//     stableRateSlope2: toRay(1),
// }
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
        symbol: 'DAI',
        decimals: 18,
        priceEth: oneEth,
        address: '',
        isActive: true,
        collateral: {
          //enableReserveAsCollateral(reserveAddr, "75", "80", "105")
          usageAsCollateralEnabled: false, // 是否用作抵押
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
      {
        symbol: 'AAVE',
        decimals: 18,
        address: '',
        priceEth: oneEth.div(10),
        isActive: true,
        collateral: {
          //enableReserveAsCollateral(reserveAddr, "75", "80", "105")
          usageAsCollateralEnabled: false, // 是否用作抵押
          baseLTVs: '8000', //资产抵押比率
          liquidationThresholds: '8250', //清算的阈值
          liquidationBonus: '10500', //清算奖励
        },
        borrow: {
          reserveFactor: '1000',
          stableBorrowRateEnabled: true, // 是否启用固定利率借贷
          borrowingEnabled: true, // 是否启用借贷
          marketBorrowRate: toRay(0.039),
          marketLiquidityRate: toRay(0),
        },
        strategy: [toRay(0.65), toRay(0), toRay(0.08), toRay(0.6), toRay(0.6), toRay(1)],
      },
    ],
  },
};
