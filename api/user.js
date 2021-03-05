const db = require('../utils/db')
const { hashString } = require('../utils/hash')
const { generateToken } = require('./security')

async function createUser(username, email, passwd){
    let status = "SUCC"
    
    const users = await db.user.findOne({
        $or: [
            {username: username},
            {email: email}
        ]
    })

    if (users !== null){
        status = (user.username === username) ? 'UALR': 'EALR'
    }
    
    let token;
    let reftoken;

    if (status === 'SUCC'){
        await db.user.create({
            username: username,
            email: email,
            passwd: hashString(passwd),
            details: {
                bio: ""
            },
            posts: []
        })

        generateToken(username).then(data => {
            token = data.token
            reftoken = data.reftoken
        })
    }

    return {
        status: status,
        token: token,
        reftoken: reftoken
    }
}

module.exports = { createUser }