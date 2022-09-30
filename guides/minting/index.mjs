// default libraries that make all of this possible
import { ImmutableXClient, MintableERC721TokenType } from '@imtbl/imx-sdk';
import { AlchemyProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';

// parsing .env
import dotenv from 'dotenv'
dotenv.config()

const ENV_CHECK = [
    'MINTER_PRIVATE_KEY',
    'ALCHEMY_API_KEY',
    'TOKEN_CONTRACT_ADDRESS',
    'TOKEN_RECEIVER_ADDRESS',
    'ROYALTY_RECEIVER_ADDRESS'
]

for(let [k, v] of Object.entries(process.env)){
    if(!ENV_CHECK.includes(k)) continue
    if(v.startsWith('<') && v.endsWith('>')){
        console.error(`[ERROR] Replace ${k} value in .env with a valid one!`)
        process.exit(0)
    }
}

// setting up the provider
const provider = new AlchemyProvider('goerli', process.env.ALCHEMY_API_KEY);

// this function blocks until the transaction is either mined or rejected
const waitForTransaction = async (promise) => {
    const txId = await promise;
    console.info('Waiting for transaction', 'TX id', txId);
    const receipt = await provider.waitForTransaction(txId);
    if (receipt.status === 0) {
      throw new Error('Transaction containing user registration rejected');
    }
    console.info('Transaction containing user registration TX mined: ' + receipt.blockNumber);
    return receipt;
};

const main = async()=>{
    // creating a signer from the provided private key
    const signer = new Wallet(process.env.MINTER_PRIVATE_KEY).connect(provider);

    // initializing IMX-SDK client
    const client = await ImmutableXClient.build({ 
        // IMX's API URL
        publicApiUrl: 'https://api.sandbox.x.immutable.com/v1',
        // signer (in this case, whoever owns the contract)
        signer,
        // IMX's Goerli STARK contract address
        starkContractAddress: '0x7917eDb51ecD6CdB3F9854c3cc593F33de10c623',
        // IMX's Goerli Registration contract address
        registrationContractAddress: '0x1C97Ada273C9A52253f463042f29117090Cd7D83'
    });

    // Registering the user (owner of the contract) with IMX
    const registerImxResult = await client.registerImx({
        // address derived from PK
        etherKey: client.address.toLowerCase(),
        starkPublicKey: client.starkPublicKey,
    });

    // If the user is already registered, there's is no transaction to await, hence no tx_hash
    if (registerImxResult.tx_hash === '') {
        console.info('Minter registered, continuing...');
    } else {
        // If the user isn't registered, we have to wait for the block containing the registration TX to be mined
        // This is a one-time process (per address)
        console.info('Waiting for minter registration...');
        await waitForTransaction(Promise.resolve(registerImxResult.tx_hash));
    }

    try{
        // client.mint - (without the v2 prefix) is to be deprecated and replaced by mintv2
        //      - this method does not include royalty information
        const result = await client.mint({
            mints: [
                {
                    // address of the (IMX registered!) user we want to mint this token to
                    // received as the first argument in mintFor() inside your L1 contract
                    etherKey: process.env.TOKEN_RECEIVER_ADDRESS.toLowerCase(),
                    // list of tokens to be minted
                    tokens: [
                        {
                            // token type (ERC721 NFT)
                            type: MintableERC721TokenType.MINTABLE_ERC721,
                            // data describing this token
                            data: {
                                // address of the token's contract
                                tokenAddress: process.env.TOKEN_CONTRACT_ADDRESS.toLowerCase(),
                                // ID of the token (received as a part of the 3rd argument {tokenId}:{blueprint} in mintFor), positive integer string
                                id: '1',
                                // blueprint - can't be left empty, but if you're not going to take advantage
                                // of on-chain metadata, just keep it to a minimum - in this case a single character
                                // gets passed as the 3rd argument formed as {tokenId}:{blueprint (whatever you decide to put in it when calling this function)}
                                blueprint: '0',
                            },
                        }
                    ],
                    // nonce - a random positive integer (in this case a number between 0 - 1000), has to be a string!
                    nonce: '' + Math.floor(Math.random() * 10000),
                    // authSignature - to be left empty **ONLY BECAUSE** IMX's SDK takes care of signing it (signature must be present for EVERY SINGLE MINTing op.)
                    authSignature: '',
                },
            ],
        });

        // logging the result of the minting operation
        /*
            {
                results: [
                    {
                        token_id: 'positiveInt',
                        client_token_id: 'positiveInt',
                        tx_id: int
                    }
                ]
            }
        */
        console.log('Minting success!', result);

    // operation can fail if the request is malformed or the tokenId provided already exists
    } catch(err) {
        console.error('Minting failed. Make sure the asset you\'re trying to mint doesn\'t already exist!')
        console.error('The following error was provided', err)
    }
}

main()