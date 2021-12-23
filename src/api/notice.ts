import { news } from '@utils/db'
import { FilterQuery, Types } from 'mongoose';

export default class News {
  path: string;
  article: {
    author?: string
  };
  constructor(path: string) {
    this.path = path;
    this.article = {};
  }

  get(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      news.findOneAndUpdate({ path: this.path }, { $inc: { downloads: 1 } })
        .then(newObj => {
          if (newObj === null) return reject(new Error('New not found!'));

          this.article = newObj;

          return resolve([newObj]);
        })
        .catch((err: Error) => {
          reject(err);
        });
    });
  }

  write(title: string, content: string, desc: string, personId: string, metadata: Record<string, unknown>): Promise<unknown> {
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
      news.find({ $or: [{ path: this.path }, { title }] }, (err: Error, doc: { length: number }) => {
        if (err) return reject(err);
        if (doc.length > 0) return reject(new Error('New already exists!'));

        return news.findOne({}, '_id', (getIdsErr: Error, newsArticles: { _id: number }) => {
          if (newsArticles !== null) {
            newObj._id = newsArticles._id + 1;
          }
          if (getIdsErr) return reject(getIdsErr);
          news.create(newObj, (createErr) => {
            if (createErr) return reject(createErr);
            return resolve(newObj);
          });
        }).sort({ _id: -1 });
      });
    });
  }

  remove(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      news.deleteOne({
        path: this.path,
      }, (err: Error) => {
        if (err) return reject(err);

        return resolve();
      });
    });
  }

  react(personId: string, weight: number) {
    return new Promise((resolve, reject) => {
      news.updateOne({ path: this.path }, {
        $push: { reactions: [personId, weight] },
      }, (err: Error, doc: Record<string, unknown>) => {
        if (err) return reject(err);
        return resolve(doc);
      });
    });
  }

  comment(personId: string, content: string): Promise<void> {
    const filter = { 
      path: this.path
    };

    const update = {
      $push: {
        comments: {
          _id: new Types.ObjectId(),
          personId,
          content,
          comments: [],
          reactions: [],
        },
      },
    };

    return new Promise((resolve, reject) => {
      news.updateOne(filter, update, (err: Error) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  static seeCatalog(callback: (err: Error, doc: unknown) => void, filters?: FilterQuery<unknown>, sort?: unknown, limit?: number) {
    news.find(filters ?? {}, callback).sort(sort).limit(limit ?? 5);
  }
}
