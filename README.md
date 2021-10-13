**DISCLAIMER: This information has not been provided or reviewed by any members of the Immutable X team. The guide will be updated with practical examples and code as I test and confirm functionality. This guide is my personal interpretation of Immortal X' official documentation.**

## THIS GUIDE IS (and will always be) A WORK IN PROGRESS

# Useful links
This is a list of links I've used to learn about Immutable X. 
This guide is mostly a TLDR; as well as a repository for me to share my findings and tests during different implementation phases.

- [Immutable X (homepage)](https://www.immutable.com/)
- [Official Documentation](https://docs.x.immutable.com/docs)
	- [Quick Start Guide](https://docs.x.immutable.com/docs/quick-start-guide)
	- [Introduction to minting on Immutable X](https://docs.x.immutable.com/docs/partner-nft-minting-setup)
	- [Minting on Immutable X](https://docs.x.immutable.com/docs/minting-assets-1)
	- [Building a Marketplace](https://docs.x.immutable.com/docs/how-to-build-a-marketplace)
	- [FAQ](https://docs.x.immutable.com/docs/developer-faq)
	- [Link SDK](https://docs.x.immutable.com/docs/link-wallet)
- [Official API reference](https://docs.x.immutable.com/reference)
- [Immutable X' Github](https://github.com/immutable)
	- [Integration Example](https://github.com/immutable/imx-integration-example)
- [Immutable X Contracts (NPM)](https://www.npmjs.com/package/@imtbl/imx-contracts)
- [Immutable X SDK (NPM)](https://www.npmjs.com/package/@imtbl/imx-sdk)

# Table of Contents
To be added as I structure this guide. I am not in the right state of mind to write this rn.

# Basic concepts
## Blockchain concepts

- **Layer-2 (L2)** - off-chain protocols that reports back to **Layer-1 (L1)** where all the off-chain actions are "verified"
- **Rollup** - "hybrid" Layer-2 scheme which moves computation and state storage off-chain, but keeps some (highly compressed) data on-chain 

To find out more about ETH's scaling plans, concepts such as ZK-STARK and rollups, check [Vitalik's Incomplete Guide To Rollups](https://vitalik.ca/general/2021/01/05/rollup.html))

## Immutable X concepts
- **Immutable X** - Layer-2 ZK-Rollup solution aimed towards NFTs. Consists of a scaling engine (ZK-Rollup), Link and APIs. Officially supports ERC20 and ERC721.
- **Immutable X Platform** - core infrastructure which allows token related actions in L2
- **Immutable X Token (IMX)** - ERC-20 utility token of the Immutable X protocol, used to reward users who contribute to the platform
- **Immutable X Marketplace** - one stop shop/exchange venue for gas-free NFT related actions (Platform/API Proof-of-Concept)
- **Immutable X Link** - allows for all desktop Ethereum wallets without a network switch, links the Layer-1 wallet to its Layer-2 counterpart. Can be embedded and used by 3rd party partners inheriting all of security measures implemented by the Immutable X team
- **Immutable X APIs** - REST APIs which wrap the underlying Immutable X Exchange Engine's logic, abstracting smart contract interaction. **This is your main and only way of communicating with Immutable X**
- **Immutable X SDK** - TypeScript implementation of the APIs and Wallet (Link) to allow for quicker integration

To find out more about Immutable X concepts and go into detail, check out [this part of official documentation](https://docs.x.immutable.com/docs/concepts).


# L1<->L2 interaction
## Depositing assets
Depositing assets from L1 to L2 locks them up in an IMX contract that's located in L1 and makes them available in L2.
- Time required -  up to a couple of minutes
- Requires gas

**Once assets are on L2 all (L2) actions are gas-free. Including minting/trading.**

[More info on depositing](https://docs.x.immutable.com/docs/asset-deposits)

## Withdrawing assets
Withdrawing assets from L2 to L1 varies. 
If you asset never existed on L1 (got minted on L2 and has never been withdrawn) it will get minted upon withdrawal and attributed to your address. 
If it's an L1 asset or an **L2 asset that has been withdrawn before** your asset gets released from the L1 Smart Contract and becomes unavailable in L2 (unless deposited back). 
- Time required - up to 24h
- Requires gas. Gas amount varies based on the action (release from contract or mint to address). Takes up to 24h. 

[More info on withdrawing](https://docs.x.immutable.com/docs/asset-withdrawals)



# Smart Contract Basics
**Immutable X supports ERC721 and ERC20 standards only**. [No ERC1155 support.](https://docs.x.immutable.com/docs/developer-faq#smart-contracts)

**[Immutable X doesn't support general computation on L2.](https://docs.x.immutable.com/docs/developer-faq#general)** 
You cannot just "port your logic" or "build a smart contract" on Immutable X.


## Migrating from L1 to L2

### I want to make my L1-minted assets "depositable" to L2 
All you have to do is register your contract with IMX and provide relevant information. You will not be able to mint items on L2 without the below step. (Link to jump to contract registration)

### I want to adapt my L1-deployed contract to allow L2 minting
Your contract needs to implement Mintable interface (**IMintable**), which can be done via a proxy contract and has to be registered on L2.

### I have an L1 contract which is not yet deployed, how do I adapt it to allow L2 minting
Same as the question above, you need to implement **IMintable** and register your contract on L2.
Also, depending on the complexity of your project and whether you want to allow native L1 minting, you'll probably want to remove the (public payable) mint function usually used for on-site minting.

## Registration Requirements

### IMintable (Mintable Interface)
In order for you contract to be "mintable" it needs to implement the Mintable interface.
Luckily, IMintable only defines a single function with the following signature

    function  mintFor(address  to,  uint256  id,  bytes  blueprint);
Where 
- **to** - receivers address
- **id** - token's ID to be minted
- **blueprint** - immutable on-chain metadata defined on mint time, sent trustlessly

This function **gets called upon successful (first) withdrawal from L2 to L1.** 
Assets minted on L2 do not exist in their "full" form. 
Your L2 minted ERC721/ERC20 token will not be visible as such on L1 until its first withdrawal, it will - however - have its [L1 representation, immutability and cryptographic security](https://docs.x.immutable.com/docs/developer-faq#nfts) from the moment you mint it. Example implementation jump link.

You may think of this function as a **wrapper around ERC721's _safeMint()**, with the added benefit of being able to store on-chain metadata through blueprints.

### Metadata
Immutable X recognizes two (2) types of metadata: **mutable** and **immutable**.

#### Blueprints - Immutable (on-chain) metadata

Immutable metadata is the type of an asset description should **never change** and is stored on-chain. 
Once an item is minted on L2 its immutable metadata **cannot be modified in any way while on L2.** 
Immutable metadata is defined as a blueprint (string) on mint time (when called through the SDK/API). 
It gets passed to the **mintFor** method (as the third argument) **trustlessly**, formatted as `{tokenId}:{metadata}`. 
Your mintFor logic is responsible for parsing of the blueprint. 
**Blueprints are optional** and should be used responsibly since on-chain storage is expensive.

#### Mutable metadata (off-chain) - JSON

Mutable metadata is the type of an asset description that's stored off-chain and formatted as a JSON.
In order for it to work with IMX, it should be accessible through HTTP.
You can serve mutable metadata through a centralized API, Arweave or IPSF (using an HTTP gateway).
Think of this as a common tokenURI() implementation in ERC721, which gets called on L2 to describe the minted token.

**Endpoint URI format is \<base_uri\>/\<tokenId\>.**
tokenId does not have to be a root-level route parameter!

Example #1
https://example.com/123
- https://example.com is the \<base_uri\>
- 123 is the \<tokenId\>

Example #2
https://example.com/bunny/ducks/123
- https://example.com/bunny/ducks is the \<base_uri\>
- 123 is still the \<tokenId\>

Example #3
https://gateway.pinata.cloud/ipfs/QmcCdVZwaxPLqex56e5xJcYtzqyQcpVUveWXq5ynQ2STMF/123
- https://gateway.pinata.cloud/ipfs/QmcCdVZwaxPLqex56e5xJcYtzqyQcpVUveWXq5ynQ2STMF is the \<base_uri\>
- 123 is still the \<tokenId\>

#### ALL contracts must first be registered with IMX before you're able to deposit or mint assets based on them (link to registration)

# Metadata

## Mutable metadata formatting / JSON schema

**In order for an attribute to be shown, Immutable X requires it to be a top-level key:primitive_value pair. This means no objects.**

Example #1 (ERC721 OpenSea)

    {
	    "name": "IMX Creature #1",
	    "image_url": "https://.....",
	    "description": "This is an IMX Creature #1",
	    "attributes": [
		    {
			    "trait_type": "background",
			    "value": "green"
		    },
		    {
			    "trait_type": "eyes",
			    "value": "big_blue"
		    }
	    ],
	    "hair": "brown"
    }
	    
In the above example **attributes array will not be indexable or shown**.
~~However, it is safe to assume Immutable X ignores extra properties, so redundancy *might be* the key.~~ (This is yet to be confirmed!)
**IMX will be able to find out Creature #1's name, image_url, description and hair!**

### Available core properties
*There are no required fields inside your metadata*

List of core properites (optional, but *recommended*)
- **name** - display name of an asset
- **description** - description of an asset
- **image_url/image** - URL of an image (used as a video thumbnail as well)
- **animation_url** - URL to a multi-media attachment for the item (HLS highly recommended). Typically used for videos
- **animation_url_mime_type** - supported values are: `application/vnd.apple.mpegurl`,  `video/mp4` and `video/webm` (*required if animation_url is present*)
- **youtube_url** - URL to a YouTube video. Not currently supported by Immutable X. Optional support by 3rd party marketplaces.

### Property types (mapping)
In order to index and allow for filtering of attributes, Immutable X requires a JSON schema to be submitted together with the contract. JSON schema describes the correlation between your metadata properites and their "representable types".

The following five (5) types are allowed:
- **enum** - property with a set of possible (end) values (think a list of values which can be the *only* thing matching this key, eg. sex: [male, female, other])
- **text** - arbitrary text, searchable
- **boolean** - true/false (think checkbox)
- **continuous** - property handled as a range (slider?), height
- **discrete** - proprety which will be handled as a multi-select, mana?

#### Example #1

**JSON Schema (mapping)** - Needed for contract registration!

    [
        {
            "key": "name",
            "type": "text"
        },
        {
            "key": "description",
            "type": "text"
        },
        {
            "key": "image_url",
            "type": "text"
        },
        {
            "key": "magical",
            "type": "boolean"
        },
        {
            "key": "origin",
            "value": [
                "forest",
                "sky",
                "vulcano",
                "ocean"
            ],
            "type": "enum"
        },
        {
            "key": "power_level",
            "type": "discrete",
            "range": {
                "min": 0,
                "max": 100
            }
        }
    ]


**Metadata for Creature #1 matching the above mapping**

    {
	    "name": "Creature #1",
	    "description": "This is a fiery creature and it's the first one!",
	    "image_url": "https://..../",
	    "magical": true, // boolean - either true or false
	    "origin": "vulcano", // has to be one of the four defined (forest, sky, vulcano, ocean)
	    "power_level": 98 // value between 0 and 100
    }

# Changelogs
Chances that I will keep track of an additional changelog when all of this is done through git are **low**.
However, I do want to point out some major mistakes or changes in understanding, as to not spread misinformation and have a way for people who have gone through this document once to see if there were any major changes.

| Commit date (DD/MM) | Change reason |
|--|--|
|12/10/2021|Better formatting. Additional JSON properties might not be ignored (might cause issues) - have yet to find an official statement and do proper testing.|
| 11/10/2021 | Initial commit |
