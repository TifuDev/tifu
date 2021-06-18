const { existsSync, mkdirSync, readFileSync} = require("fs");
const { connect } = require("mongoose");
const { join } = require("path");
const path = require("path");
const db = require("../utils/db");
const {Sitemap} = require("../utils/sitemap");

class NoticeAlreadyExists extends Error {
    constructor(msg) {
        super(msg);
        this.name = "NoticeExists";
    }
}

class NoticeNotFound extends Error {
    constructor(msg) {
        super(msg);
        this.name = "NoticeNotFound";
    }
}

class Forbidden extends Error {
    constructor(msg) {
        super(msg);
        this.name = "Forbidden";
    }
}

class CharactersNotURLSafe extends Error{
    constructor(msg) {
        this.msg = "Character used in url are not valid in charset";
        if(msg !== null)
            this.msg = msg;
        this.name = "CharactersNotURLSafe";
    }
}
class Notice {
    constructor(path) {
        this.charset = "abcdefghijklmnopqrstuvwxyz1234567890_-"; 
        this.path = path;
        
        Array.from(path).forEach(char => {
            if(this.charset.indexOf(char) === -1)
                throw new CharactersNotURLSafe();
        });

        this.uri = `${process.env.HOST}/new/${path}`;
        this.file_path = `news/${path}.md`; 

        this.notice = {
            data: {},
            content: ""
        };

    }
    async get(callback) {
        let notice = {
                data: {},
                content: ""
            },
            err;
        try {
            notice.data = await this.download(path);
            if (!notice.data)
                throw new NoticeNotFound("Notice id not found");
            
            notice.content = require("fs").readFileSync(this.file_path, "utf-8");
        } catch (e) {
            err = e;
        }

        this.notice = notice;
        if(callback === undefined) return notice;
        callback(err, notice);
    }
    async createPost(title, desc, author, content, callback) {
        let err,
            sitemap = new Sitemap("public/sitemap.xml");
        const current = new Date(),
            highestId = await db.news.findOne({}, "_id").sort({_id: -1}),
            authorData = await db.user.findOne({username: author}, "noticeCollection");
        sitemap.read();
        try {
            if (await db.news.find({
                    $or: [{
                        path: this.path
                    }, {
                        title: title
                    }]
                }).countDocuments() !== 0) {
                throw new NoticeAlreadyExists("New already exist. Try another title or path");
            } else {
                let id = 0,
                    collectionId = 0;
                
                if(authorData.noticeCollection.length !== 0) collectionId = authorData.noticeCollection.length;
                if(highestId !== null) id = highestId._id +1;
                
                writeNotice(this.path, content);
                sitemap.addUrlToSet(this.uri, current.toISOString());
                sitemap.write();

                var data = {
                    _id: id,
                    title: title,
                    desc: desc,
                    path: this.path,
                    author: author,
                    date: current,
                    downloads: 0,
                    collectionId: collectionId
                };

                await db.news.create(data);

                await db.user.updateOne({
                    username: author
                }, {
                    $push: {
                        noticeCollection: collectionId
                    }
                });
            }
        } catch (e) {
            err = e;
        }
        this.notice.data.title = title;
        this.notice.data.author = author;
        this.notice.data.desc = desc;
        this.notice.content = content;

        callback(err, data);
    }
    async remove(callback) {
        let err,
            sitemap = new Sitemap("public/sitemap.xml");

        try {
            sitemap.read();
            sitemap.removeUrlFromSet(`https://${this.uri}`);
            if (await db.news.findOne({
                    path: this.path
                }) === null) throw new NoticeNotFound("Notice not found");
            await db.news.deleteOne({
                path: this.path
            });

            require("fs").unlinkSync(this.file_path);
            sitemap.write();
        } catch (e) {
            err = e;
        }
        callback(err);
    }
    modifyNoticeContent(content) {
        writeNotice(this.path, content);
        this.notice.content = content;
    }
    async modifyNoticeTitle(title) {
        await db.news.updateOne({
            path: this.path
        }, {
            $set: {
                title: title
            }
        });
        this.notice.data.title = title;
    }
    async modifyNoticeDesc(desc) {
        await db.news.updateOne({
            path: this.path
        }, {
            $set: {
                desc: desc
            }
        });
        this.notice.data.desc = desc;
    }
    static async download(path){
        return await db.news.findOneAndUpdate({path}, {
            $inc: {
                downloads: 1
            }
        });
    }
}

class News{
    constructor(path){
        this.path = path;
    }
    get(){
        return new Promise((resolve, reject) => {
            db.news.findOneAndUpdate({path: this.path}, {
                $inc: {
                    downloads: 1
                }
            }, ((err, newObj) => {
                if(err)
                    return reject(err);

                if(newObj === null)
                    return reject(new NoticeNotFound(""));
                const content = Buffer.from(readFileSync(path.join("news", `${this.path}.md`)));
                resolve([newObj, content]);
            }));            
        });
    }
    write(title, content, desc, personObj, metadata){
        const currentDate = new Date(),
            sitemap = new Sitemap(join("public", "sitemap.xml")),
            dir = "news",
            file_path = join(dir, `${this.path}.md`);

        sitemap.read();
        sitemap.addUrlToSet(`${process.env.HOST}/news/${this.path}`, currentDate);
        
        return new Promise((resolve, reject) => {
            db.news.find({$or: [{path: this.path}, {title}]}, (err, doc) => {
                if(err)
                    return reject(err);
                if(doc.length > 0)
                    return reject(new NoticeAlreadyExists("New already exist. Try another title or path"));
            });
            db.news.findOne({}, "_id", (err, doc) => {
                let id = 0;
                if(doc !== null)
                    id = doc._id +1;
                if(err)
                    reject(err);
                const newObj = {
                    _id: id,
                    title,
                    desc,
                    path: this.path,
                    author: personObj,
                    date: currentDate,
                    dateLastmod: null,
                    downloads: 0,
                    metadata
                };

                db.news.create(newObj, err => {
                    if(err)
                        reject(err);
                    if(!existsSync(dir)) mkdirSync(dir);
                    require("fs").writeFileSync(file_path, content);
                    sitemap.write();
                  
                    resolve(newObj);
                });
    
            }).sort({_id: -1});
        });
    }
}

async function seeCatalog(callback, filters, sort, limit) {
    db.news.find(filters, callback).sort(sort).limit(limit);
}

function writeNotice(name, content) {
    const dir = "news",
        file_path = path.join(dir, `${name}.md`);
    if(!existsSync(dir)) mkdirSync(dir);
    require("fs").writeFileSync(file_path, content);

    return file_path;
}

module.exports = {
    seeCatalog,
    News,
    Notice
};
