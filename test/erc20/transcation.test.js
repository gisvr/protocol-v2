let nodeProvider = require('../../utils/ganache.provider');

const { expect } = require('chai');

let web3, sender, alice, bob;

describe('AAVE V2 txs ', function () {
  it('tx test', async () => {
    let provider = await nodeProvider.getAaveV2('LendingPoolAddressesProvider');
    let lpAddr = await provider.getLendingPool();
    web3 = await nodeProvider.getWeb3();
    let txid = '0x8187f74503265eb6754719d2fb60b10db1205939a4b94f97c83e4641df4355bd';
    let tx = await web3.eth.getTransaction(txid);

    console.log(tx);

    let receipt = await web3.eth.getTransactionReceipt(txid);

    console.log(receipt);
  });
});
