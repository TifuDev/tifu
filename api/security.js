const { verify, sign } = require('jsonwebtoken')
const { user } = require('../utils/db')
const { hashString } = require('../utils/hash')
require('dotenv').config();

async function loginToRefresh(username, passwd){
    return await user.findOne({
        username: username,
        passwd: hashString(passwd)
    }, 'reftoken') 
}

function authMiddleware(req, res, next){
    try {
        if(req.cookies.token === null) return res.status(401)
        verify(req.cookies.token, process.env.ACCTOKEN_SECRET)
        
        next()
    } catch (error) {
        res.status(401).json({
            status: new Error('Invalid request!')
        });
    }
}

async function getTokens(username){
    const query = await user.findOne({username: username},  'reftoken')
    
    let status = 'UNOTF'
    let reftoken;
    let token;

    if (query !== null){
        status = 'SUCC'
        reftoken = query.reftoken
        verify(reftoken, process.env.REFTOKEN_SECRET, (err) => {
            if(!err) return;
            reftoken = sign(
                payload= { username: username},
                secretOrPrivateKey= process.env.REFTOKEN_SECRET,
                options= { expiresIn: process.env.REFTOKEN_LIFE }
            )
        })
        token = sign({ username: username }, process.env.ACCTOKEN_SECRET, { expiresIn: process.env.ACCTOKEN_LIFE })
    }
    
    return {
        status: status,
        token: token,
        reftoken: reftoken
    } 
}

// async function refreshAccess(refreshToken){
//     let status = 'INVT'
//     const serverRefreshToken = await user.findOne({ reftoken: refreshToken }, 'reftoken')

//     let token;
//     if(serverRefreshToken !== null){
//         // Server did forget you, duh
//         status = 'SDFY'
//         verify(refreshToken, process.env.REFTOKEN_SECRET, (err, decToken) => {
//             if(err) return;
//             token = sign(
//                 payload= { username: decToken.username },
//                 secretOrPrivateKey= process.env.ACCTOKEN_SECRET,
//                 options= { expiresIn: process.env.ACCTOKEN_LIFE }
//             )
    
//             status = 'SUCC'
//         })
//     } else{ status = 'FORB' }

//     return {
//         status: status,
//         token: token
//     }
// }

async function refreshAccess(refreshToken, callback){
    let status = 'INVT'
    const serverRefreshToken = await user.findOne({ reftoken: refreshToken }, 'reftoken')

    let token;
    if(serverRefreshToken !== null){
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
    } else status = 'FORB';

    callback({
        status: status,
        token: token
    })
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

async function login(username, passwd, callback){
    const users = await user.findOne({
        username: username,
        passwd: hashString(passwd)
    })

    let status = 'WPWD',
    token,
    reftoken;
   
    if (users !== null){
        const tokens = await getTokens(username)
        token = tokens.token
        reftoken = tokens.reftoken
        status = 'SUCC'
    }else status = 'UNOTF';

    callback({
        status: status,
        token: token,
        reftoken: reftoken
    })
}

async function generateToken(username){
    const payload = {username: username}
    
    let token;
    let reftoken;
    let status = 'UNOTF'

    if(await user.findOne({username: username}) !== undefined){
        token = sign(payload, process.env.ACCTOKEN_SECRET, {expiresIn: process.env.ACCTOKEN_LIFE})
        reftoken = sign(payload, process.env.REFTOKEN_SECRET, {expiresIn: process.env.REFTOKEN_LIFE})

        await user.updateOne({ username: username }, {
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

module.exports = { authMiddleware, login, getTokens, getRefresh, generateToken, newRefresh, refreshAccess}