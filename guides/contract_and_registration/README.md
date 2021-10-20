# ⚠ Disclaimer - mintFor method signature ⚠
There were some uncertainties when it comes to the mintFor method defined by the IMintable. Official documentation and implementation were different. I have followed official documentation, which has been out of date at the time of writing the initial version of this contract.

**Changes (20/10/2021 - DD/MM/YYYY)**

Correct function signature for mintFor is **(address to, uint256 quantity, bytes calldata mintingBlob)** as opposed to *(address to, uint256 id, bytes calldata blueprint)*.

This change has been implemented after confirming the correct function signature with IMX devs, and all of my resources have been updated as well - which includes documentation, code and tests. 

If you've used the previous version of this contract or have done the implementation based n the (to, id, blueprint) signature, you will experience issues when withdrawing to the L1.

Quantity is always supposed to be 1 when it comes to ERC721. The same method will be used for ERC20s when the official support is released.

### DOCUMENTATION TO BE DONE! WORK IN PROGRESS
To get a better understanding of the contract, read through it. Plenty of comments in there.

**None of the code has been verified or endorsed by members of the IMX team**

**Make sure you test the entire flow on the testnet, before going to the mainnet.** This includes minting, buying, selling, withdrawing and depositing of assets.

# Step 1 - Dependencies 
After downloading, run the following using Terminal/Command Prompt (requires [NodeJS](https://nodejs.org/en/download/)):

	npm i

  This script will install all the necessary dependencies that will let you test, compile and deploy your contract!
  

# Step 2 - .env variables
In order for scripts to work, you will have to change the variables present in the **.env** file.

Replace them with the following:
- **DEPLOYER_PRIVATE_KEY** - Private key of the wallet you want to be the owner and deployer of this contract
- **CONTRACT_NAME** - Name of your token (collection), eg. BoredApeYachtClub
- **CONTRACT_SYMBOL** - Your tokens symbol, eg. BAYC
- **ALCHEMY_API_KEY** (optional) - .env comes with a default Alchemy API key, however [getting your own](https://auth.alchemyapi.io/signup) is recommended in order to avoid performance issues and error
 

# Step 3 - Editing the contract (WIP)

This contract is an opinionated bare-minimum implementation of an IMX-compatible smart contract. It comes with certain design choices which can be modified.

In order to better understand the contract, read through the comments, until further documentation is provided.

### To be done

# Step 4 - Running tests

After editing your contract, you're able to test it against the most basic requirements using:

	npm run test

This runs the following checks on a local hardhat instance:
- Makes sure the mintFor can be called by IMX only
- Makes sure the contract has an owner() method
- Checks for successful parsing of a blueprint
- Runs the parsing against an empty blueprint
- (optional) Checks to make sure that the invalid blueprint can't be parsed
  
The last test is optional based on your design choices. You may want to ignore blueprint parsing altogether in order to save up bytes - or choose a different type of an "invalid" format depending on the amount of arguments expected.
  
# Step 5 - Deploying your contract
This repo comes with a couple of helper scripts, 3 of which are used for deployment of the contract.

After a deployment has been successful, necessary details required by the [IMX Contract Registration Form](https://forms.gle/KKv5KNdBa4o4Bajq5) will be saved in a file called "REGISTRATION_DETAILS.json".

## Local deployment
This scripts does a test run deployment against the local hardhat details. Use this to validate REGISTRATION_DETAILS information.

	npm run deploy:local

## Testnet (Ropsten) deployment

### Testnet (Ropsten) ETH faucet
In order to deploy this contract to a testnet, you account will require some "testnet" ETH in order to pay for gas fees.

Use the [Ropsten Faucet](https://faucet.ropsten.be/) in order to get 0.3 ETH to your testnet wallet's balance. (This is more than enough for testing as gas fees are low).

This script deploys your contract to the testnet used by IMX (Ropsten). Use this when testing your contract because you don't want to be paying deployment costs for every mistake made.

	npm run deploy:testnet


## Mainnet deployment (Real money!)
This script does the same as the above, but uses the mainnet and your wallet's mainnet balance. **This means real money**.
Use this when absolutely sure about what you're doing.

	npm run deploy:mainnet

# Step 6 - Metadata JSON (To be done)

# Step 7 - Contract registration (To be done)

# Replicating L1 minting dapp experience
This has been the burning topic ever since the launch of IMX. I will try to summarize some of the ideas currently circulating.

There is no "right" way of doing this. I will not provide code examples, at least not until I have battle-tested them myself.

The main difference between L1 and L2 minting is the fact that all mint requests for L2 must be passed through a backend, done via the REST API and signed by the owner of the contract.

Another major difference is the fact that **tokenId** must be known before minting it, which means you are in charge of incrementing/randomizing and have to keep track of it yourself.

**These are not "correct" ways of doing this, but are some of the ideas discussed within the community**

## Pure L1
Since L2 allows depositing of already minted L1 assets, the simple integration would be to keep everything on L1 and only register your contract with IMX for deposit purposes.

Pros
- easiest to implement (no changes necessary)
- logic is kept inside the smart contract
- no additional backend required

Cons
- gas-inefficient
- slower/worse UX
- double gas costs (minting + depositing of the assets)

## L1 + L2
Since payments are the "trickiest" thing to implement in a transparent and scalable way (at least in the usual L1 minting dapp manner), one might use L1 as the "payment processor" and mint the assets on L2.

Example integrations
- Raw L1 transactions
  - this would require less gas
  - no ability to refuse/reject a transaction
- L1 smart contract
  - a simple deposit/payable smart contract
  - you could either emit Events or just query tokens incrementally

Pros
- transparency
- less backend-involved than some other implementations
- scalable

Cons
- scalability (backend-wise, you must make sure you're able to listen to all the incoming requests)
- gas costs can still vary greatly for the first minter as compared to the last one

## L2
There are multiple ways of going about it and keeping it all strictly L2 (which includes money transactions).

I will go over a couple of different POVs that can be taken when implmenting this.

**All of these require for users to have funds available on IMX/deposit in advance**

### Sell/Buy orders
This includes preminting and listing all of your orders for sale or creating buy orders by the user.

#### Sell orders
To implement this, you'd create a mass sell order through the IMX-SDK. That's about it.

Pros
- simpler to execute
- no scalability or sync issues
- available for purchase through the IMX marketplace

Cons
- no ability to implement whitelisting
- bots potentially buying out the entire inventory
- no ability to put limits in place
- requires preminting
- lack of "true randomness", unless handled by the backend/filter
- ability to only purchase 1 NFT at once

#### Buy orders
To implement this, you'd fetch available tokenIds from the backend, create a buy order for one of the given IDs and fulfill it using the "trade" endpoint.

Pros
- whitelisting and limits
- ability to filter out mass buy orders (with the aforementioned limits)

Cons
- sync issues (tokenId being sold at the time of purchase - which would result in a "hanging" order)
- UX for cancelling orders might feel weird (remedy - naming them "failed" mints)
- requires preminting
- scalability has to be handled by you (and your server)
- lack of "true randomness", unless handled by the backend/filter
- ability to only purchase 1 NFT at once

### ETH transfers
IMX allows for pure ETH transfers to happen from one party to the other. This means you can implement the L1 + L2 logic purely on IMX.

To do so, instead of making a buy or sell orders, you'd make a transfer from one party (buyer) to the other (yourself). You'd have to verify/poll transfers made to you and mint tokens accordingly. Reversals/rejections of failed mints and payments would have to be handled by you (no gas fees, so you'd just send the money back).

Think of this as the "L1 raw transaction" implementation, but done on IMX.

Pros
- closest to the "true" L1 minting dapp experience
- doesn't require preminting, as you could mint on successful transfers
- no tokenId sync issues, as there would be no minted items in advance
- better UX for the user (ability to purchase multiple NFTs at once)

Cons
- lack of "trustless"-ness, since user would make a transfer, rather than a trade, you could trick them
- scalability issues, which have to be handled by you and your backend
- potential "hanging" transfers if you end up with data (list of transfers) sync issues

### Custom marketplace
One other idea is to recreate the "Mass sell order", but with a custom marketplace UI which would emulate randomness and the "minting" experience.

This idea would be better implemented once off-book orders are standardized/easily available.

## Solving scalability issues
I have mentioned scalability as a downside to many of the above. This issue is not IMX-specific and can only be handled by proper planning of your infrastructure and all the services surrounding it.

Make sure your choice of technologies is appropriate for the scale, which includes the language used to create your web server, database engine, etc. Also, implement a rate limit (queue) system of sorts.

Also your hardware must match the demand, which is most often best done by having "auto scaling". This can either be a service provided by your cloud/hosting company or done with orchestration instruments (such as K8s).

Proper caching is a **must**, which includes memory caching (eg. Redis), database/permanent data storage as well as using a CDN.