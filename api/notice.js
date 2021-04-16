const db = require('../utils/db');
const {Sitemap} = require('../utils/sitemap');
require('dotenv').config();

class NoticeAlreadyExits extends Error {
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
class Notice {
    constructor(id) {
        this.id = id;
        this.uri = `${process.env.HOST}/new/${id}`;
        this.path = `news/${id}.md`;

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
            notice.data = await db.news.findOneAndUpdate({
                id: this.id
            }, {
                $inc: {
                    downloads: 1
                }
            });

            if (!notice.data) {
                throw new NoticeNotFound('Notice id not found');
            }
            notice.content = require('fs').readFileSync(this.path, 'utf-8');
        } catch (e) {
            err = e;
        }

        this.notice = notice;
        if(callback === undefined) return notice;
        callback(err, notice);
    }
    async createPost(title, desc, author, content, callback) {
        let err,
            sitemap = new Sitemap('public/sitemap.xml');
        const current = new Date();

        sitemap.read();
        try {
            if (await db.news.find({
                    $or: [{
                        id: this.id
                    }, {
                        title: title
                    }]
                }).countDocuments() !== 0) {
                throw new NoticeAlreadyExits('Notice id or title already exists');
            } else {
                await db.news.create({
                    title: title,
                    desc: desc,
                    id: this.id,
                    author: author,
                    date: current,
                    downloads: 0
                });

                await db.user.updateOne({
                    username: author
                }, {
                    $push: {
                        posts: this.id
                    }
                });

                writeNotice(this.id, content);
                sitemap.addUrlToSet(this.uri, current.toISOString());
                sitemap.write();
            }
        } catch (e) {
            err = e;
        }
        this.notice.data.title = title;
        this.notice.data.author = author;
        this.notice.data.desc = desc;
        this.notice.content = content;

        callback(err);
    }
    async remove(callback) {
        let err,
            sitemap = new Sitemap('public/sitemap.xml');

        try {
            sitemap.read();
            sitemap.removeUrlFromSet(`https://${this.uri}`);
            if (await db.news.findOne({
                    id: this.id
                }) === null) throw new NoticeNotFound('Notice not found');
            await db.news.deleteOne({
                id: id
            });
            await db.user.updateOne({
                username: this.notice.data.author
            }, {
                $pull: {
                    posts: this.id
                }
            });

            require('fs').unlinkSync(this.path);
            sitemap.write();
        } catch (e) {
            err = e;
        }
        callback(err);
    }
    modifyNoticeContent(content) {
        writeNotice(this.id, content);
        this.notice.content = content;
    }
    async modifyNoticeTitle(title) {
        await db.news.updateOne({
            id: this.id
        }, {
            $set: {
                title: title
            }
        });
        this.notice.data.title = title;
    }
    async modifyNoticeDesc(desc) {
        await db.news.updateOne({
            id: this.id
        }, {
            $set: {
                desc: desc
            }
        });
        this.notice.data.desc = desc;
    }
}

async function seeCatalog(callback, filters, sort, limit) {
    db.news.find(filters, callback).sort(sort).limit(limit);
}

function writeNotice(name, content) {
    const path = `news/${name}.md`;
    require('fs').writeFileSync(path, content);

    return path;
}

module.exports = {
    seeCatalog,
    Notice
};