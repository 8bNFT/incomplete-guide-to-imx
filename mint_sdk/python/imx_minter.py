## Required packages: eth-account pysha3 requests

from eth_account.messages import encode_defunct
from eth_account import Account
import sha3
import json, copy
import requests

class Minter:
    def __init__(self, private_key, network = "ropsten"):
        self.private_key = private_key
        self.network = network
        self.account = Account.from_key(self.private_key)

    def _formatRoyalties(self, _royalty):
        royalty = {"recipient": _royalty["recipient"].lower()}
        fee = _royalty["percentage"]
        if isinstance(fee, int):
            royalty["percentage"] = fee
        else:
            _fee = float(fee)
            if _fee.is_integer():
                royalty["percentage"] = int(_fee)
            else:
                royalty["percentage"] = _fee
    
        return royalty

    def _parseTokens(self, _token):
        if _token.get("royalties", False):
            _token["royalties"] = list(map(self._formatRoyalties, _token["royalties"]))
        
        return _token

    def _parseUsers(self, user):
        user["ether_key"] = user["ether_key"].lower()
        user["tokens"] = list(map(self._parseTokens, user["tokens"]))
        return user


    def _formatMessage(self, payload):
        signature_payload = {"contract_address": payload["contract_address"].lower()}
        
        if payload.get("royalties", False):
            signature_payload["royalties"] = list(map(self._formatRoyalties, payload["royalties"]))

        signature_payload["users"] = list(map(self._parseUsers, payload["users"]))
        signature_payload["auth_signature"] = ""

        return json.dumps(signature_payload, separators=(',', ':'))

    def _hashMessage(self, message):
        hashed = sha3.keccak_256()
        hashed.update(str.encode(message))
        return "0x" + hashed.hexdigest()

    def _fixSignature(self, signature):
        start = signature[:-2]
        end = signature[len(signature) - 2:]
        parsed_end = int(end, 16)
        if parsed_end > 1:
            end = "0" + str(1 - parsed_end % 2)

        return start + end

    def _renameUsers(self, user):
        user["user"] = user["ether_key"].lower()
        del user["ether_key"]
        user["tokens"] = list(map(self._parseTokens, user["tokens"]))
        return user

    def _fixPayload(self, payload, signature):
        new_payload = {"auth_signature": signature, "contract_address": payload["contract_address"].lower()}

        if payload.get("royalties", False):
            new_payload["royalties"] = list(map(self._formatRoyalties, payload["royalties"]))

        new_payload["users"] = list(map(self._renameUsers, payload["users"]))

        return new_payload

    def generateAuthSignature(self, payload):
        message = self._formatMessage(payload)
        hashed_message = self._hashMessage(message)
        raw_signature = (self.account.sign_message(encode_defunct(text=hashed_message))).signature.hex()
        auth_signature = self._fixSignature(raw_signature)
        return auth_signature
    
    def generateMintPayload(self, payload):
        auth_signature = self.generateAuthSignature(payload)
        return self._fixPayload(payload, auth_signature)
        

    def mint(self, payload):
        parsed_payload = self.generateMintPayload(payload)

        res = requests.post(
            f'https://api{".ropsten" if self.network.lower() == "testnet" else ""}.x.immutable.com/v2/mints',
            headers={"Content-Type": "application/json"},
            json=[parsed_payload]
        )
        
        return res.json()