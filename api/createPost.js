const db = require('../utils/db')
const fs = require('fs');

async function createPost(title, desc, id, author, content){
    let status = 'UNOTF';
    let newData;

    const users = await db.user.findOne({ username: author }, 'posts')
    const news = await db.news.findOne({
        $or: [
            {id: id},
            {title: title}
        ]
    })

    if (users !== null){
        if (news !== null){
            newData = await savePostData(title, desc, createPage(id, content), id, author)
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
        status: status,
        newsData: newData
    }
}

function createPage(name, content){
    const path = `news/${name}.md`
    fs.writeFileSync(path, content)
    
    return path
}

async function savePostData(title, desc, path, id, author){
    let current = new Date()
    const doc = {
        title: title,
        desc: desc,
        path: path,
        id: id,
        author: author,
        date: current
    }
    await db.news.create(doc)

    return doc
}

module.exports = { createPost }