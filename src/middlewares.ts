import Person from '@api/user';
import News from '@api/notice';
const { validationResult } = require('express-validator');
const { verify } = require('jsonwebtoken');

function newExists(req: any, res: any, next: Function) {
  req.newArticle = new News(req.params.path);

  return req.newArticle.get()
    .then(() => next())
    .catch((err: Error) => res.status(404).send(err.message));
}

function validation(req: any, res: any, next: Function) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  return next();
}

// eslint-disable-next-line consistent-return
function auth(req: any, res: any, next: Function) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split('Bearer ')[1];

    if (!token) throw new Error('No token!');

    // eslint-disable-next-line consistent-return
    verify(token, process.env.ACCTOKEN_SECRET, (err: Error, dec: { username: string }) => {
      if (err) return res.sendStatus(err.name === 'TokenExpiredError' ? 403 : 405);
      req.person = new Person(dec.username);

      req.person.get()
        // eslint-disable-next-line consistent-return
        .then((personObj: { }) => {
          if (personObj === null) return res.sendStatus(404);
          next();
        })
        .catch((getErr: Error) => res.status(500).send(getErr));
    });
  } catch {
    return res.sendStatus(401);
  }
}

function isOwnerOfNew(req: any, res: any, next: Function) {
  // eslint-disable-next-line consistent-return
  newExists(req, res, () => auth(req, res, () => {
    // eslint-disable-next-line no-underscore-dangle
    if (req.newArticle.article.author === req.person.data._id) return res.sendStatus(403);

    next();
  }));
}

module.exports = {
  newExists, validation, auth, isOwnerOfNew,
};
