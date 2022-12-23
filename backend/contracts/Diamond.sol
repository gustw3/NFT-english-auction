// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


contract Diamond is ERC721URIStorage, PullPayment, Ownable {
		using Strings for uint;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint public constant TOTAL_SUPPLY = 1;

    uint256 public constant MINT_PRICE = 0.001 ether;

    constructor() ERC721("Diamond", "D") {}

    mapping (uint256 => address) public tokenToOwner;

    function mint() public payable returns (uint256) {
      require(_tokenIds.current() < TOTAL_SUPPLY);
      require(msg.value == MINT_PRICE);
      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();
      _safeMint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, "https://bafybeicohrkwvyyuhg4ai34n5t763pj65i22wzmepe5mnpldzx7ub7fl4q.ipfs.nftstorage.link/metadatas/1.json");
      return newTokenId;
    }


    function whithdrawPayments() public payable onlyOwner {
        (bool s,) = address(this).call{value: address(this).balance}("");
        require(s);
    }
}
