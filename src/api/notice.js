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
      pullRequest: [],
      comments: [],
      author: personId,
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

        return db.user.findOne({ username: personId }, (findUserErr, person) => {
          if (findUserErr) return reject(findUserErr);
          if (person === null) newObj.author = undefined;
          else if (person.roles.indexOf('journalist') === -1) return reject(new Error(`${person.username} not allowed to do this task!`));

          return db.news.findOne({}, '_id', (getIdsErr, newsArticles) => {
            if (newsArticles !== null) {
              newObj._id = newsArticles._id + 1;
            }
            if (getIdsErr) reject(getIdsErr);

            db.news.create(newObj, (createErr) => {
              if (err) return reject(createErr);

              return resolve(newObj);
            });
          }).sort({ _id: -1 });
        });
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
}

async function seeCatalog(callback, filters, sort, limit) {
  db.news.find(filters, callback).sort(sort).limit(limit);
}

module.exports = { News, seeCatalog };
