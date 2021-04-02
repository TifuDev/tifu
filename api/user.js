const db = require('../utils/db')
const { hashString } = require('../utils/hash')
const { generateToken } = require('./security')

class UsernameAlreadyUsed extends Error{
    constructor(msg){
        super(msg)
    }
}

class EmailAlreadyUsed extends Error{
    constructor(msg){
        super(msg)
    }
}

async function createUser(username, email, passwd, callback){
    const users = await db.user.findOne({
        $or: [
            {username: username},
            {email: email}
        ]
    })
    
    let token,
    reftoken,
    err;

    try {
        if(users !== null){
            if(users.username === username){
                throw new UsernameAlreadyUsed('Username already used by another account')
            }
            throw new EmailAlreadyUsed('Email already used by another account')
        }

        db.user.create({
            username: username,
            email: email,
            passwd: hashString(passwd),
            details: {
                bio: ""
            },
            posts: []
        })

        await generateToken(username).then(data => {
            token = data.token
            reftoken = data.reftoken
        })
    } catch (e) {
        err = e
    }

    callback(err, {token: token, reftoken: reftoken})
}

module.exports = { createUser }