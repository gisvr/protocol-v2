// SPDX-License-Identifier: agpl-3.0
pragma solidity 0.6.12;

import {IAaveIncentivesController} from '../../interfaces/IAaveIncentivesController.sol';

/**
 * @title ERC20Mintable
 * @dev ERC20 minting logic
 */
contract IncentivesController is IAaveIncentivesController {
  /**
   */
  function handleAction(
    address user,
    uint256 userBalance,
    uint256 totalSupply
  ) public override {}
}
