// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// OZ's Ownable implementation, implementes owner() and onlyOwner 
import "@openzeppelin/contracts/access/Ownable.sol";

// IMintable interface that defines the mintFor method
import "./IMintable.sol";

// Parsing utilities, used to split the receivied blueprints into [tokenId, metadata]
// Can be ignored if you're not using on-chain metadata, which will save you some bytes
import "./utils/Parsing.sol";

// Implementation of IMX-required methods
// Inheriting from IMintable (mintFor) and Ownable (owner method)
abstract contract IMXMethods is Ownable, IMintable {
    // address of the IMX's L1 contract that needs to be whitelisted
    // 0x4527be8f31e2ebfbef4fcaddb5a17447b27d2aef - Ropsten
    // 0x5FDCCA53617f4d2b9134B29090C87D01058e27e9 - Mainnet
    // gets passed in the constructure on deployment of the contract
    address public imx;

    // Utility event, disable it if you don't want applications to listen to it
    event AssetMinted(address to, uint256 id, bytes blueprint);

    constructor(address _imx) {
        // IMX's contract address passed from the parent
        imx = _imx;
    }

    // implementation of IMintable's mintFor
    // this method gets called upon successful L2-minted asset withdrawal
    function mintFor(
        // address of the receiving user's wallet (must be IMX registered)
        address user,
        // id of the token that's getting mint
        uint256 id,
        // blueprint blob, formatted as {tokenId}:{blueprint}
        // blueprint gets passed on L2 mint-time
        bytes calldata mintingBlob
    ) external override {
        // whitelisting the IMX Smart Contract address
        // this makes sure that you don't accidentally call the function, which could result in clashing token IDs
        require(msg.sender == imx, "Function can only be called by IMX");
        // parsing of the blueprint as implemented by IMX, splits the {tokenId}:{blueprint} into [_bid, blueprint]
        // if you're not using on-chain metadata, comment this line out to save some bytes
        (uint256 _bid, bytes memory blueprint) = Parsing.split(mintingBlob);
        // passing the user, id as well as the parsed blueprint to a parent-implemented _mintFor method
        // parent's implementation should (at the very least) call ERC721's _safeMint(user, id)
        // if you're not storing on-chain metadata, make sure to pass an empty string as the blueprint or change this function's signature
        _mintFor(user, id, blueprint);
        // emiting the AssetMinted event
        // if you don't need this event, comment it out
        emit AssetMinted(user, id, blueprint);
    }

    // defining the signature of a parent-implemented method
    // this gets called inside teh above-defiend mintFor
    function _mintFor(
        address user,
        uint256 id,
        bytes memory blueprint
    ) internal virtual;
}
