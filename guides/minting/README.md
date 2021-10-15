## THIS GUIDE ASSUMES YOU HAVE A REGISTERED CONTRACT ON IMX

# Minting guide - WIP

This serves as a basic example of minting on IMX using Node.js. 

This example is not final and I'd expect many more iterations to be done - in the near future! (Including utility scripts for a more user-friendly experience of batch minting on IMX) 

## Why Node.js and not React?
I don't know if anyone's going to actually ask this question, but I still want to explain what's going on.

There's an example integration available on [Immutable's GitHub](https://github.com/immutable/imx-integration-example).
It is, as explained by Immutable, a skeleton APP that serves as a Proof-of-Concept for all the functionality IMX-SDK has to offer.

This is a great example, **but for marketplaces, not minting drops**.

The thing is, you'll probably end up using a lot of that example in your day-to-day adventure of building on IMX.
Creating custom marketplaces or trading corners for your NFT, etc.

With how IMX's protocol changes the way we approach minting, I figured it's better to provide a more realistic and "separated" example (*derived from their documentation*) which you are much more likely to use when trying to immitate L1 minting experiences (or when trying *not to lose your wallet's funds*).

**Every single mint request has to be signed by the contract's owner private key!**
This means the above (frontend) implementation of the minting function **is not realistic** and that has been stated in the comment (just above the function's call!), which I'm sure many people have glanced over - especially when their mind is still focused on L1 "mint direct from website" implementation.

## Minting on IMX will be done on your backend!

# Step by step
## 1 - Download
First things first, download or clone this repository to your PC.

## 2- Installing necessary dependencies
In order to be able to run this script you need to have [Node.js installed](https://nodejs.org/en/download/). I will not be going over that.
### NPM dependencies
You have to download dependencies this example relies on - IMX-SDK and dotenv.

Go to the folder you just downloaded (or cloned) and run the following command (using Terminal or Command Prompt)

    npm install
That's it. The scary part is basically over. Watch as the Matrix unfold and scripts get downloaded straight to the folder you are in.

## 3 - Preparing the .env
In order for the script to execute successfully, you have to modify the .env file present in the folder.

- **MINTER_PRIVATE_KEY** - Private key of the wallet that deployed the contract whose tokens you're trying to mint. [MetaMask tutorial](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key)
-  **ALCHEMY_API_KEY** - modifying this is value is optional, but recommended. [Alchemy Sign-up](https://auth.alchemyapi.io/signup)
-  **TOKEN_CONTRACT_ADDRESS** - address of the L1 deployed contract on Ropsten (the one you registered on IMX)
- **TOKEN_RECEIVER_ADDRESS** - wallet you want to mint the token to - needs to be registered on IMX!
- **ROYALTY_RECEIVER_ADDRESS** - default royalty recipient in mintv2

If you failed to replace any of these, the script will error out and point out the error.

## 4 - Editing the script
I *think* I have provided enough comments inside the example for you to be able to edit it yourself.

The only values you **need** to change inside the code (in order for this to work) are the tokenId and its blueprint.

## 5 - Running the script
After you've edited the tokenId and blueprint in the files `index.mjs` and `index.v2.mjs` respectively, you're ready to run the script and mint away!

### mintv1
Mint(v1) is a function that is going to be replaced by mintv2 in the near future. 
It's focus is **minting multiple types of tokens to a single user** and doesn't allow for royalties to be added.

In order to run the mint(v1) script, open up your trusty terminal/command prompt and run the following

    npm run mintv1
Yup. That should be it. Now whether it worked or not is a story for another day.
If there were any errors, they will be descriptive and shown in the terminal.

### mintv2

Mintv2 is a replacement for mintv1 that's supposed to be taking its place in the near future. It focuses on minting **a single token type to multiple users**. I do find this approach to make much more sense, considering this scenario is much more likely (think - literally every NFT drop ever). Mintv2 also adds the ability to add protocol-level royalties and even define them on **token by token** basis.

#### Minting with royalties is currently not LIVE. It is only available for testing on testnet (Ropsten)
However, projects minted **will be able to additionally add royalties** to their assets. Process is TBA (to be announced).

If you want to run the mintv2 script, just enter the following in your terminal/command prompt

    npm run mintv2
Et voila, you're done. I hope it worked. Trust me, you will notice the difference.

### If everything worked, you should now see a new token in your Immutable X inventory

## Improvement goals
This is a bare minimum example, but it could easily be turned into a batch mint script, so that's the plan (*I guess*).

Also, the script **doesn't query** the transaction_id or the token_id, so you're left with a pretty *naked* result in your console. It's not life changing, but I'm sure it would be nicer if you had some pretty JSON in your console describing your beautiful (newly-minted!) assets.

**This is the initial commit. Errors are a real possibility. If you run into any, feel free to share in IMX's Discord (#developers!)**