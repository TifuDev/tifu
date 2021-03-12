const db = require('../utils/db')

async function getNotice(id, callback){
    let notice = {data: {},content: ""}
    let err
    
    try{
        notice.data = await db.news.findOneAndUpdate({id: id}, {
            $inc: {downloads: 1}
        })
        
        notice.content = require('fs').readFileSync(`news/${id}.md`, 'utf-8')
    } catch(e) {err = e};

    callback(err, notice)
}

async function createPost(title, desc, id, author, content){
    let status = 'UNOTF';

    const authorExits = await db.user.findOne({ username: author }, 'posts'),
    noticeExists = await db.news.findOne({
        $or: [
            {id: id},
            {title: title}
        ]
    });

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
        } else status = 'NALR';
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
        date: new Date(),
        downloads: 0
    })
}

async function seeCatolog(callback){
    db.news.find({}, callback)
}

module.exports = {createPost, seeCatolog, getNotice}
