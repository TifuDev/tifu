const { sign } = require('jsonwebtoken');
const { user, news } = require('../utils/db');
const { hashString } = require('../utils/hash');

class Person {
  constructor(username) {
    this.username = username;
  }

  create(firstName, familyName, email, details, password) {
    const personObj = {
      firstName,
      familyName,
      username: this.username,
      email,
      details,
      password,
    };

    return new Promise((resolve, reject) => user.findOne(
      { $or: [{ username: this.username }, { firstName, familyName }, { email }] },
      (err, doc) => {
        if (err) return reject(err);
        if (doc !== null) return reject(new Error('Personal data already in use'));

        return user.create(personObj, (createErr) => {
          if (createErr) return reject(createErr);

          return resolve(personObj);
        });
      },
    ));
  }

  get() {
    return new Promise((resolve, reject) => {
      user.findOne({ username: this.username }, (err, doc) => {
        if (err) return reject(err);
        if (doc === null) return reject(new Error('User not found!'));

        return resolve(doc);
      });
    });
  }

  login(password) {
    const { username } = this;
    let token;
    return new Promise((resolve, reject) => {
      user.findOne({
        username,
        password: hashString(password),
      }, (err, doc) => {
        if (err) return reject(err);
        if (doc === null) return reject(new Error('Username or password wrong!'));

        token = sign({ username }, process.env.ACCTOKEN_SECRET, {
          expiresIn: process.env.ACCTOKEN_LIFE,
        });

        return resolve([token, doc]);
      });
    });
  }

  change(field, value) {
    return new Promise((resolve, reject) => {
      user.updateOne({
        username: this.username,
      }, {
        $set: {
          [field]: value,
        },
      }, (err, res) => {
        if (err) return reject(err);

        return resolve(res);
      });
    });
  }

  isOwnerOf(path) {
    return new Promise((resolve, reject) => {
      user.findOne({ username: this.username }, (err, doc) => {
        if (err) return reject(err);
        if (doc === null) return reject(new Error('Username not found'));

        // eslint-disable-next-line no-underscore-dangle
        return news.findOne({ path, author: doc._id }, (newErr, newObj) => {
          if (newErr) return reject(newErr);
          if (newObj === null) return resolve(false);

          return resolve(true);
        });
      });
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      user.deleteOne({ username: this.username }, (err, deletedCount) => {
        if (err) return reject(err);
        if (deletedCount === 0) return reject(new Error('User not found!'));

        return resolve(null);
      });
    });
  }
}

module.exports = { Person };
