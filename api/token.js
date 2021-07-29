const { sign, verify } = require('jsonwebtoken')
const db = require('../utils/db')
require('dotenv').config();

async function generateToken(username){
    const payload = {username: username}
    
    let token;
    let reftoken;
    let status = 'UNOTF'

    if(db.user.findOne({username: username}) !== undefined){
        token = sign(payload, process.env.ACCTOKEN_SECRET, {expiresIn: process.env.ACCTOKEN_LIFE})
        reftoken = sign(payload, process.env.REFTOKEN_SECRET, {expiresIn: process.env.REFTOKEN_LIFE})

        await db.user.updateOne({ username: username }, {
            $set: {reftoken: reftoken}
        })

        status = 'SUCC'
    }

    return {
        status: status,
        token: token,
        reftoken: reftoken
    }
}

async function getTokens(username){
    const query = await db.user.findOne({username: username},  'reftoken')
    
    let status = 'UNOTF'
    let reftoken;
    let token;

    if (query !== null){
        status = 'SUCC'
        reftoken = query.reftoken
        token = sign({ username: username }, process.env.ACCTOKEN_SECRET, { expiresIn: process.env.ACCTOKEN_LIFE })
    }
    
    return {
        status: status,
        token: token,
        reftoken: reftoken
    } 
}
getTokens('hytalo-bassi').then(i => console.log(verify(i.token, process.env.ACCTOKEN_SECRET)))
module.exports = { generateToken, getTokens }