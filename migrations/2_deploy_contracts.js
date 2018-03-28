const Corban = artifacts.require("Corban");

module.exports = function(deployer) {
    deployer.deploy(Corban, 0);
};
