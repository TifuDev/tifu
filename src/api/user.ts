import { hashString } from '@utils/hash';
import { user, news } from '@utils/db'; 
import { CallbackError } from 'mongoose';
const { sign } = require('jsonwebtoken');

export default class Person {
  username: string;
  data: {};
  static data: {};
  constructor(username: string) {
    this.username = username;
    this.data = {};
  }

  create(firstName: string, familyName: string, email: string, details: { }, password: string) {
    const personObj = {
      firstName,
      familyName,
      username: this.username,
      email,
      details,
      password,
      roles: ['editor', 'commenter'],
    };

    return new Promise((resolve, reject) => user.findOne(
      { $or: [{ username: this.username }, { firstName, familyName }, { email }] },
      (err: Error, doc: { }) => {
        if (err) return reject(err);
        if (doc !== null) return reject(new Error('Personal data already in use'));

        return user.create(personObj, (createErr: CallbackError) => {
          if (createErr) return reject(createErr);

          this.data = personObj;
          return resolve(personObj);
        });
      },
    ));
  }

  static getById(id: string) {
    return new Promise((resolve, reject) => {
      user.findOne({ _id: id }, (err: Error, doc: { username: string }) => {
        if (err) return reject(err);
        if (doc === null) return reject(new Error('User not found'));

        this.data = doc;
        return resolve(new Person(doc.username));
      });
    });
  }

  get() {
    return new Promise((resolve, reject) => {
      user.findOne({ username: this.username }, (err: Error, doc: { }) => {
        if (err) return reject(err);
        if (doc === null) return reject(new Error('User not found!'));

        this.data = doc;
        return resolve(doc);
      });
    });
  }

  login(password: string): Promise<[string, { }]> {
    const { username } = this;
    let token;
    return new Promise((resolve, reject) => {
      user.findOne({
        username,
        password: hashString(password),
      }, (err: Error, doc: { }) => {
        if (err) return reject(err);
        if (doc === null) return reject(new Error('Username or password wrong!'));

        token = sign({ username }, process.env.ACCTOKEN_SECRET, {
          expiresIn: process.env.ACCTOKEN_LIFE,
        });

        return resolve([token, doc]);
      });
    });
  }

  change(field: string, value: string) {
    return new Promise((resolve, reject) => {
      user.updateOne({
        username: this.username,
      }, {
        $set: {
          [field]: value,
        },
      }, (err: string, res: { }) => {
        if (err) return reject(err);

        return resolve(res);
      });
    });
  }

  isOwnerOf(path: string) {
    return new Promise((resolve, reject) => {
      user.findOne({ username: this.username }, (err: Error, doc: { _id: number }) => {
        if (err) return reject(err);
        if (doc === null) return reject(new Error('Username not found'));

        // eslint-disable-next-line no-underscore-dangle
        return news.findOne({ path, author: doc._id }, (newErr: Error, newObj: { }) => {
          if (newErr) return reject(newErr);
          if (newObj === null) return resolve(false);

          return resolve(true);
        });
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      user.deleteOne({ username: this.username }, (err: Error, deletedCount: number) => {
        if (err) return reject(err);
        if (deletedCount === 0) return reject(new Error('User not found!'));

        return resolve(null);
      });
    });
  }
}
