pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";


contract Corban {

    ERC20 public token;

    function Corban(address _token) public {
        token = ERC20(_token);
    }

    function fillReserve() public payable {
    }

    // Constant Methods

    function tokensForEth(uint256 _ethAmount) public view returns(uint256) {
        return _tokensForEth(_ethAmount, 0);
    }

    function ethForTokens(uint256 _tokenAmount) public view returns(uint256) {
        uint256 ethBalance = this.balance;
        uint256 tokenBalance = token.balanceOf(this);
        return ethBalance * _tokenAmount / (tokenBalance + _tokenAmount);
    }

    // Public Methods

    function buyTokens(address _receiver, uint256 _minTokenAmount) public payable {
        uint256 ret = _tokensForEth(msg.value, msg.value);
        require(ret >= _minTokenAmount);
        token.transfer(_receiver, ret);
    }

    function sellTokens(address _seller, uint256 _tokenAmount, uint256 _minEthAmount) public {
        uint256 ethAmount = ethForTokens(_tokenAmount);
        require(ethAmount >= _minEthAmount);
        token.transferFrom(_seller, this, _tokenAmount);
        _seller.transfer(ethAmount);
    }

    function sellTokens(address _seller, uint256 _tokenAmount, uint256 _minEthAmount, address _target, bytes _data) public {
        require(_seller == tx.origin);
        uint256 ethAmount = ethForTokens(_tokenAmount);
        require(ethAmount >= _minEthAmount);
        token.transferFrom(_seller, this, _tokenAmount);
        require(_target.call.value(ethAmount)(_data));
    }

    // Internal Methods

    function _tokensForEth(uint256 _ethAmount, uint256 _balanceFix) internal view returns(uint256) {
        uint256 ethBalance = this.balance - _balanceFix;
        uint256 tokenBalance = token.balanceOf(this);
        return tokenBalance * _ethAmount / (ethBalance + _ethAmount);
    }

}
