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

interface MockAggregatorSnxInterface extends Interface {
  functions: {
    latestAnswer: TypedFunctionDescription<{ encode([]: []): string }>;
  };

  events: {
    AnswerUpdated: TypedEventDescription<{
      encodeTopics([current, roundId, timestamp]: [
        BigNumberish | null,
        BigNumberish | null,
        null
      ]): string[];
    }>;
  };
}

export class MockAggregatorSnx extends Contract {
  connect(signerOrProvider: Signer | Provider | string): MockAggregatorSnx;
  attach(addressOrName: string): MockAggregatorSnx;
  deployed(): Promise<MockAggregatorSnx>;

  on(event: EventFilter | string, listener: Listener): MockAggregatorSnx;
  once(event: EventFilter | string, listener: Listener): MockAggregatorSnx;
  addListener(
    eventName: EventFilter | string,
    listener: Listener
  ): MockAggregatorSnx;
  removeAllListeners(eventName: EventFilter | string): MockAggregatorSnx;
  removeListener(eventName: any, listener: Listener): MockAggregatorSnx;

  interface: MockAggregatorSnxInterface;

  functions: {
    latestAnswer(): Promise<BigNumber>;
  };

  latestAnswer(): Promise<BigNumber>;

  filters: {
    AnswerUpdated(
      current: BigNumberish | null,
      roundId: BigNumberish | null,
      timestamp: null
    ): EventFilter;
  };

  estimate: {
    latestAnswer(): Promise<BigNumber>;
  };
}