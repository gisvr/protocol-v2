/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from "ethers";
import { Listener, Provider } from "ethers/providers";
import { Arrayish, BigNumber, BigNumberish, Interface } from "ethers/utils";
import {
  TransactionOverrides,
  TypedEventDescription,
  TypedFunctionDescription
} from ".";

interface MockKyberProxyInterface extends Interface {
  functions: {
    tokenToBurn: TypedFunctionDescription<{ encode([]: []): string }>;

    tradeWithHint: TypedFunctionDescription<{
      encode([
        _fromToken,
        _amount,
        _toToken,
        _receiver,
        _maxAmount,
        minConversionRate,
        _referral,
        _filtering
      ]: [
        string,
        BigNumberish,
        string,
        string,
        BigNumberish,
        BigNumberish,
        string,
        Arrayish
      ]): string;
    }>;
  };

  events: {};
}

export class MockKyberProxy extends Contract {
  connect(signerOrProvider: Signer | Provider | string): MockKyberProxy;
  attach(addressOrName: string): MockKyberProxy;
  deployed(): Promise<MockKyberProxy>;

  on(event: EventFilter | string, listener: Listener): MockKyberProxy;
  once(event: EventFilter | string, listener: Listener): MockKyberProxy;
  addListener(
    eventName: EventFilter | string,
    listener: Listener
  ): MockKyberProxy;
  removeAllListeners(eventName: EventFilter | string): MockKyberProxy;
  removeListener(eventName: any, listener: Listener): MockKyberProxy;

  interface: MockKyberProxyInterface;

  functions: {
    tokenToBurn(): Promise<string>;

    tradeWithHint(
      _fromToken: string,
      _amount: BigNumberish,
      _toToken: string,
      _receiver: string,
      _maxAmount: BigNumberish,
      minConversionRate: BigNumberish,
      _referral: string,
      _filtering: Arrayish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;
  };

  tokenToBurn(): Promise<string>;

  tradeWithHint(
    _fromToken: string,
    _amount: BigNumberish,
    _toToken: string,
    _receiver: string,
    _maxAmount: BigNumberish,
    minConversionRate: BigNumberish,
    _referral: string,
    _filtering: Arrayish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  filters: {};

  estimate: {
    tokenToBurn(): Promise<BigNumber>;

    tradeWithHint(
      _fromToken: string,
      _amount: BigNumberish,
      _toToken: string,
      _receiver: string,
      _maxAmount: BigNumberish,
      minConversionRate: BigNumberish,
      _referral: string,
      _filtering: Arrayish
    ): Promise<BigNumber>;
  };
}