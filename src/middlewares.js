const { validationResult } = require('express-validator');
const { News } = require('./api/notice');

function newExists(req, res, next) {
  req.newArticle = new News(req.params.path);

  return req.newArticle.get()
    .then(() => next())
    .catch((err) => res.status(404).send(err.message));
}

function validation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  return next();
}
module.exports = { newExists, validation };
