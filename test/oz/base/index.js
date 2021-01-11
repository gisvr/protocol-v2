module.exports = {
  eContractid: {
    Example: 'Example',
    LendingPoolAddressesProvider: 'LendingPoolAddressesProvider',
    MintableERC20: 'MintableERC20',
    MintableDelegationERC20: 'MintableDelegationERC20',
    LendingPoolAddressesProviderRegistry: 'LendingPoolAddressesProviderRegistry',
    LendingPoolParametersProvider: 'LendingPoolParametersProvider',
    LendingPoolConfigurator: 'LendingPoolConfigurator',
    ValidationLogic: 'ValidationLogic',
    ReserveLogic: 'ReserveLogic',
    GenericLogic: 'GenericLogic',
    LendingPool: 'LendingPool',
    PriceOracle: 'PriceOracle',
    Proxy: 'Proxy',
    MockAggregator: 'MockAggregator',
    LendingRateOracle: 'LendingRateOracle',
    AaveOracle: 'AaveOracle',
    DefaultReserveInterestRateStrategy: 'DefaultReserveInterestRateStrategy',
    LendingPoolCollateralManager: 'LendingPoolCollateralManager',
    InitializableAdminUpgradeabilityProxy: 'InitializableAdminUpgradeabilityProxy',
    MockFlashLoanReceiver: 'MockFlashLoanReceiver',
    WalletBalanceProvider: 'WalletBalanceProvider',
    AToken: 'AToken',
    MockAToken: 'MockAToken',
    DelegationAwareAToken: 'DelegationAwareAToken',
    MockStableDebtToken: 'MockStableDebtToken',
    MockVariableDebtToken: 'MockVariableDebtToken',
    AaveProtocolDataProvider: 'AaveProtocolDataProvider',
    IERC20Detailed: 'IERC20Detailed',
    StableDebtToken: 'StableDebtToken',
    VariableDebtToken: 'VariableDebtToken',
    FeeProvider: 'FeeProvider',
    TokenDistributor: 'TokenDistributor',
    StableAndVariableTokensHelper: 'StableAndVariableTokensHelper',
    ATokensAndRatesHelper: 'ATokensAndRatesHelper',
    UiPoolDataProvider: 'UiPoolDataProvider',
    WETHGateway: 'WETHGateway',
    WETH: 'WETH',
    WETH9Mocked: 'WETH9Mocked',
    SelfdestructTransferMock: 'SelfdestructTransferMock',
    LendingPoolImpl: 'LendingPoolImpl',
    LendingPoolConfiguratorImpl: 'LendingPoolConfiguratorImpl',
    LendingPoolCollateralManagerImpl: 'LendingPoolCollateralManagerImpl',
  },
  TokenContractId: {
    DAI: 'DAI',
    AAVE: 'AAVE',
    TUSD: 'TUSD',
    WBTC: 'WBTC',
  },
  TokenContractId_ALL: {
    DAI: 'DAI',
    AAVE: 'AAVE',
    TUSD: 'TUSD',
    BAT: 'BAT',
    WETH: 'WETH',
    USDC: 'USDC',
    USDT: 'USDT',
    SUSD: 'SUSD',
    ZRX: 'ZRX',
    MKR: 'MKR',
    WBTC: 'WBTC',
    LINK: 'LINK',
    KNC: 'KNC',
    MANA: 'MANA',
    REN: 'REN',
    SNX: 'SNX',
    BUSD: 'BUSD',
    USD: 'USD',
    YFI: 'YFI',
    UNI: 'UNI',
    ENJ: 'ENJ',
  },
};

// // marketRates: iMultiPoolsAssets<IMarketRates>,
// // assetsAddresses: {[x: string]: tEthereumAddress},
// // lendingRateOracleInstance: LendingRateOracle,
// // admin: tEthereumAddress

// let IReserveParams = {
//     aTokenImpl: eContractid;
//     reserveFactor: string;
// }

// // percentToRay("1%"),//"10000000000000000000000000",  //1%  基本的浮动借利率
// // percentToRay("12%"),//"120000000000000000000000000", //12% 浮动利率1段斜率
// // percentToRay("50%"), //50% 浮动利率2段斜率
// // percentToRay("10%"), //"100000000000000000000000000", //10% 固定利率1段斜率
// // percentToRay("60%") //"600000000000000000000000000"  //60% 固定利率2段斜率
// let IReserveBorrowParams = {
//     optimalUtilizationRate: percentToRay("50%"),
//     baseVariableBorrowRate: percentToRay("1%"),
//     variableRateSlope1: percentToRay("12%"),
//     variableRateSlope2: percentToRay("50%"),
//     stableRateSlope1: percentToRay("10%"),
//     stableRateSlope2: percentToRay("60%"),
//     borrowingEnabled: true,
//     stableBorrowRateEnabled: true,
//     reserveDecimals: "18"
// }

// let IReserveCollateralParams = {
//     baseLTVAsCollateral: "75",
//     liquidationThreshold: "85",
//     liquidationBonus: "105"
// }
