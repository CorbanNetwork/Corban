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

        await abc.transfer(abcCorban.address, 1000 * 10**6);
        await abcCorban.fillReserve({value: 500 * 10**6});
        await xyz.transfer(xyzCorban.address, 500 * 10**6);
        await xyzCorban.fillReserve({value: 1000 * 10**6});
    })

    it('should have valid prices for token buy', async function() {
        (await abcCorban.tokensForEth.call(10 * 10**6)).should.be.bignumber.equal(19607843);
        (await abcCorban.tokensForEth.call(20 * 10**6)).should.be.bignumber.equal(38461538);
        (await abcCorban.tokensForEth.call(30 * 10**6)).should.be.bignumber.equal(56603773);
        (await abcCorban.tokensForEth.call(40 * 10**6)).should.be.bignumber.equal(74074074);
        (await abcCorban.tokensForEth.call(50 * 10**6)).should.be.bignumber.equal(90909090);
        (await abcCorban.tokensForEth.call(60 * 10**6)).should.be.bignumber.equal(107142857);
        (await abcCorban.tokensForEth.call(70 * 10**6)).should.be.bignumber.equal(122807017);
        (await abcCorban.tokensForEth.call(80 * 10**6)).should.be.bignumber.equal(137931034);
        (await abcCorban.tokensForEth.call(90 * 10**6)).should.be.bignumber.equal(152542372);
        (await abcCorban.tokensForEth.call(100 * 10**6)).should.be.bignumber.equal(166666666);

        (await xyzCorban.tokensForEth.call(10 * 10**6)).should.be.bignumber.equal(4950495);
        (await xyzCorban.tokensForEth.call(20 * 10**6)).should.be.bignumber.equal(9803921);
        (await xyzCorban.tokensForEth.call(30 * 10**6)).should.be.bignumber.equal(14563106);
        (await xyzCorban.tokensForEth.call(40 * 10**6)).should.be.bignumber.equal(19230769);
        (await xyzCorban.tokensForEth.call(50 * 10**6)).should.be.bignumber.equal(23809523);
        (await xyzCorban.tokensForEth.call(60 * 10**6)).should.be.bignumber.equal(28301886);
        (await xyzCorban.tokensForEth.call(70 * 10**6)).should.be.bignumber.equal(32710280);
        (await xyzCorban.tokensForEth.call(80 * 10**6)).should.be.bignumber.equal(37037037);
        (await xyzCorban.tokensForEth.call(90 * 10**6)).should.be.bignumber.equal(41284403);
        (await xyzCorban.tokensForEth.call(100 * 10**6)).should.be.bignumber.equal(45454545);
    })

    it('should be able to buy tokens', async function() {
        await abcCorban.buyTokens(wallet1, 0, {value: 50 * 10**6, from: wallet1});
        (await abc.balanceOf.call(wallet1)).should.be.bignumber.equal(90909090);

        await xyzCorban.buyTokens(wallet1, 0, {value: 50 * 10**6, from: wallet1});
        (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(23809523);
    })

    it('should have valid prices for token sell', async function() {
        (await abcCorban.ethForTokens.call(10 * 10**6)).should.be.bignumber.equal(4950495);
        (await abcCorban.ethForTokens.call(20 * 10**6)).should.be.bignumber.equal(9803921);
        (await abcCorban.ethForTokens.call(30 * 10**6)).should.be.bignumber.equal(14563106);
        (await abcCorban.ethForTokens.call(40 * 10**6)).should.be.bignumber.equal(19230769);
        (await abcCorban.ethForTokens.call(50 * 10**6)).should.be.bignumber.equal(23809523);
        (await abcCorban.ethForTokens.call(60 * 10**6)).should.be.bignumber.equal(28301886);
        (await abcCorban.ethForTokens.call(70 * 10**6)).should.be.bignumber.equal(32710280);
        (await abcCorban.ethForTokens.call(80 * 10**6)).should.be.bignumber.equal(37037037);
        (await abcCorban.ethForTokens.call(90 * 10**6)).should.be.bignumber.equal(41284403);
        (await abcCorban.ethForTokens.call(100 * 10**6)).should.be.bignumber.equal(45454545);

        (await xyzCorban.ethForTokens.call(10 * 10**6)).should.be.bignumber.equal(19607843);
        (await xyzCorban.ethForTokens.call(20 * 10**6)).should.be.bignumber.equal(38461538);
        (await xyzCorban.ethForTokens.call(30 * 10**6)).should.be.bignumber.equal(56603773);
        (await xyzCorban.ethForTokens.call(40 * 10**6)).should.be.bignumber.equal(74074074);
        (await xyzCorban.ethForTokens.call(50 * 10**6)).should.be.bignumber.equal(90909090);
        (await xyzCorban.ethForTokens.call(60 * 10**6)).should.be.bignumber.equal(107142857);
        (await xyzCorban.ethForTokens.call(70 * 10**6)).should.be.bignumber.equal(122807017);
        (await xyzCorban.ethForTokens.call(80 * 10**6)).should.be.bignumber.equal(137931034);
        (await xyzCorban.ethForTokens.call(90 * 10**6)).should.be.bignumber.equal(152542372);
        (await xyzCorban.ethForTokens.call(100 * 10**6 )).should.be.bignumber.equal(166666666);
    })

    it('should be able to sell tokens', async function() {
        await abc.transfer(wallet1, 50 * 10**6);
        await xyz.transfer(wallet2, 50 * 10**6);

        {
            await abc.contract.approve["address,uint256"](abcCorban.address, 50 * 10**6, {from: wallet1});
            const oldBalance = await web3.eth.getBalance(wallet1);
            const txid = await abcCorban.contract.sellTokens["address,uint256,uint256"](wallet1, 50 * 10**6, 0, {from: wallet1});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(23809523);
        }

        {
            await xyz.contract.approve["address,uint256"](xyzCorban.address, 50 * 10**6, {from: wallet2});
            const oldBalance = await web3.eth.getBalance(wallet2);
            const txid = await xyzCorban.contract.sellTokens["address,uint256,uint256"](wallet2, 50 * 10**6, 0, {from: wallet2});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet2)).sub(oldBalance).add(fees).should.be.bignumber.equal(90909090);
        }
    })

    it('should be able to sell tokens with single transaction', async function() {
        await abc.transfer(wallet1, 50 * 10**6);
        await xyz.transfer(wallet2, 50 * 10**6);

        {
            var data = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256)', wallet1, 50 * 10**6, 0).toString('hex');
            const oldBalance = await web3.eth.getBalance(wallet1);
            const txid = await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 50 * 10**6, data, {from: wallet1, gas: 1000000});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(23809523);
        }

        {
            var data = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256)', wallet2, 50 * 10**6, 0).toString('hex');
            const oldBalance = await web3.eth.getBalance(wallet2);
            const txid = await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, 50 * 10**6, data, {from: wallet2, gas: 1000000});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet2)).sub(oldBalance).add(fees).should.be.bignumber.equal(90909090);
        }
    })

    it('should be able to exchange tokens (abc => xyz)', async function() {
        await abc.transfer(wallet1, 40 * 10**6);

        const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet1, 0);
        const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet1, 40 * 10**6, 0, xyzCorban.address, buyData).toString('hex');
        await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 40 * 10**6, sellData, {from: wallet1, gas: 1000000});
        (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(9433962);
    })

    it('should be able to exchange tokens (xyz => abc)', async function() {
        await xyz.transfer(wallet2, 10 * 10**6);

        const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet2, 0);
        const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet2, 10 * 10**6, 0, abcCorban.address, buyData).toString('hex');
        await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, 10 * 10**6, sellData, {from: wallet2, gas: 1000000});
        (await abc.balanceOf.call(wallet2)).should.be.bignumber.equal(37735848);
    })

    it('should not be able to steal tokens', async function() {
        await abc.transfer(wallet1, 40 * 10**6);

        const buyData = '0x' + abi.simpleEncode('buyTokens(address,uint256)', wallet2, 0).toString('hex');
        await abc.contract.approve["address,uint256"](abcCorban.address, 40 * 10**6, {from: wallet1, gas: 1000000});
        let rejectected = false;
        try {
            await abcCorban.contract.sellTokens["address,uint256,uint256,address,bytes"](wallet1, 40 * 10**6, 0, xyzCorban.address, buyData, {from: wallet2, gas: 1000000});
        } catch(e) {
            rejectected = true;
        }
        rejectected.should.be.true;
    })

    it('should be able to buy tokens and sell back', async function() {
        // Buy tokens
        await abcCorban.buyTokens(wallet1, 0, {value: 100 * 10**6, from: wallet1});
        (await abc.balanceOf.call(wallet1)).should.be.bignumber.equal(166666666);

        // Sell tokens
        var data = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256)', wallet1, 166666666, 0).toString('hex');
        const oldBalance = await web3.eth.getBalance(wallet1);
        const txid = await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 166666666, data, {from: wallet1, gas: 1000000});
        const receipt = web3.eth.getTransactionReceipt(txid);
        const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
        web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(99999999);
    })

    it('should be able to exchange tokens and back (abc => xyz => abc)', async function() {
        const abcAmount = 1000000;
        const xyzAmount = 249625;
        const resultAmount = 999996;
        await abc.transfer(wallet1, abcAmount);

        {
            const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet1, 0);
            const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet1, abcAmount, 0, xyzCorban.address, buyData).toString('hex');
            await abc.contract.approve["address,uint256,bytes"](abcCorban.address, abcAmount, sellData, {from: wallet1, gas: 1000000});
            (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(xyzAmount);
        }

        {
            const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet1, 0);
            const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet1, xyzAmount, 0, abcCorban.address, buyData).toString('hex');
            await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, xyzAmount, sellData, {from: wallet1, gas: 1000000});
            (await abc.balanceOf.call(wallet1)).should.be.bignumber.equal(resultAmount);
        }
    })

})
