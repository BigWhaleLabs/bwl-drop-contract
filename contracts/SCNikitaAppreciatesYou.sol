// contracts/MyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.14;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract SCNikitaAppreciatesYou is ERC721, Ownable {
  using Counters for Counters.Counter;
  using SafeMath for uint256;

  uint256 public constant MAX_SUPPLY = 10826;
  Counters.Counter private _tokenIds;
  string public baseTokenURI;

  constructor(string memory _tokenURI)
    ERC721("SCNikitaAppreciatesYou", "SCNAY")
  {
    setBaseURI(_tokenURI);
  }

  function mint(address[] calldata _addresses) external onlyOwner {
    uint256 totalMinted = _tokenIds.current();
    require(totalMinted.add(1) <= MAX_SUPPLY, "All NFTs are minted");

    for (uint256 i = 0; i < _addresses.length; ++i) {
      uint256 nextTokenID = _tokenIds.current();
      _safeMint(_addresses[i], nextTokenID);
      _tokenIds.increment();
    }
  }

  function tokenURI(uint256 _tokenId)
    public
    view
    virtual
    override
    returns (string memory)
  {
    require(
      _exists(_tokenId),
      "ERC721Metadata: URI query for nonexistent token"
    );

    string memory _tokenURI = _baseURI();
    return _tokenURI;
  }

  function setBaseURI(string memory _tokenURI) public onlyOwner {
    baseTokenURI = _tokenURI;
  }

  function _baseURI() internal view virtual override returns (string memory) {
    return baseTokenURI;
  }
}
