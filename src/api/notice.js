const db = require('../utils/db');

export default class News {
  constructor(path) {
    this.path = path;
    this.article = {};
  }

  get() {
    return new Promise((resolve, reject) => {
      db.news.findOneAndUpdate({ path: this.path }, { $inc: { downloads: 1 } })
        .then((newObj) => {
          if (newObj === null) return reject(new Error('New not found!'));

          this.article = newObj;
          return resolve([newObj]);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  write(title, content, desc, personId, metadata) {
    const currentDate = new Date();
    const newObj = {
      _id: 0,
      title,
      desc,
      path: this.path,
      pullRequest: [],
      comments: [],
      author: personId || undefined,
      date: currentDate,
      dateLastmod: null,
      downloads: 0,
      metadata,
      content,
      editors: [],
      reactions: [],
    };

    return new Promise((resolve, reject) => {
      db.news.find({ $or: [{ path: this.path }, { title }] }, (err, doc) => {
        if (err) return reject(err);
        if (doc.length > 0) return reject(new Error('New already exists!'));

        // eslint-disable-next-line consistent-return
        return db.news.findOne({}, '_id', (getIdsErr, newsArticles) => {
          if (newsArticles !== null) {
            // eslint-disable-next-line no-underscore-dangle
            newObj._id = newsArticles._id + 1;
          }
          if (getIdsErr) return reject(getIdsErr);
          db.news.create(newObj, (createErr) => {
            if (createErr) return reject(createErr);
            return resolve(newObj);
          });
        }).sort({ _id: -1 });
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      db.news.deleteOne({
        path: this.path,
      }, (err) => {
        if (err) return reject(err);

        return resolve();
      });
    });
  }

  react(personId, weight) {
    return new Promise((resolve, reject) => {
      db.news.updateOne({ path: this.path }, {
        $push: { reactions: [personId, weight] },
      }, (err, doc) => {
        if (err) return reject(err);
        return resolve(doc);
      });
    });
  }

  comment(personId, content, replyToId) {
    const filter = {
      path: this.path,
    };

    const update = {
      $push: {
        comments: {
          _id: db.mongoose.Types.ObjectId(),
          personId,
          content,
          comments: [],
          reactions: [],
        },
      },
    };

    if (replyToId !== undefined) {
      filter['comments._id'] = replyToId !== undefined ? replyToId : undefined;

      update.$push['comments.$.comments'] = update.$push.comments;
      delete update.$push.comments;
    }

    return new Promise((resolve, reject) => {
      db.news.updateOne(filter, update, (err, doc) => {
        if (err) return reject(err);

        return resolve(doc);
      });
    });
  }

  static async seeCatalog(callback, filters, sort, limit) {
    db.news.find(filters, callback).sort(sort).limit(limit);
  }
}
