const db = require('../utils/db')
const { getTokens } = require('./token')

async function login(username, passwd){
    const hashedPass = require('crypto')
        .createHash('sha256')
        .update(passwd)
        .digest('hex')
    
    const users = await db.user.findOne({
        username: username
    })

    let status = 'UNOTF'
    let token;
    let reftoken;

    if (users !== null){
        if (users.passwd === hashedPass){
            const tokens = await getTokens(username)
            token = tokens.token
            reftoken = tokens.reftoken
            
            status = 'SUCC'
        } else { status = "WPWD"}
    }

    return {
        status: status,
        token: token,
        reftoken: reftoken
    }
}

module.exports = { login }