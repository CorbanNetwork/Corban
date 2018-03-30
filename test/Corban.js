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
        (await abcCorban.tokensForEth.call(10)).should.be.bignumber.equal(19);
        (await abcCorban.tokensForEth.call(20)).should.be.bignumber.equal(38);
        (await abcCorban.tokensForEth.call(30)).should.be.bignumber.equal(56);
        (await abcCorban.tokensForEth.call(40)).should.be.bignumber.equal(74);
        (await abcCorban.tokensForEth.call(50)).should.be.bignumber.equal(90);
        (await abcCorban.tokensForEth.call(60)).should.be.bignumber.equal(107);
        (await abcCorban.tokensForEth.call(70)).should.be.bignumber.equal(122);
        (await abcCorban.tokensForEth.call(80)).should.be.bignumber.equal(137);
        (await abcCorban.tokensForEth.call(90)).should.be.bignumber.equal(152);
        (await abcCorban.tokensForEth.call(100)).should.be.bignumber.equal(166);

        (await xyzCorban.tokensForEth.call(10)).should.be.bignumber.equal(4);
        (await xyzCorban.tokensForEth.call(20)).should.be.bignumber.equal(9);
        (await xyzCorban.tokensForEth.call(30)).should.be.bignumber.equal(14);
        (await xyzCorban.tokensForEth.call(40)).should.be.bignumber.equal(19);
        (await xyzCorban.tokensForEth.call(50)).should.be.bignumber.equal(23);
        (await xyzCorban.tokensForEth.call(60)).should.be.bignumber.equal(28);
        (await xyzCorban.tokensForEth.call(70)).should.be.bignumber.equal(32);
        (await xyzCorban.tokensForEth.call(80)).should.be.bignumber.equal(37);
        (await xyzCorban.tokensForEth.call(90)).should.be.bignumber.equal(41);
        (await xyzCorban.tokensForEth.call(100)).should.be.bignumber.equal(45);
    })

    it('should be able to buy tokens', async function() {
        await abcCorban.buyTokens(wallet1, 0, {value: 50, from: wallet1});
        (await abc.balanceOf.call(wallet1)).should.be.bignumber.equal(90);

        await xyzCorban.buyTokens(wallet1, 0, {value: 50, from: wallet1});
        (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(23);
    })

    it('should have valid prices for token sell', async function() {
        (await abcCorban.ethForTokens.call(10)).should.be.bignumber.equal(4);
        (await abcCorban.ethForTokens.call(20)).should.be.bignumber.equal(9);
        (await abcCorban.ethForTokens.call(30)).should.be.bignumber.equal(14);
        (await abcCorban.ethForTokens.call(40)).should.be.bignumber.equal(19);
        (await abcCorban.ethForTokens.call(50)).should.be.bignumber.equal(23);
        (await abcCorban.ethForTokens.call(60)).should.be.bignumber.equal(28);
        (await abcCorban.ethForTokens.call(70)).should.be.bignumber.equal(32);
        (await abcCorban.ethForTokens.call(80)).should.be.bignumber.equal(37);
        (await abcCorban.ethForTokens.call(90)).should.be.bignumber.equal(41);
        (await abcCorban.ethForTokens.call(100)).should.be.bignumber.equal(45);

        (await xyzCorban.ethForTokens.call(10)).should.be.bignumber.equal(19);
        (await xyzCorban.ethForTokens.call(20)).should.be.bignumber.equal(38);
        (await xyzCorban.ethForTokens.call(30)).should.be.bignumber.equal(56);
        (await xyzCorban.ethForTokens.call(40)).should.be.bignumber.equal(74);
        (await xyzCorban.ethForTokens.call(50)).should.be.bignumber.equal(90);
        (await xyzCorban.ethForTokens.call(60)).should.be.bignumber.equal(107);
        (await xyzCorban.ethForTokens.call(70)).should.be.bignumber.equal(122);
        (await xyzCorban.ethForTokens.call(80)).should.be.bignumber.equal(137);
        (await xyzCorban.ethForTokens.call(90)).should.be.bignumber.equal(152);
        (await xyzCorban.ethForTokens.call(100)).should.be.bignumber.equal(166);
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
            web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(23);
        }

        {
            await xyz.contract.approve["address,uint256"](xyzCorban.address, 50, {from: wallet2});
            const oldBalance = await web3.eth.getBalance(wallet2);
            const txid = await xyzCorban.contract.sellTokens["address,uint256,uint256"](wallet2, 50, 0, {from: wallet2});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet2)).sub(oldBalance).add(fees).should.be.bignumber.equal(90);
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
            web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(23);
        }

        {
            var data = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256)', wallet2, 50, 0).toString('hex');
            const oldBalance = await web3.eth.getBalance(wallet2);
            const txid = await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, 50, data, {from: wallet2, gas: 1000000});
            const receipt = web3.eth.getTransactionReceipt(txid);
            const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
            web3.toBigNumber(await web3.eth.getBalance(wallet2)).sub(oldBalance).add(fees).should.be.bignumber.equal(90);
        }
    })

    it('should be able to exchange tokens (abc => xyz)', async function() {
        await abc.transfer(wallet1, 40);

        const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet1, 0);
        const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet1, 40, 0, xyzCorban.address, buyData).toString('hex');
        await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 40, sellData, {from: wallet1, gas: 1000000});
        (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(9);
    })

    it('should be able to exchange tokens (xyz => abc)', async function() {
        await xyz.transfer(wallet2, 10);

        const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet2, 0);
        const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet2, 10, 0, abcCorban.address, buyData).toString('hex');
        await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, 10, sellData, {from: wallet2, gas: 1000000});
        (await abc.balanceOf.call(wallet2)).should.be.bignumber.equal(36);
    })

    it('should not be able to steal tokens', async function() {
        await abc.transfer(wallet1, 40);

        const buyData = '0x' + abi.simpleEncode('buyTokens(address,uint256)', wallet2, 0).toString('hex');
        await abc.contract.approve["address,uint256"](abcCorban.address, 40, {from: wallet1, gas: 1000000});
        let rejectected = false;
        try {
            await abcCorban.contract.sellTokens["address,uint256,uint256,address,bytes"](wallet1, 40, 0, xyzCorban.address, buyData, {from: wallet2, gas: 1000000});
        } catch(e) {
            rejectected = true;
        }
        rejectected.should.be.true;
    })

    it('should be able to buy tokens and sell back', async function() {
        // Buy tokens
        await abcCorban.buyTokens(wallet1, 0, {value: 100, from: wallet1});
        (await abc.balanceOf.call(wallet1)).should.be.bignumber.equal(166);

        // Sell tokens
        var data = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256)', wallet1, 166, 0).toString('hex');
        const oldBalance = await web3.eth.getBalance(wallet1);
        const txid = await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 166, data, {from: wallet1, gas: 1000000});
        const receipt = web3.eth.getTransactionReceipt(txid);
        const fees = receipt.gasUsed * 1; //web3.eth.gasPrice;
        web3.toBigNumber(await web3.eth.getBalance(wallet1)).sub(oldBalance).add(fees).should.be.bignumber.equal(99);
    })

    it('should be able to exchange tokens and back (abc => xyz => abc)', async function() {
        await abc.transfer(wallet1, 100);

        {
            const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet1, 0);
            const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet1, 100, 0, xyzCorban.address, buyData).toString('hex');
            await abc.contract.approve["address,uint256,bytes"](abcCorban.address, 100, sellData, {from: wallet1, gas: 1000000});
            (await xyz.balanceOf.call(wallet1)).should.be.bignumber.equal(21);
        }

        {
            const buyData = abi.simpleEncode('buyTokens(address,uint256)', wallet1, 0);
            const sellData = '0x' + abi.simpleEncode('sellTokens(address,uint256,uint256,address,bytes)', wallet1, 21, 0, abcCorban.address, buyData).toString('hex');
            await xyz.contract.approve["address,uint256,bytes"](xyzCorban.address, 21, sellData, {from: wallet1, gas: 1000000});
            (await abc.balanceOf.call(wallet1)).should.be.bignumber.equal(94);
        }
    })

})
