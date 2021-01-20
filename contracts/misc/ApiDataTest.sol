// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

pragma experimental ABIEncoderV2;

import {IERC20Detailed} from '../dependencies/openzeppelin/contracts/IERC20Detailed.sol';
import {Address} from '../dependencies/openzeppelin/contracts/Address.sol';
import {IERC20} from '../dependencies/openzeppelin/contracts/IERC20.sol';
import {SafeMath} from '../dependencies/openzeppelin/contracts/SafeMath.sol';

import {WadRayMath} from '../protocol/libraries/math/WadRayMath.sol';

import {ILendingPoolAddressesProvider} from '../interfaces/ILendingPoolAddressesProvider.sol';
import {ILendingPool} from '../interfaces/ILendingPool.sol';
import {SafeERC20} from '../dependencies/openzeppelin/contracts/SafeERC20.sol';
import {ReserveConfiguration} from '../protocol/libraries/configuration/ReserveConfiguration.sol';
import {UserConfiguration} from '../protocol/libraries/configuration/UserConfiguration.sol';

import {DataTypes} from '../protocol/libraries/types/DataTypes.sol';

import {IAToken} from '../interfaces/IAToken.sol';
import {IVariableDebtToken} from '../interfaces/IVariableDebtToken.sol';
import {IStableDebtToken} from '../interfaces/IStableDebtToken.sol';

import {IPriceOracleGetter} from '../interfaces/IPriceOracleGetter.sol';

contract ApiDataTest {
  //   using Address for address payable;
  using Address for address;
  using SafeMath for uint256;
  using WadRayMath for uint256;
  using SafeERC20 for IERC20;
  using ReserveConfiguration for DataTypes.ReserveConfigurationMap;
  using UserConfiguration for DataTypes.UserConfigurationMap;

  address _lendingPoolAddress;
  address _wETHGatewayAddress;
  address _wETHAddress;
  ILendingPool _pool;
  IPriceOracleGetter _oracle;

  constructor(address provider, address wETHGatewayAddress) public {
    _wETHGatewayAddress = wETHGatewayAddress;

    (bool success, bytes memory result) =
      wETHGatewayAddress.call(abi.encodeWithSignature('getWETHAddress()'));

    (_wETHAddress) = abi.decode(result, (address));

    _lendingPoolAddress = ILendingPoolAddressesProvider(provider).getLendingPool();
    _pool = ILendingPool(_lendingPoolAddress);
    _oracle = IPriceOracleGetter(ILendingPoolAddressesProvider(provider).getPriceOracle());
  }

  function getLendingPool() external view returns (address) {
    return _lendingPoolAddress;
  }

  function getLendingPoolConfigurator() external view returns (address) {
    return address(this);
  }

  function getLendingPoolController() external view returns (address) {
    // return ILendingPoolAddressesProvider(provider).getLendingPoolController();
    return address(this);
  }

  function getWETHGateway() external view returns (address) {
    // return ILendingPoolAddressesProvider(provider).getLendingPoolController();
    return _wETHGatewayAddress;
  }

  function getReserveConfigurationData(address reserveAddr)
    external
    view
    returns (
      uint256 ltv,
      uint256 liquidationThreshold,
      uint256 liquidationBonus,
      address interestRateStrategyAddress,
      bool usageAsCollateralEnabled,
      bool borrowingEnabled,
      bool stableBorrowRateEnabled,
      bool isActive,
      bool isFrozen // TODO  FROZEN
    )
  {
    DataTypes.ReserveConfigurationMap memory configuration = _pool.getConfiguration(reserveAddr);
    //LTV_MASK, LIQUIDATION_THRESHOLD_MASK, LIQUIDATION_BONUS_MASK, DECIMALS_MASK, RESERVE_FACTOR_MASK
    (ltv, liquidationThreshold, liquidationBonus, , ) = configuration.getParamsMemory();

    //ACTIVE_MASK,FROZEN_MASK,BORROWING_MASK,STABLE_BORROWING_MASK
    (isActive, isFrozen, borrowingEnabled, stableBorrowRateEnabled) = configuration
      .getFlagsMemory();

    usageAsCollateralEnabled = ltv != 0; // The v2 version does not have this setting

    DataTypes.ReserveData memory reserve = _pool.getReserveData(reserveAddr);
    interestRateStrategyAddress = reserve.interestRateStrategyAddress;
  }

  function getReserveData(address reserveAddr)
    external
    view
    returns (
      uint256 totalLiquidity,
      uint256 availableLiquidity,
      uint256 totalBorrowsStable,
      uint256 totalBorrowsVariable,
      uint256 liquidityRate,
      uint256 variableBorrowRate,
      uint256 stableBorrowRate,
      uint256 averageStableBorrowRate,
      uint256 utilizationRate,
      uint256 liquidityIndex,
      uint256 variableBorrowIndex,
      // address aTokenAddress,
      uint40 lastUpdateTimestamp
    )
  {
    DataTypes.ReserveData memory reserve = _pool.getReserveData(reserveAddr);

    liquidityRate = uint256(reserve.currentLiquidityRate); //the current supply rate. Expressed in ray
    variableBorrowRate = uint256(reserve.currentVariableBorrowRate); //the current variable borrow rate. Expressed in ray
    stableBorrowRate = uint256(reserve.currentStableBorrowRate); //the current stable borrow rate. Expressed in ray

    liquidityIndex = uint256(reserve.liquidityIndex); //the liquidity index. Expressed in ray

    variableBorrowIndex = uint256(reserve.variableBorrowIndex); //  variable borrow index. Expressed in ray

    lastUpdateTimestamp = reserve.lastUpdateTimestamp;
    address aTokenAddress = reserve.aTokenAddress;

    availableLiquidity = IERC20Detailed(reserveAddr).balanceOf(aTokenAddress);

    totalBorrowsVariable = IVariableDebtToken(reserve.variableDebtTokenAddress).scaledTotalSupply();

    // (
    //   vars.principalStableDebt,
    //   vars.currentStableDebt,
    //   vars.avgStableRate,
    //   vars.stableSupplyUpdatedTimestamp
    // )
    (, totalBorrowsStable, averageStableBorrowRate, ) = IStableDebtToken(
      reserve
        .stableDebtTokenAddress
    )
      .getSupplyData();
    uint256 totalBorrows = totalBorrowsVariable.add(totalBorrowsStable);
    totalLiquidity = availableLiquidity.add(totalBorrows);
    utilizationRate = totalBorrows.rayDiv(totalLiquidity);
  }

  function getMarket() public view returns (DataTypes.ReserveData[20] memory list) {
    address[] memory reservesList = _pool.getReservesList();
    for (uint256 i = 0; i < reservesList.length; i++) {
      DataTypes.ReserveData memory reserve = _pool.getReserveData(reservesList[i]);
      list[i] = reserve;
    }
  }

  function getUserAccountData(address user)
    external
    view
    returns (
      uint256 totalLiquidityETH,
      uint256 totalCollateralETH,
      uint256 totalBorrowsETH,
      uint256 totalFeesETH,
      uint256 availableBorrowsETH,
      uint256 currentLiquidationThreshold,
      uint256 ltv,
      uint256 healthFactor
    )
  {
    (
      totalCollateralETH, //   uint256 totalCollateralETH,
      totalBorrowsETH, //   uint256 totalDebtETH,
      availableBorrowsETH, //   uint256 availableBorrowsETH,
      currentLiquidationThreshold, //   uint256 currentLiquidationThreshold,
      ltv, //   uint256 ltv,
      healthFactor //   uint256 healthFactor
    ) = _pool.getUserAccountData(user);

    totalLiquidityETH = getUserTotalLiquidityETH(user);
  }

  function getUserReserveData(address reserveAddr, address user)
    external
    view
    returns (
      uint256 currentATokenBalance,
      uint256 currentBorrowBalance,
      uint256 principalBorrowBalance,
      uint256 variableBorrowRate,
      uint256 stableBorrowRate,
      uint256 liquidityRate,
      // uint256 originationFee,  // TODO originationFee
      uint256 variableBorrowIndex,
      uint256 lastUpdateTimestamp,
      bool usageAsCollateralEnabled
    )
  {
    DataTypes.UserConfigurationMap memory userConf = _pool.getUserConfiguration(user);
    DataTypes.ReserveData memory reserve = _pool.getReserveData(reserveAddr);

    variableBorrowRate = reserve.currentVariableBorrowRate;
    stableBorrowRate = reserve.currentStableBorrowRate;
    liquidityRate = reserve.currentLiquidityRate;

    variableBorrowIndex = reserve.variableBorrowIndex;
    lastUpdateTimestamp = reserve.lastUpdateTimestamp;

    uint256 id = uint256(reserve.id);
    usageAsCollateralEnabled = userConf.isUsingAsCollateral(id);

    currentATokenBalance = IERC20Detailed(reserve.aTokenAddress).balanceOf(user);
    bool isBorrowing = userConf.isBorrowing(id);
    if (isBorrowing) {
      currentBorrowBalance = IVariableDebtToken(reserve.variableDebtTokenAddress).scaledBalanceOf(
        user
      );

      principalBorrowBalance = IStableDebtToken(reserve.stableDebtTokenAddress).principalBalanceOf(
        user
      );
    }
  }

  function getReserves() external view returns (address[] memory) {
    return _pool.getReservesList();
  }

  function getUserTotalLiquidityETH(address user)
    internal
    view
    returns (uint256 totalLiquidityETH)
  {
    DataTypes.UserConfigurationMap memory userConfig = _pool.getUserConfiguration(user);
    address[] memory reserves = _pool.getReservesList();

    if (userConfig.isEmpty()) {
      return 0;
    }
    for (uint256 i = 0; i < reserves.length; i++) {
      if (userConfig.isUsingAsCollateral(i)) {
        // continue;
      }
      address currentReserveAddress = reserves[i];
      DataTypes.ReserveData memory currentReserve = _pool.getReserveData(currentReserveAddress);

      (, uint256 liquidationThreshold, , uint256 decimals, ) =
        currentReserve.configuration.getParamsMemory();

      uint256 tokenUnit = 10**decimals;
      uint256 reserveUnitPrice = IPriceOracleGetter(_oracle).getAssetPrice(currentReserveAddress);

      if (liquidationThreshold != 0) {
        uint256 compoundedLiquidityBalance = IERC20(currentReserve.aTokenAddress).balanceOf(user);

        uint256 liquidityBalanceETH =
          reserveUnitPrice.mul(compoundedLiquidityBalance).div(tokenUnit);

        totalLiquidityETH = totalLiquidityETH.add(liquidityBalanceETH);
      }
    }
  }
}
