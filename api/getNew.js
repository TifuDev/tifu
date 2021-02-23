const db = require('../utils/db')

async function getNew(id) {
    return await db.news.findOne({id: id})
}

module.exports = { getNew }