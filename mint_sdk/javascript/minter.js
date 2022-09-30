const fetch = require('node-fetch')
const {keccak256} = require('@ethersproject/keccak256')
const {toUtf8Bytes} = require('@ethersproject/strings')

function fixEthSignature(sig){
    let start = sig.slice(0, sig.length - 2)
    let end = sig.slice(sig.length - 2)
    let parsed_end = parseInt(end, 16)
    if(parsed_end > 1) end = `0${(1 - (parsed_end % 2))}`
    return start + end
}

class IMXMinter{
    constructor({signer, apiUrl = 'https://api.sandbox.x.immutable.com'}){
        this.signer = signer
        this.api = apiUrl
    }

    formatPayload(payload, sort = 'initial'){
        delete payload.auth_signature

        let _temp = {}
        for(let [_k, v] of Object.entries(payload)){
            let k = _k.toLowerCase()

            if(k === 'blueprint' || typeof v === 'number'){
                _temp[k] = v
                continue
            }
            
            if(Array.isArray(v)){
                if(!v.length) continue

                _temp[k] = v.map(_v => this.formatPayload(_v, k))
                continue
            }

            if(typeof v === 'object'){
                _temp[k] = this.formatPayload(v)
                continue
            }

            if(k === 'percentage' && typeof v === 'string'){
                _temp[k] = parseFloat(v)
                continue
            }

            _temp[k] = v.toLowerCase()
        }

        if(sort !== 'initial'){
            if(sort === 'royalties') return {recipient: _temp.recipient, percentage: _temp.percentage}
            if(sort === 'tokens') return {id: _temp.id, blueprint: _temp.blueprint, royalties: _temp.royalties}
            return Object.fromEntries(Object.entries(_temp).sort((a, b)=>a[0].localeCompare(b[0])))
        }
        
        return {...Object.fromEntries(Object.entries(_temp).sort((a, b)=>a[0].localeCompare(b[0]))), 'auth_signature': ''}
    }

    async sign(message){
        return fixEthSignature(await this.signer.signMessage(message))
    }

    generateSignature(message){
        return this.sign(message)
    }

    generateMessage(payload){
        return keccak256(toUtf8Bytes(JSON.stringify(payload)))
    }

    generateRequestBody(_payload, signature){
        let _send = {auth_signature: signature}
        for(let [k, v] of Object.entries(_payload)){
            if(k === 'auth_signature') continue
            if(k !== 'users'){
                _send[k] = v
                continue
            }

            _send[k] = v.map(_v => {return {user: _v.ether_key, tokens: _v.tokens}})
        }
        
        return [_send]
    }

    async submitRequestBody(body){
        let res = await fetch(this.api + '/v2/mints', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })

        return await res.json()
    }

    async mint(_payload){
        let payload = this.formatPayload(_payload)
        let message = this.generateMessage(payload)
        let signature = await this.generateSignature(message)
        let body = this.generateRequestBody(payload, signature)
        
        return await this.submitRequestBody(body)
    }
}

module.exports = {
    IMXMinter
}