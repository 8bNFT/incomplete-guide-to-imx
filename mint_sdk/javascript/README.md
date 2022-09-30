# ImmutableX mintv2 Javascript implementation

## Requirements

Run

    npm install

This will install all the required dependencies.

`ethers` is not a requirement for `minter.js` but is being used as an example signer in `minter_test.js` for convenience.

`minter_test.js` can be used to test the minter.

## Constructor arguments

- `signer` - eth signer
- `apiUrl` (*optional*) - `https://api.sandbox.x.immutable.com` for **testnet**, `https://api.x.immutable.com` for **mainnet** (default: *testnet*)

## Methods

Check `minter.js`, specifically the `mint` method. 

Every step of the process has been extracted into a separate method so they can be called independently and/or extracted for use with another module.

## Example payload

This is an example payload for `minter.mint`

```json
{
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
}
```