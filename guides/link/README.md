# Link SDK
Just a short doc of some Link methods and examples.

Link is the frontend-oriented part of the IMX-SDK which handles signature generation, user registration, client initialization and provides a much simpler payload format for use in your web apps.

# Installation
Link is a part of the IMX-SDK found [here](https://www.npmjs.com/package/@imtbl/imx-sdk).

You can install it using your favorite package manager.

## Yarn

    yarn add @imtbl/imx-sdk

## NPM

    npm install @imtbl/imx-sdk

# Building the Link client

Before running any link methods, you first have to initialize the client.

The syntax is simple and all other sections in this doc will assume you've already done this.

The only parameter is the Link API URL which is either `https://link.ropsten.x.immutable.com` for **mainnet** or `https://link.ropsten.x.immutable.com` for **testnet**.

## Syntax

```javascript
import { Link } from '@imtbl/imx-sdk';

const link = new Link(<LINK_API_ADDRESS_HERE>)
```

### Connecting to Ropsten (testnet)

```javascript
import { Link } from '@imtbl/imx-sdk';

const link = new Link('https://link.ropsten.x.immutable.com')
```

### Connecting to Mainnet

```javascript
import { Link } from '@imtbl/imx-sdk';

const link = new Link('https://link.x.immutable.com)
```

# Setup / Connecting a wallet

Link has a single `setup` method which is universally used no matter whether the user has already registered with IMX or not.

This method handles any necessary signing, user registration and wallet connection and returns `address` (ETH address of the user) and `starkPublicKey` (user's STARK public key).

## Connecting the wallet

```javascript
const { address, starkPublicKey } = await link.setup({})
```

### TIP

If you want to "simulate" a user session, you may store user's ETH and Stark addresses in `localStorage` or in a `Cookie`. Otherwise, they will be forced to "log in" to the site every time they refresh/visit.

Methods do not explicitely require `setup` to be ran, so if you know your user's information in advance, you may skip to the method you're interested in directly.

# Deposit

## ETH

The below example would result in a popup with the goal of depositing **0.1 ETH** to IMX.

```javascript
import { ETHTokenType } from '@imtbl/imx-sdk'

await link.deposit({
    type: ETHTokenType.ETH,
    amount: '0.1' // value in ether
})
```

## ERC721

The asset you're trying to deposit must be a part of an IMX-registered collection!

```javascript
import { ERC721TokenType } from '@imtbl/imx-sdk'

await link.deposit({
    type: ERC721TokenType.ERC721,
    tokenId: '1', // token's ID, a stringified uint256
    tokenAddress: '0x82...' // ERC721's contract address
})
```
## ERC20

The ERC20 you're trying to deposit must be IMX-registered!

```javascript
import { ERC20TokenType } from '@imtbl/imx-sdk'

await link.deposit({
    type: ERC20TokenType.ERC20,
    tokenAddress: '0x82...', // ERC20's contract address
    symbol: 'GODS', // ERC20's symbol,
    amount: ''
})
```

# Initiate (prepare) a withdrawal

Withdrawals are done in **2 parts**. You must first initiate withdrawal **preparation**, after which (once it's included in an L1 rollup) you are able to **complete** it.

Step 1/2 when it comes to withdrawing assets. We need to prepare a withdrawal and wait for it to be included in a rollup.

## ETH
Below example initiates a withdrawal (preparation) of **0.1 ETH**.

```javascript
import { ETHTokenType } from '@imtbl/imx-sdk'

await link.prepareWithdrawal({
    type: ETHTokenType.ETH,
    amount: '0.1', // value in ether
})
```

## ERC721

```javascript
import { ERC721TokenType } from '@imtbl/imx-sdk'

await link.prepareWithdrawal({
    type: ERC721TokenType.ERC721,
    tokenId: '1', // token's ID, a stringified uint256
    tokenAddress: '0x82...' // ERC721's contract address
})
```

## ERC20

```javascript
import { ERC20TokenType } from '@imtbl/imx-sdk'

await link.prepareWithdrawal({
    type: ERC20TokenType.ERC20,
    tokenAddress: '0x82...', // ERC20's contract address
    symbol: 'GODS', // ERC20's symbol,
    amount: ''
})
```

# Complete a withdrawal

Step 2/2. Wrapping up the withdrawal.

Once your withdrawal is included in a rollup and confirmed on L1, you're free to complete the withdrawal.

This method finalizes **all** prepared withdrawals for the selected asset.

## ETH

```javascript
import { ETHTokenType } from '@imtbl/imx-sdk'

await link.completeWithdrawal({
    type: ETHTokenType.ETH
})
```

## ERC721

Each ERC721 is a *separate* asset.

```javascript
import { ERC721TokenType } from '@imtbl/imx-sdk'

await link.completeWithdrawal({
    type: ERC721TokenType.ERC721,
    tokenId: '1', // token's ID, a stringified uint256
    tokenAddress: '0x82...' // ERC721's contract address
})
```

## ERC20

```javascript
import { ERC20TokenType } from '@imtbl/imx-sdk'

await link.completeWithdrawal({
    type: ERC20TokenType.ERC20,
    tokenAddress: '0x82...', // ERC20's contract address
    symbol: 'GODS', // ERC20's symbol
})
```