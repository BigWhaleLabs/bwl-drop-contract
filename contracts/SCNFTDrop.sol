// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SCNFTDrop is ERC1155, Ownable {
  string public name;
  string public symbol;

  mapping(uint256 => string) public tokenURI;

  constructor(string memory _name, string memory _symbol) ERC1155("") {
    name = _name;
    symbol = _symbol;
  }

  function mint(
    address[] calldata _addresses,
    uint256 _tokenId,
    uint256 _amount
  ) external onlyOwner {
    for (uint256 i = 0; i < _addresses.length; ++i) {
      _mint(_addresses[i], _tokenId, _amount, "0x");
    }
  }

  function mintBatch(
    address[] calldata _addresses,
    uint256[] memory _tokenIds,
    uint256[] memory _amounts
  ) external onlyOwner {
    for (uint256 i = 0; i < _addresses.length; ++i) {
      _mintBatch(_addresses[i], _tokenIds, _amounts, "0x");
    }
  }

  function burn(uint256 _id, uint256 _amount) external {
    _burn(msg.sender, _id, _amount);
  }

  function burnBatch(uint256[] memory _ids, uint256[] memory _amounts)
    external
  {
    _burnBatch(msg.sender, _ids, _amounts);
  }

  function burnForMint(
    address _from,
    uint256[] memory _burnIds,
    uint256[] memory _burnAmounts,
    uint256[] memory _mintIds,
    uint256[] memory _mintAmounts
  ) external onlyOwner {
    _burnBatch(_from, _burnIds, _burnAmounts);
    _mintBatch(_from, _mintIds, _mintAmounts, "");
  }

  function setURI(uint256 _id, string memory _uri) external onlyOwner {
    tokenURI[_id] = _uri;
    emit URI(_uri, _id);
  }

  function uri(uint256 _id) public view override returns (string memory) {
    return tokenURI[_id];
  }
}
