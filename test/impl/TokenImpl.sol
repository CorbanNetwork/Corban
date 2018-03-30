pragma solidity ^0.4.11;

import "zeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "zeppelin-solidity/contracts/token/ERC827/ERC827Token.sol";


contract TokenImpl is MintableToken, ERC827Token {

    function TokenImpl() public {
        mint(msg.sender, 1000000 * 10**18);
    }

}
