const { sign, verify } = require('jsonwebtoken');
const { user } = require('./db');
require('dotenv').config()

async function signTokens(payload, type = "access"){
    let token;
    if(type === 'access'){
        token = sign(payload, process.env.ACCTOKEN_SECRET, {expiresIn: process.env.ACCTOKEN_LIFE})
    }else{
        const query = await user.findOne(payload)

        verify(query.reftoken, process.env.REFTOKEN_SECRET, async (err) => {
            if(err) {
                token = sign(payload, process.env.REFTOKEN_SECRET, {expiresIn: process.env.REFTOKEN_LIFE})
                await user.updateOne(payload, {
                    $set: {reftoken: token}
                })
            }else token = query.reftoken;
        })
    }
    return token
}

module.exports = {signTokens}