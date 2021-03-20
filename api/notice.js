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

async function createPost(title, desc, id, author, content, callback){
    let err;
    try {
        await db.news.create({
            title: title,
            desc: desc,
            id: id,
            author: author,
            date: new Date(),
            downloads: 0
        })

        writeNotice(id, content)   
    } catch (e) {
        err = e
    }

    callback(err)
}

function writeNotice(name, content){
    const path = `news/${name}.md`
    require('fs').writeFileSync(path, content)
    
    return path
}

async function seeCatolog(callback){
    db.news.find({}, callback)
}

module.exports = {createPost, seeCatolog, getNotice}
