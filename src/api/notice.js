const db = require('../utils/db');

class News {
  constructor(path) {
    this.path = path;
  }

  get() {
    return new Promise((resolve, reject) => {
      db.news.findOneAndUpdate({ path: this.path }, {
        $inc: {
          downloads: 1,
        },
      }, ((err, newObj) => {
        if (err) return reject(err);
        if (newObj === null) return reject(new Error('New not found!'));

        return resolve([newObj]);
      }));
    });
  }

  write(title, content, desc, personId, metadata) {
    const currentDate = new Date();

    let newObj = {
      _id: 0,
      title,
      desc,
      path: this.path,
      author: personId,
      date: currentDate,
      dateLastmod: null,
      downloads: 0,
      metadata,
      content,
    };

    return new Promise((resolve, reject) => {
      db.news.find({ $or: [{ path: this.path }, { title }] }, (err, doc) => {
        if (err) return reject(err);
        if (doc.length > 0) return reject(new Error('New already exists!'));

        db.news.findOne({}, '_id', (err, doc) => {
          if (doc !== null) {
            newObj._id = doc._id + 1;
          }
          if (err) reject(err);

          db.news.create(newObj, (err) => {
            if (err) return reject(err);

            return resolve(newObj);
          });
        }).sort({ _id: -1 });
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      db.news.remove({
        path: this.path,
      }, (err) => {
        if (err) return reject(err);

        return resolve();
      });
    });
  }
}

async function seeCatalog(callback, filters, sort, limit) {
  db.news.find(filters, callback).sort(sort).limit(limit);
}

module.exports = { News, seeCatalog };
