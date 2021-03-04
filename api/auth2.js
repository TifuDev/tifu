const { verify, sign } = require('jsonwebtoken')
const { getTokens } = require('./token')
const { user } = require('../utils/db')
const { hashString } = require('../utils/hash')

require('dotenv').config()

async function loginToRefresh(username, passwd){
    return await user.findOne({
        username: username,
        passwd: hashString(passwd)
    }, 'reftoken') 
}

function auth(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)    
    verify(token, process.env.ACCTOKEN_SECRET, (err) => {
        if (err) return;
        next()
    })
}

async function refreshAccess(refreshToken){
    let status = 'INVT'
    const serverRefreshToken = await user.findOne({ reftoken: refreshToken }, 'reftoken')

    let token;
    if(serverRefreshToken !== null){
        // Server did forget you, duh
        status = 'SDFY'
        verify(refreshToken, process.env.REFTOKEN_SECRET, (err, decToken) => {
            if(err) return;
            token = sign(
                payload= { username: decToken.username },
                secretOrPrivateKey= process.env.ACCTOKEN_SECRET,
                options= { expiresIn: process.env.ACCTOKEN_LIFE }
            )
    
            status = 'SUCC'
        })
    } else{ status = 'FORB' }

    return {
        status: status,
        token: token
    }
}

async function newRefresh(username, passwd){
    let status = 'FORB'

    let refreshToken;
    const serverRefreshToken = await loginToRefresh(username, passwd)

    if(serverRefreshToken !== null){
        refreshToken = sign(
            payload= { username: username },
            secretOrPrivateKey= process.env.REFTOKEN_SECRET,
            options= { expiresIn: process.env.REFTOKEN_LIFE }
        )

        await user.updateOne(
            filter= { username: username },
            update= {
                $set: { reftoken: refreshToken }
            }
        )
        status = 'SUCC'
    }

    return {
        status: status,
        reftoken: refreshToken
    }
}

async function getRefresh(username, passwd){
    let status = 'FORB'
    let refreshToken;
    const serverRefreshToken = await loginToRefresh(username, passwd)

    if(serverRefreshToken !== null){
        refreshToken = serverRefreshToken.reftoken
        status = 'SUCC'
    }

    return {
        status: status,
        reftoken: refreshToken
    }
}

async function login(username, passwd){
    const users = await user.findOne({
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
    }else { status = 'UNOTF' }

    return {
        status: status,
        token: token,
        reftoken: reftoken
    }
}

module.exports = { auth, refreshAccess, newRefresh, getRefresh, login }