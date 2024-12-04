const MyStorage = artifacts.require("MyStorage")

module.exports = function(_deployer) {
  _deployer.deploy(MyStorage);
};
