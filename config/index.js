module.exports = {
  network: 'rinkeby',
  ropsten: require('./rinkeby'),
  private: require('./private'),
  deploy: {
    gas: 2000000, //gaslimit
    gasPrice: '10000000000', //10 Wei
  },
};
