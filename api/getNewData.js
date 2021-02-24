const db = require('../utils/db')

async function getNews(id, projection = undefined) {
    return await db.news.findOne({id: id}, projection)
}

function getContent(path) {
    return require('fs').readFileSync(path, 'utf-8')
}

module.exports = { getNews, getContent }