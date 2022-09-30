# Useful links
This is a list of links I've used to learn about Immutable X. 
This guide is mostly a TLDR; as well as a repository for me to share my findings and tests during different implementation phases.

- [Immutable X (homepage)](https://www.immutable.com/)
- [Official Documentation](https://docs.x.immutable.com/docs)
	- [Getting Started Guide](https://docs.x.immutable.com/docs/getting-started-guide)
	- [Project Onboarding](https://docs.x.immutable.com/docs/onboarding)
	- [Introduction to minting on Immutable X](https://docs.x.immutable.com/docs/minting-on-immutable-x)
	- [Minting on Immutable X](https://docs.x.immutable.com/docs/asset-minting)
	- [Building a Marketplace](https://docs.x.immutable.com/docs/marketplaces)
	- [FAQ](https://docs.x.immutable.com/docs/developer-faq)
	- [Link SDK](https://docs.x.immutable.com/docs/sdk-api)
- [Official API reference](https://docs.x.immutable.com/reference)
- [Immutable X' Github](https://github.com/immutable)
	- [Integration Example (Skeleton marketplace APP)](https://github.com/immutable/imx-reactjs-integration-example)
	- [Immutable X Onboarding](https://github.com/immutable/imx-examples)
- [Immutable X Contracts (NPM)](https://www.npmjs.com/package/@imtbl/imx-contracts)
- [Immutable X SDK (NPM)](https://www.npmjs.com/package/@imtbl/imx-sdk)
- [Developer Discord](https://discord.gg/XeHEXfNDUB)

# Important URLs and addresses

| | Sandbox (Goerli) | Mainnet |
|-|-|-|
| Client Public API URL | https://api.sandbox.x.immutable.com | https://api.x.immutable.com |
| Link API URL | https://link.sandbox.x.immutable.com | https://link.x.immutable.com |
| Stark Contract Address (mintFor whitelist) | 0x7917eDb51ecD6CdB3F9854c3cc593F33de10c623 | 0x5FDCCA53617f4d2b9134B29090C87D01058e27e9 |
| Registration Contract Address | 0x1C97Ada273C9A52253f463042f29117090Cd7D83 | 0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c |


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

To find out more about Immutable X concepts and go into detail, check out [this part of official documentation](https://docs.x.immutable.com/docs/architecture-overview).


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
- 2 step process
- Time required - up to 24h
- Requires gas. Gas amount varies based on the action (release from contract or mint to address). Takes up to 24h. 

[More info on withdrawing](https://docs.x.immutable.com/docs/asset-withdrawals)



# Smart Contract Basics
**Immutable X supports ERC721 and ERC20 standards only**. [No ERC1155 support.](https://docs.x.immutable.com/docs/developer-faq#smart-contracts).

**[Immutable X doesn't support general computation on L2.](https://docs.x.immutable.com/docs/developer-faq#general)** 
You cannot just "port your logic" or "build a smart contract" on Immutable X.


## Migrating from L1 to L2

### I want to make my L1-minted assets "depositable" to L2 
All you have to do is register your contract with IMX and provide relevant information. You will not be able to mint items on L2 without the below step.

### I want to adapt my L1-deployed contract to allow L2 minting
Your contract needs to implement Mintable interface (`IMintable`), which can be done via a proxy contract and has to be registered on L2.
You also need to have a contract owner method, this is basically the standard and an example implementation is [OpenZeppelin's Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol).

### I have an L1 contract which is not yet deployed, how do I adapt it to allow L2 minting
Same as the question above, you need to implement `IMintable` and `owner()`. Register your contract on L2.
Also, depending on the complexity of your project and whether you want to allow native L1 minting, you'll probably want to remove the (public payable) mint function usually used for on-site minting.

## Registration Requirements

### IMintable (Mintable Interface)
In order for you contract to be "mintable" it needs to implement the Mintable interface.
Luckily, IMintable only defines a single function with the following signature

    function  mintFor(address  to,  uint256  quantity,  bytes  mintingBlob);
Where 
- **to** - receivers address
- **quantity** - amount of tokens to be mint, must be 1 for ERC721
- **mintingBlob** - immutable on-chain metadata defined on mint time, sent trustlessly, format: `{tokenId}:{blueprint}`

This function **gets called upon successful (first) withdrawal of an L2-minted asset.** 
Assets minted on L2 do not exist in their _full_ form. 
Your L2 minted ERC721/ERC20 token will not be visible as such on L1 until its first withdrawal, it will - however - have its [L1 representation, immutability and cryptographic security](https://docs.x.immutable.com/docs/developer-faq#nfts) from the moment you mint it.

You may think of this function as a **wrapper around ERC721's _safeMint()**, with the added benefit of being able to store on-chain metadata through blueprints.

### Ownable
In order for IMX to verify the contract's owner which is used to allow access to the `IMintable` implementation, your contract needs to have an owner.
An example implementation is [OpenZeppelin's Ownable](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol).

What's really required is
    owner()

Which returns an address of the owner. If you don't want to use OpenZeppelin's Ownable, you may implement this yourself.
Address returned from that method is the one you must be able to sign minting requests with.

### Metadata
Immutable X recognizes two (2) types of metadata: **mutable** and **immutable**.

#### Blueprints - Immutable (on-chain) metadata

Immutable metadata is the type of an asset description should **never change** and is stored on-chain. 
Once an item is minted on L2 its immutable metadata **cannot be modified in any way while on L2.** 
Immutable metadata is defined as a blueprint (string) on mint time (when called through the SDK/API). 
It gets passed to the `mintFor` method (as the third argument) **trustlessly**, formatted as `{tokenId}:{metadata}`. 
**Your mintFor logic is responsible for parsing of the blueprint.**
_Blueprints are optional_ and should be used responsibly since on-chain L1 storage is expensive.

#### Mutable metadata (off-chain) - JSON

Mutable metadata is the type of an asset description that's stored off-chain and formatted as a JSON.
In order for it to work with IMX, it should be accessible through HTTP.
You can serve mutable metadata through a centralized API, Arweave or IPSF (using an HTTP gateway).
Think of this as a common tokenURI() implementation in ERC721, which gets called on L2 to describe the minted token.

**Endpoint URI format is `https(s)://base_uri/tokenId`.**
_tokenId does not have to be a root-level route parameter!_

**Example #1** - `https://example.com/123`
- https://example.com is the `base_uri`
- 123 is the `tokenId`

**Example #2** - `https://example.com/bunny/ducks/123`
- https://example.com/bunny/ducks is the `base_uri`
- 123 is still the `tokenId`

**Example #3 (IPFS)**
Using IPFS is allowed, but you need to have an [HTTP gateway](https://docs.ipfs.io/how-to/address-ipfs-on-web/#http-gateways) for IMX to fetch files from (below example is using Cloudflare's IPFS gateway)

`https://cloudflare-ipfs.com/ipfs/QmcCdVZwaxPLqex56e5xJcYtzqyQcpVUveWXq5ynQ2STMF/123`
- https://cloudflare-ipfs.com/ipfs/QmcCdVZwaxPLqex56e5xJcYtzqyQcpVUveWXq5ynQ2STMF is the `base_uri`
- `QmcCdVZwaxPLqex56e5xJcYtzqyQcpVUveWXq5ynQ2STMF` is your IPFS hash/cid
- 123 is still the `tokenId`
  

ALL contracts must first be registered with IMX before you're able to deposit or mint assets based on them - check out the [Project Onboarding docs](https://docs.x.immutable.com/docs/onboarding).

# Metadata

## Mutable metadata formatting / JSON schema

**In order for an attribute to be indexed for filtering purposes, Immutable X requires it to be a top-level key:primitive_value pair. This means no objects/arrays.**

**Example #1 (ERC721 OpenSea)**

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
	    
In the above example **attributes array will not be indexable, filterable or shown on the Immutable X Marketplace**.
However, **IMX's crawler does pull in the information and makes it available as a part of metadata** for 3rd party marketplaces and other users to take advantage of, so `attributes` property will be available in the IMX API. This means marketplaces can display more advanced structures other than the top level primitives if they choose to.
**IMX will be able to index (for filtering/search purposes) Creature #1's name, image_url, description and hair**, while `attributes` will be stored, but can't be used for querying purposes.

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

The following four (4) types are allowed:
- **text** (default) - arbitrary text, searchable, **cannot be filterable**
- **enum** - property with a set of possible (end) values (think a list of values which can be the *only* thing matching this key, eg. sex: [male, female, other]). *The list of potential options will be automatically populated by the Immutable X crawler and is not to be provided in the JSON mapping*
- **boolean** - true/false (think checkbox/toggle)
- **discrete** - proprety which will be handled as a multi-select (think multiple checkboxes)

**You do not need to add all of your metadata properties in the schema**, all attributes will still be fetched and shown on the marketplace regardless of the schema. 
Its (current) purpose is giving the crawler hints on what properties to pay extra attention to and index them for filtering/query purposes.

The basic JSON schema definition looks like

    {
        "metadata": [
            {
                "name": <NAME OF THE KEY>, // name of the top-level key defined in your schema (Required)
                "type": <ONE OF THE 4 ALLOWED TYPES>, // check the above definition of types. (Optional, defaults to "text")
                "filterable": <boolean(true/false)> // defines whether or not your assets should be filterable by this key. Cannot be used with type "text. (Optional, defaults to false)
            }
        ]
    }

#### **Example #1**

JSON Schema (mapping)

    {
        "metadata": [
            {
                "name": "name"
            },
            {
                "name": "description",
            },
            {
                "name": "image_url",
            },
            {
                "name": "magical",
                "type": "boolean",
                "filterable": true
            },
            {
                "name": "origin",
                "type": "enum",
                "filterable": true
            },
            {
                "name": "age",
                "type": "discrete"
            },
            {
                "name": "power_level",
                "type": "discrete"
            }
        ]
    }


**Metadata for Creature #1 matching the above mapping**

    {
	    "name": "Creature #1",
	    "description": "This is a fiery creature and it's the first one!",
	    "image_url": "https://..../",
	    "magical": true, // boolean - either true or false
	    "origin": "vulcano", // this value  will be added to the enum set by the crawler
        "age": 120, // numeric value to be used as continous
	    "power_level": 98 // value which will be added to the potential range by the crawler
    }

# Changelogs
Chances that I will keep track of an additional changelog when all of this is done through git are **low**.
However, I do want to point out some major mistakes or changes in understanding, as to not spread misinformation and have a way for people who have gone through this document once to see if there were any major changes.

| Commit date (DD/MM) | Change reason |
|--|--|
| 06/05/2022 | Typos, updates, things |
| 21/10/2021 | Another day, another JSON key goes away |
| 20/10/2021 | Another update to the JSON schema, removal of predefined values. Update to the contracts and the mintFor method |
| 15/10/2021 | Updated JSON schema structure according to the [new docs](https://docs.x.immutable.com/docs/asset-metadata) |
|12/10/2021|Better formatting. Additional JSON properties might not be ignored (might cause issues) - have yet to find an official statement and do proper testing.|
| 11/10/2021 | Initial commit |
