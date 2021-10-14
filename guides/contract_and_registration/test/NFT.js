const { expect } = require("chai");

describe("NFT Tests", function () {

  it("Should not be able to mint from non IMX address", async function () {
   
    const [owner, _fakeIMX] = await ethers.getSigners();

    const Asset = await ethers.getContractFactory("NFT");

    const name = 'IMX NFT';
    const symbol = 'IMXNFT';
    const mintable = await Asset.deploy(name, symbol, _fakeIMX.address);

    const tokenID = 123;
    const blueprint = '1000';
    const blob = toHex(`{${tokenID}}:{${blueprint}}`);

    await expect(mintable.mintFor(owner.address, tokenID, blob)).to.be.reverted;
  });

  it("Should be owned by the deployer", async function () {
   
    const [owner] = await ethers.getSigners();

    const Asset = await ethers.getContractFactory("NFT");

    const name = 'IMX NFT';
    const symbol = 'IMXNFT';
    const imx = owner.address;
    const mintable = await Asset.deploy(name, symbol, imx);

    expect(await mintable.owner()).to.equal(owner.address);
  });


  it("Should be able to mint successfully with a valid blueprint", async function () {
   
    const [owner] = await ethers.getSigners();

    const Asset = await ethers.getContractFactory("NFT");

    const name = 'IMX NFT';
    const symbol = 'IMXNFT';
    const imx = owner.address;
    const mintable = await Asset.deploy(name, symbol, imx);

    const tokenID = 123;
    const blueprint = '1000';
    const blob = toHex(`{${tokenID}}:{${blueprint}}`);

    await mintable.mintFor(owner.address, tokenID, blob);

    const oo = await mintable.ownerOf(tokenID);

    expect(oo).to.equal(owner.address);

    const bp = await mintable.metadata(tokenID);

    expect(fromHex(bp)).to.equal(blueprint);

  });

  it("Should be able to mint successfully with an empty blueprint", async function () {
   
    const [owner] = await ethers.getSigners();

    const Asset = await ethers.getContractFactory("NFT");

    const name = 'IMX NFT';
    const symbol = 'IMXNFT';
    const imx = owner.address;
    const mintable = await Asset.deploy(name, symbol, imx);

    const tokenID = 123;
    const blueprint = '';
    const blob = toHex(`{${tokenID}}:{${blueprint}}`);

    await mintable.mintFor(owner.address, tokenID, blob);

    const bp = await mintable.metadata(tokenID);

    expect(fromHex(bp)).to.equal(blueprint);

  });

  it("Should not be able to mint successfully with an invalid blueprint", async function () {
   
    const [owner] = await ethers.getSigners();

    const Asset = await ethers.getContractFactory("NFT");

    const name = 'IMX NFT';
    const symbol = 'IMXNFT';
    const imx = owner.address;
    const mintable = await Asset.deploy(name, symbol, imx);

    const blob = toHex(`:`);
    await expect(mintable.mintFor(owner.address, 1, blob)).to.be.reverted;

  });
});

function toHex(str) {
  let result = '';
  for (let i=0; i < str.length; i++) {
    result += str.charCodeAt(i).toString(16);
  }
  return '0x' + result;
}

function fromHex(str1) {
	let hex = str1.toString().substr(2);
	let str = '';
	for (let n = 0; n < hex.length; n += 2) {
		str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	}
	return str;
 }