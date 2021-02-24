const { verify } = require('jsonwebtoken')
const { user } = require('../utils/db')

require('dotenv').config()

function auth(req, res, next){
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    verify(token, process.env.ACCTOKEN_SECRET)
    next()
}

// function getAccess(refreshToken, username){
//     user.findOne({ username: username }, 'reftoken')
// }

module.exports = { auth }