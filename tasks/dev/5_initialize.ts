import {task} from '@nomiclabs/buidler/config';
import {
  getLendingPoolAddressesProvider,
  initReserves,
  deployLendingPoolCollateralManager,
  insertContractAddressInDb,
  deployMockFlashLoanReceiver,
  deployWalletBalancerProvider,
  deployAaveProtocolTestHelpers,
  getLendingPool,
  getLendingPoolConfiguratorProxy,
  getAllMockedTokens,
} from '../../helpers/contracts-helpers';
import {getReservesConfigByPool} from '../../helpers/configuration';

import {tEthereumAddress, AavePools, eContractid} from '../../helpers/types';
import {waitForTx, filterMapBy} from '../../helpers/misc-utils';
import {enableReservesToBorrow, enableReservesAsCollateral} from '../../helpers/init-helpers';
import {getAllTokenAddresses} from '../../helpers/mock-helpers';
import {ZERO_ADDRESS} from '../../helpers/constants';

task('dev:initialize-lending-pool', 'Initialize lending pool configuration.')
  .addOptionalParam('verify', 'Verify contracts at Etherscan')
  .setAction(async ({verify}, localBRE) => {
    await localBRE.run('set-bre');

    const mockTokens = await getAllMockedTokens();
    const lendingPoolProxy = await getLendingPool();
    const lendingPoolConfiguratorProxy = await getLendingPoolConfiguratorProxy();
    const allTokenAddresses = getAllTokenAddresses(mockTokens);

    const addressesProvider = await getLendingPoolAddressesProvider();

    const protoPoolReservesAddresses = <{[symbol: string]: tEthereumAddress}>(
      filterMapBy(allTokenAddresses, (key: string) => !key.includes('UNI'))
    );

    const testHelpers = await deployAaveProtocolTestHelpers(addressesProvider.address, verify);

    const reservesParams = getReservesConfigByPool(AavePools.proto);

    await initReserves(
      reservesParams,
      protoPoolReservesAddresses,
      addressesProvider,
      lendingPoolProxy,
      testHelpers,
      lendingPoolConfiguratorProxy,
      AavePools.proto,
      ZERO_ADDRESS,
      verify
    );
    await enableReservesToBorrow(
      reservesParams,
      protoPoolReservesAddresses,
      testHelpers,
      lendingPoolConfiguratorProxy
    );
    await enableReservesAsCollateral(
      reservesParams,
      protoPoolReservesAddresses,
      testHelpers,
      lendingPoolConfiguratorProxy
    );

    const collateralManager = await deployLendingPoolCollateralManager(verify);
    await waitForTx(
      await addressesProvider.setLendingPoolCollateralManager(collateralManager.address)
    );

    const mockFlashLoanReceiver = await deployMockFlashLoanReceiver(
      addressesProvider.address,
      verify
    );
    await insertContractAddressInDb(
      eContractid.MockFlashLoanReceiver,
      mockFlashLoanReceiver.address
    );

    await deployWalletBalancerProvider(addressesProvider.address, verify);

    await insertContractAddressInDb(eContractid.AaveProtocolTestHelpers, testHelpers.address);
  });
