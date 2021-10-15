const hardhat = require('hardhat');
const { ethers } = hardhat;

// A really weird whatever function that should read from REGISTRATION_DETAILS and be less weird
// Just an example I guess (for now)

async function main() {
    const [owner] = await ethers.getSigners();
  
    console.log('Modifying Contract\'s URI with the account: ', owner.address);
    console.log('Account Balance: ', (await owner.getBalance()).toString());
    
    const AssetABI = await ethers.getContractFactory("NFT");
    const Asset = await new ethers.Contract("<ADDRESS OF THE CONTRACT>", AssetABI.interface, owner)

    console.log('Current Contract\'s baseURI', await Asset.baseTokenURI())

    console.log(await Asset.setBaseTokenURI("<NEW URI HERE>", {
        gasLimit: 1000000
    }))

    console.log('New Contract\'s baseURI',await Asset.baseTokenURI())
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
});