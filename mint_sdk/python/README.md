# mintv2 implementation in Python

This is just an example implementation of **minting** part of the SDK using Python 3.

Is this production ready and a really nice looking library? Nah.

But it just serves as an example of how **auth_signature** generation is implemented and what payload format is needed in order for it to work.

## Requirements

You'll need to install some packages using pip (also, you'll obviously need Python 3).

    pip3 install requests pysha3 eth-account

## Payload

This is the correct payload format for **genereateAuthSignature**, **generateMintPayload** and **mint**.

```javascript
{
    "contract_address": "TOKEN_CONTRACT_ADDRESS",
    // Optional global royalties array. These will apply on all tokens minted in this request, unless overriden.
    "royalties": [
        {
            // recipient must be an L2 registered user
            "recipient": "ETH_WALLET_ADDRESS",
            // percentage can be precise up to 2 decimal points (X.YZ)
            // the following represents 5.5%
            "percentage": 5.5
        }
    ],
    // list of users that will receive the "contract_address" token
    "users": [
        // user object
        {
            // user's L2 registered wallet - ETH address
            "ether_key": "",
            // array of tokens to mint to this user
            "tokens": [
                // token object
                {
                    "id": "",
                    // passed as a part of the mintingBlob (3rd argument to mintFor)
                    "blueprint": "",
                    // Optional token-based royalties object
                    // if defined, these royalties will OVERWRITE globally defined royalties (if any)
                    "royalties": [
                        {
                            "recipient": "",
                            "percentage": 0
                        }
                    ]
                }
            ]
        }
    ]
}   

```

## Usage

Following examples **DO NOT RELY** on each other. They are meant to be **separate** methods. (running mint, runs the all the necessary functions to generate the correct payload)

### Generate auth_signature

```python
from imx_minter import Minter

## 2nd argument is optional, it can either be "mainnet" or "testnet" (default: "testnet")
minter = Minter("PRIVATE_KEY_HERE" [, "testnet"/"mainnet"])

## above-defined payload format
## doesn't return the entire payload, but rather just the auth_signature parameter for the provided payload to be submitted manually
auth_signature = minter.generateAuthSignature(payload)
```

### Generate mint payload

```python
from imx_minter import Minter

## 2nd argument is optional, it can either be "mainnet" or "testnet" (default: "testnet")
minter = Minter("PRIVATE_KEY_HERE" [, "testnet"/"mainnet"])

## above-defined payload format
## doesn't send a mint request, but returns the payload that can then be manually submitted
## returned payload includes auth_signature (this method uses generateAuthSignature)
request_payload = minter.generateMintPayload(payload)
```

### Mint an asset

```python
from imx_minter import Minter

## 2nd argument is optional, it can either be "mainnet" or "testnet" (default: "testnet")
minter = Minter("PRIVATE_KEY_HERE" [, "testnet"/"mainnet"])

## above-defined payload format
## runs generateMintPayload and SUBMITs it using a POST request
## returns a JSON parsed object of the IMX response
result = minter.mint(payload)

## Success format:
## {"results": [{"token_id": 'X', "contract_address": "Y", "tx_id": "Z"}, ...]}

## Error format:
## {"code": "X", "message": "Y"}

```

# Example

```python
from imx_minter import Minter

## Will use api.ropsten.x.immutable.com/v2 because of the "testnet" param
minter = Minter("PRIVATE_KEY_HERE", "testnet")

result = minter.mint({
        ## L1 contract address
        'contract_address': '0x....',
        ## Global royalties (4%) sent to 0x04...
        'royalties': [
            {
                'recipient': '0x04...',
                'percentage': 4
            }
        ],
        'users': [
            ## Mint a token with an ID 4 to 0x01... with a blueprint "condition:good"
            {
                'ether_key': '0x01...',
                'tokens': [
                    {
                        'id': '4',
                        'blueprint': 'condition:good',
                        ## Override the above royalties and send royalties (3.5%) to 0x12...
                        'royalties': [
                            {
                                'recipient': '0x12..',
                                'percentage': 3.5
                            }
                        ]
                    }
                ]
            },
            ## Repeat for each user
            ...
        ]
})

## Print the result
print(result)

```