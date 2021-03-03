const { verify, sign } = require('jsonwebtoken')
const { user } = require('../utils/db')

require('dotenv').config()

function auth(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    verify(token, process.env.ACCTOKEN_SECRET)
    next()
}

// When access token has expired create a new with refresh token
async function getAccess(refreshToken){
    let status = 'REFI';
    let token;

    await verify(refreshToken, process.env.REFTOKEN_SECRET, async (err, dec) => {
        if (err) return;
        const users = await user.findOne({ reftoken: refreshToken }, 'reftoken')
        if(users !== null){
            token = sign({username: dec.username}, process.env.ACCTOKEN_SECRET, {expiresIn: process.env.ACCTOKEN_LIFE})
            status = 'SUCC'
        } else{ status = 'FORB' }
    })

    return {
        status: status,
        token: token
    }
}

module.exports = { auth, getAccess }