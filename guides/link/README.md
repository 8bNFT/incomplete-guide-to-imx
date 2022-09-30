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

The only parameter is the Link API URL which is either `https://link.sandbox.x.immutable.com` for **mainnet** or `https://link.sandbox.x.immutable.com` for **testnet**.

## Syntax

```javascript
import { Link } from '@imtbl/imx-sdk';

const link = new Link(<LINK_API_ADDRESS_HERE>)
```

### Connecting to Sandbox (Goerli testnet)

```javascript
import { Link } from '@imtbl/imx-sdk';

const link = new Link('https://link.sandbox.x.immutable.com')
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

To find a list of IMX registered ERC20 tokens check out the `/tokens` API endpoint ([testnet](https://api.sandbox.x.immutable.com/v1/tokens), [mainnet](https://api.x.immutable.com/v1/tokens)).

```javascript
import { ERC20TokenType } from '@imtbl/imx-sdk'

await link.deposit({
    type: ERC20TokenType.ERC20,
    tokenAddress: '0x82...', // ERC20's contract address
    symbol: 'GODS', // ERC20's symbol,
    amount: ''
})
```

# Buy Crypto with Fiat (Moonpay)

Immutable offers a Moonpay integration to allow direct fiat -> L2 crypto purchases.

```javascript
await link.fiatToCrypto({})
```

### Test cards and details (testnet-only!)

```
CARD: Visa
NUMBER: 4000056655665556
DATE: any date in the future
CVC: 123
```
```
CARD: Visa
NUMBER: 4000020951595032
DATE: 12/2022
CVC: 123
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

To find a list of IMX registered ERC20 tokens check out the `/tokens` API endpoint ([testnet](https://api.sandbox.x.immutable.com/v1/tokens), [mainnet](https://api.x.immutable.com/v1/tokens)).

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

To find a list of IMX registered ERC20 tokens check out the `/tokens` API endpoint ([testnet](https://api.sandbox.x.immutable.com/v1/tokens), [mainnet](https://api.x.immutable.com/v1/tokens)).

```javascript
import { ERC20TokenType } from '@imtbl/imx-sdk'

await link.completeWithdrawal({
    type: ERC20TokenType.ERC20,
    tokenAddress: '0x82...', // ERC20's contract address
    symbol: 'GODS', // ERC20's symbol
})
```

# Sell (create an order)

## ETH

```javascript
await link.sell({
    tokenId: '1', // token ID of the ERC721 token
    tokenAddress: '0x4c...', // contract (collection) address of the ERC721 token
    amount: '1.23' // ETH amount
})
```

## ERC20

To find a list of IMX registered ERC20 tokens check out the `/tokens` API endpoint ([testnet](https://api.sandbox.x.immutable.com/v1/tokens), [mainnet](https://api.x.immutable.com/v1/tokens)).

### With amount

If all fields have been provided, user will only be prompted to confirm the sell order.

```javascript
await link.sell({
    tokenId: '1', // token ID of the ERC721 token
    tokenAddress: '0x4c...', // contract (collection) address of the ERC721 token
    amount: '1.23', // amount of the selected ERC20 token to sell for
    currencyAddress: '0x32...' // contract address of the ERC20 token
})
```

### Without amount

If no amount has been provided, user will be prompted to input the desired amount before confirming.

```javascript
await link.sell({
    tokenId: '1', // token ID of the ERC721 token
    tokenAddress: '0x4c...', // contract (collection) address of the ERC721 token
    currencyAddress: '0x32...' // contract address of the ERC20 token
})
```

## Any currency

If no amount or currencyAddress have been provided, Link will show inputs for both the currency and the amount.

```javascript
await link.sell({
    tokenId: '1', // token ID of the ERC721 token
    tokenAddress: '0x4c...' // contract (collection) address of the ERC721 token
})
```

# Cancel a sale order

```javascript
await link.cancel({
    orderId: '1', // Order ID that you want to cancel
})
```

# Buy (Fill an order)

```javascript
await link.buy({
    orderIds: ['1', '2', '3'], // array of Order IDs to be filled
})
```

# Transfer an asset

Transfer method accepts an **array** of transfers. Don't forget to wrap your transfers in `[]`!

## ETH

```javascript
import { ETHTokenType } from '@imtbl/imx-sdk'

await link.transfer([
        {
            amount: '1.23', // 1.23 ETH
            type: ETHTokenType.ETH,
            toAddress: '0x82...' // receiver of this asset
        },
        // add more transfer objects if necessary, they don't have to be for the same asset type
    ])
```

## ERC721

```javascript
import { ERC721TokenType } from '@imtbl/imx-sdk'

await link.transfer([
        {
            type: ERC721TokenType.ERC721,
            tokenId: '1', // ID of the ERC721 token you want to transfer
            tokenAddress: '0x4c...', // contract (collection) address of the ERC721 token
            toAddress: '0x82...' // receiver of this asset
        },
        // add more transfer objects if necessary, they don't have to be for the same asset type
    ])
```

## ERC20

To find a list of IMX registered ERC20 tokens check out the `/tokens` API endpoint ([testnet](https://api.sandbox.x.immutable.com/v1/tokens), [mainnet](https://api.x.immutable.com/v1/tokens)).

```javascript
import { ERC20TokenType } from '@imtbl/imx-sdk'

await link.transfer([
        {
            amount: '1.23', // 1.23 GODS
            symbol: 'GODS', // ERC20 Symbol
            type: ERC20TokenType.ERC20,
            tokenAddress: '0x4c...', // contract address of ERC20 token
            toAddress: '0x82...', // receiver of this asset
        },
        // add more transfer objects if necessary, they don't have to be for the same asset type
    ])
```

# Transaction history

Link offers a popup with a summary of all trades done with the currently logged in user involved.

This includes trades, purchases, sales, deposits and withdrawals.

```javascript
await link.history({})
```