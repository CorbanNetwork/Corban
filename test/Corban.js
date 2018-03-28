// @flow
'use strict'

const abi = require('ethereumjs-abi');
const BigNumber = web3.BigNumber;
const expect = require('chai').expect;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();

import ether from './helpers/ether';
import {advanceBlock} from './helpers/advanceToBlock';
import {increaseTimeTo, duration} from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const Token = artifacts.require('TokenImpl.sol');
const Corban = artifacts.require('Corban.sol');

contract('Corban', function ([_, wallet1, wallet2, wallet3, wallet4, wallet5]) {

    let abc;
    let xyz;
    let abcCorban;
    let xyzCorban;

    beforeEach(async function() {
        abc = await Token.new();
        xyz = await Token.new();
        abcCorban = await Corban.new(abc.address);
        xyzCorban = await Corban.new(xyz.address);

        await abc.transfer(abcCorban.address, 1000);
        await abcCorban.fillReserve({value: 500});
        await xyz.transfer(xyzCorban.address, 500);
        await xyzCorban.fillReserve({value: 1000});
    })

    it('should have valid prices for token buy', async function() {
        (await abcCorban.tokensForEth.call(10)).should.be.bignumber.equal(20);
        (await abcCorban.tokensForEth.call(20)).should.be.bignumber.equal(39);
        (await abcCorban.tokensForEth.call(30)).should.be.bignumber.equal(57);
        (await abcCorban.tokensForEth.call(40)).should.be.bignumber.equal(75);
        (await abcCorban.tokensForEth.call(50)).should.be.bignumber.equal(91);
        (await abcCorban.tokensForEth.call(60)).should.be.bignumber.equal(108);
        (await abcCorban.tokensForEth.call(70)).should.be.bignumber.equal(123);
        (await abcCorban.tokensForEth.call(80)).should.be.bignumber.equal(138);
        (await abcCorban.tokensForEth.call(90)).should.be.bignumber.equal(153);
        (await abcCorban.tokensForEth.call(100)).should.be.bignumber.equal(167);

        (await xyzCorban.tokensForEth.call(10)).should.be.bignumber.equal(5);
        (await xyzCorban.tokensForEth.call(20)).should.be.bignumber.equal(10);
        (await xyzCorban.tokensForEth.call(30)).should.be.bignumber.equal(15);
        (await xyzCorban.tokensForEth.call(40)).should.be.bignumber.equal(20);
        (await xyzCorban.tokensForEth.call(50)).should.be.bignumber.equal(24);
        (await xyzCorban.tokensForEth.call(60)).should.be.bignumber.equal(29);
        (await xyzCorban.tokensForEth.call(70)).should.be.bignumber.equal(33);
        (await xyzCorban.tokensForEth.call(80)).should.be.bignumber.equal(38);
        (await xyzCorban.tokensForEth.call(90)).should.be.bignumber.equal(42);
        (await xyzCorban.tokensForEth.call(100)).should.be.bignumber.equal(46);
    })

    it('should be able to buy tokens', async function() {
        await abcCorban.buyTokens(wallet1, 0, {value: 50, from: wallet1});
        (await abc.balanceOf.call(wallet1)).should.be.bignumber.equal(91);

        await xyzCorban.buyTokens(wallet1, 0, {value: 50, from: wallet1});
        (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(24);
    })

    it('should have valid prices for token sell', async function() {
        (await abcCorban.ethForTokens.call(10)).should.be.bignumber.equal(5);
        (await abcCorban.ethForTokens.call(20)).should.be.bignumber.equal(10);
        (await abcCorban.ethForTokens.call(30)).should.be.bignumber.equal(15);
        (await abcCorban.ethForTokens.call(40)).should.be.bignumber.equal(20);
        (await abcCorban.ethForTokens.call(50)).should.be.bignumber.equal(24);
        (await abcCorban.ethForTokens.call(60)).should.be.bignumber.equal(29);
        (await abcCorban.ethForTokens.call(70)).should.be.bignumber.equal(33);
        (await abcCorban.ethForTokens.call(80)).should.be.bignumber.equal(38);
        (await abcCorban.ethForTokens.call(90)).should.be.bignumber.equal(42);
        (await abcCorban.ethForTokens.call(100)).should.be.bignumber.equal(46);

        (await xyzCorban.ethForTokens.call(10)).should.be.bignumber.equal(20);
        (await xyzCorban.ethForTokens.call(20)).should.be.bignumber.equal(39);
        (await xyzCorban.ethForTokens.call(30)).should.be.bignumber.equal(57);
        (await xyzCorban.ethForTokens.call(40)).should.be.bignumber.equal(75);
        (await xyzCorban.ethForTokens.call(50)).should.be.bignumber.equal(91);
        (await xyzCorban.ethForTokens.call(60)).should.be.bignumber.equal(108);
        (await xyzCorban.ethForTokens.call(70)).should.be.bignumber.equal(123);
        (await xyzCorban.ethForTokens.call(80)).should.be.bignumber.equal(138);
        (await xyzCorban.ethForTokens.call(90)).should.be.bignumber.equal(153);
        (await xyzCorban.ethForTokens.call(100)).should.be.bignumber.equal(167);
    })

    it('should be able to sell tokens', async function() {
        await abc.transfer(wallet1, 50);
        await xyz.transfer(wallet2, 50);

        {
            await abc.contract.approve["address,uint256"](abcCorban.address, 50, {from: wallet1});
            const oldBalance = await web3.eth.getBalance(wallet1);
            const txid = await abcCorban.contract.sellTokens["address,uint256,uint256"](wallet1, 50, 0, {from: wallet1});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(24);
        }

        {
            await xyz.contract.approve["address,uint256"](xyzCorban.address, 50, {from: wallet2});
            const oldBalance = await web3.eth.getBalance(wallet2);
            const txid = await xyzCorban.contract.sellTokens["address,uint256,uint256"](wallet2, 50, 0, {from: wallet2});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet2)).sub(oldBalance).add(fees).should.be.bignumber.equal(91);
        }
    })

    it('should be able to sell tokens with single transaction', async function() {
        await abc.transfer(wallet1, 50);
        await xyz.transfer(wallet2, 50);

        {
            var data = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256)', wallet1, 50, 0).toString('hex');
            const oldBalance = await web3.eth.getBalance(wallet1);
            const txid = await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 50, data, {from: wallet1, gas: 1000000});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(24);
        }

        {
            var data = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256)', wallet2, 50, 0).toString('hex');
            const oldBalance = await web3.eth.getBalance(wallet2);
            const txid = await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, 50, data, {from: wallet2, gas: 1000000});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet2)).sub(oldBalance).add(fees).should.be.bignumber.equal(91);
        }
    })

    it('should be able to exchange tokens (abc => xyz)', async function() {
        await abc.transfer(wallet1, 40);

        const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet1, 0);
        const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet1, 40, 0, xyzCorban.address, buyData).toString('hex');
        await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 40, sellData, {from: wallet1, gas: 1000000});
        (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(10);
    })

    it('should be able to exchange tokens (xyz => abc)', async function() {
        await xyz.transfer(wallet2, 10);

        const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet2, 0);
        const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet2, 10, 0, abcCorban.address, buyData).toString('hex');
        await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, 10, sellData, {from: wallet2, gas: 1000000});
        (await abc.balanceOf.call(wallet2)).should.be.bignumber.equal(39);
    })

})
