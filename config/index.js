module.exports = {
  network: 'geth',
  builder: require('./builder'),
  ganache: require('./ganache'),
  geth: require('./geth'),
  vpsorGanache: require('./vpsorGanache'),
  deploy: {
    gas: 800e4, //gaslimit
    gasPrice: 20e9, //20 Wei
  },
};
