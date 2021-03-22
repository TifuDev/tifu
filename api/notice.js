const db = require('../utils/db')
const { Sitemap } = require('../utils/sitemap')
require('dotenv').config()

class NoticeAlreadyExits extends Error{
    constructor(msg){
        super(msg)
        this.name = "NoticeExists"
    }
}

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
    let err,
    sitemap = new Sitemap('public/sitemap.xml')
    const current = new Date()

    sitemap.read()
    try {
        if(await db.news.find({$or: [{id: id}, {title: title}]}).countDocuments() !== 0){
            throw new NoticeAlreadyExits('Notice id or title already exists')
        }else{
            await db.news.create({
                title: title,
                desc: desc,
                id: id,
                author: author,
                date: current,
                downloads: 0
            })

            await db.user.updateOne({username: author}, {
                $push: {posts: id}
            })

            writeNotice(id, content)
            sitemap.addUrlToSet(`${process.env.HOST}/new/${id}`, current.toISOString())
            sitemap.write()
        }
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
