const { IMXMinter } = require('./minter')
const { Wallet } = require('@ethersproject/wallet')
const { JsonRpcProvider } = require('@ethersproject/providers')

// Initialize Signer
const signer = new Wallet('PRIVATE_KEY').connect(new JsonRpcProvider(''));

(async()=>{
    // Initialize Minter
    let minter = new IMXMinter({signer})

    // Mint token(s)
    let result = await minter.mint({
        "contract_address": "TOKEN_ADDRESS",
        "royalties": [
            {
                "recipient": "GLOBAL_ROYALTY_RECEIVER",
                "percentage": 4 // 4% royalty
            }
        ],
        "users": [
            {
                "ether_key": "TOKEN_RECEIVER",
                "tokens": [
                    {
                        "id": "TOKEN_ID",
                        "blueprint": "TOKEN_BLUEPRINT",
                        "royalties": [
                            {
                                "recipient": "TOKEN_SPECIFIC_ROYALTIY_RECIPIENT",
                                "percentage": 3.5 // 3.5% royalty on this specific token
                            }
                        ]
                    }
                ]
            }
        ]
    })

    console.log(result)
})()