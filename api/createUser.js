const db = require('../utils/db')
const { generateToken } = require('./token')

async function createUser(username, email, passwd){
    const hashedPass = require('crypto')
        .createHash('sha256')
        .update(passwd)
        .digest('hex')
    
    let status = "SUCC"
    
    const users = await db.user.findOne({
        $or: [
            {username: username},
            {email: email}
        ]
    })  

    if (users !== null){
        if (users.username === username){
            status = 'UALR'
        }
        if (users.email === email){
            status = 'EALR'
        }
    }
    
    let token;
    let reftoken;

    if (status === 'SUCC'){
        await db.user.create({
            username: username,
            email: email,
            passwd: hashedPass,
            details: {
                bio: ""
            },
            posts: []
        })

        let data = await generateToken(username)
        
        token = data.token
        reftoken = data.reftoken
    }

    return {
        status: status,
        token: token,
        reftoken: reftoken
    }
}


module.exports = { createUser }