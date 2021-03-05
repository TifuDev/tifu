const db = require('../utils/db')

async function noticeData(id, projection = undefined) {
    return await db.news.findOne({id: id}, projection)
}

function noticeContent(path) {
    return require('fs').readFileSync(path, 'utf-8')
}

async function createPost(title, desc, id, author, content){
    let status = 'UNOTF';

    const authorExits = await db.user.findOne({ username: author }, 'posts')
    const noticeExists = await db.news.findOne({
        $or: [
            {id: id},
            {title: title}
        ]
    })

    if (authorExits !== null){
        if (noticeExists !== null){
            await addToCatalog(title, desc, writeNotice(id, content), id, author)
            await db.user.updateOne(
                { username: author }, {
                    $push: {
                        posts: id
                    }
                }
            )
            status = 'SUCC'
        } else { status = 'NALR' }
    }

    return {
        status: status
    }
}

function writeNotice(name, content){
    const path = `news/${name}.md`
    fs.writeFileSync(path, content)
    
    return path
}

async function addToCatalog(title, desc, path, id, author){
    await db.news.create({
        title: title,
        desc: desc,
        path: path,
        id: id,
        author: author,
        date: new Date()
    })
}

module.exports = {noticeData, noticeContent, createPost}