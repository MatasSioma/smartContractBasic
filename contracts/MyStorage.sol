// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyStorage {
  uint256 myNum;

  function set(uint256 _newNum) public {
    myNum = _newNum;
  }

  function get() public view returns (uint256) {
    return myNum;
  }

}
