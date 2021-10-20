# Correct function signature for mintFor is (address to, uint256 quantity, bytes calldata blueprint)
## Examples and tests have been updated in order to reflect this

## DOCUMENTATION TO BE DONE! WORK IN PROGRESS
### To get a better understanding of contract, read through the contract. Plenty of comments in there.

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