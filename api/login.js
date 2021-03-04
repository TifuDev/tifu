const db = require('../utils/db')
const { hashString } = require('../utils/hash')
const { getTokens } = require('./token')

async function login(username, passwd){
    const users = await db.user.findOne({
        username: username,
        passwd: hashString(passwd)
    })

    let status = 'WPWD'
    let token;
    let reftoken;

    if (users !== null){
        const tokens = await getTokens(username)
        token = tokens.token
        reftoken = tokens.reftoken
        
        status = 'SUCC'
    }else{ status = "UNOTF" }

    return {
        status: status,
        token: token,
        reftoken: reftoken
    }
}

module.exports = { login }