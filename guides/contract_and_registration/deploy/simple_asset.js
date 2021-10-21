const hardhat = require('hardhat');
const { ethers } = hardhat;
const fs = require("fs")
const dotenv = require("dotenv")
dotenv.config()


const regDetails = ()=>{
    try{
        return JSON.parse(fs.readFileSync("./REGISTRATION_DETAILS.json").toString())
    } catch(err) {
        console.error("[ERROR] REGISTRATION_DETAILS file corrupted. New one will be auto-generated.", err)
        return {}
    }
}

/**
 * main deploys a smart contract via a call to the deploySmartContract function. To
 * use this function please ensure your environment file (.env) is configured
 * with the correct values before invoking this script.
 */

async function main() {
    const ENV_CHECK = [
        'DEPLOYER_PRIVATE_KEY',
        'CONTRACT_NAME',
        'CONTRACT_SYMBOL'
    ]
    
    for(let [k, v] of Object.entries(process.env)){
        if(!ENV_CHECK.includes(k)) continue
        if(v.startsWith('<') && v.endsWith('>')){
            console.error(`[ERROR] Replace ${k} value in .env with a valid one!`)
            return process.exit(0)
        }
    }

    const [deployer] = await ethers.getSigners();

    const REG_DETAILS = regDetails()
    REG_DETAILS.network = hardhat.network.name
    REG_DETAILS.owner_public_key = await getPublicKey(deployer)
    REG_DETAILS.owner_address = deployer.address
  
    console.log('Deploying Contracts with the account: ', REG_DETAILS.owner_address);
    console.log('Account Public Key', REG_DETAILS.owner_public_key);
    console.log('Account Balance: ', (await deployer.getBalance()).toString());

    // Use any logic you want to determine these values
    const name = process.env.CONTRACT_NAME;
    REG_DETAILS.name = name;
    const symbol = process.env.CONTRACT_SYMBOL;

    REG_DETAILS.contract_address = await deploySmartContract(name, symbol, hardhat.network.name);

    console.log("[SUCCESS] Smart Contract deployed successfully.")
    fs.writeFileSync("./REGISTRATION_DETAILS.json", JSON.stringify(REG_DETAILS, null, 4))
    console.log("[INFO] Registration details have been stored in REGISTRATION_DETAILS.json")
}

async function getPublicKey(signer){
    const message = 'x'
    const signed = await signer.signMessage(message)
    const digest = ethers.utils.arrayify(ethers.utils.hashMessage(message))
    return await ethers.utils.recoverPublicKey(digest, signed)
}

/**
 * deploySmartContract compiles the solidity smart contract from the
 * contracts folder, and then deploys the contract onto one of the
 * nominated networks.
 * 
 * @param {string} name - Friendly name for the contract
 * @param {string} symbol - Symbol for the contract (e.g. 'GODS')
 * @param {string} network - ropsten or mainnet
 */
async function deploySmartContract(name, symbol, network) {
    // Hard coded to compile and deploy the Asset.sol smart contract.
    const SmartContract = await ethers.getContractFactory('NFT');
    const imxAddress = getIMXAddress(network);
    const smartContract = await SmartContract.deploy(name, symbol, imxAddress);
  
    console.log('Deployed Contract Address:', smartContract.address);
    return smartContract.address;
}

/**
 * Returns the IMX address for either network. DO NOT CHANGE these values.
 * @param {string} network - ropsten or mainnent
 * @returns {string} IMX address
 */
function getIMXAddress(network) {
    switch (network) {
        case 'ropsten':
            return '0x4527be8f31e2ebfbef4fcaddb5a17447b27d2aef';
        case 'mainnet':
            return '0x5FDCCA53617f4d2b9134B29090C87D01058e27e9';
        case 'hardhat':
            // dummy address so the contract doesn't error out
            return '0x4527be8f31e2ebfbef4fcaddb5a17447b27d2aef';
    }
    throw Error('Invalid network selected');
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error("Error deploying the contract", error);
    process.exit(1);
});