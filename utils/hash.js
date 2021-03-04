function hashString(str){
    const hashedStr = require('crypto')
        .createHash('sha256')
        .update(str)
        .digest('hex')
    return hashedStr
}

module.exports = { hashString }