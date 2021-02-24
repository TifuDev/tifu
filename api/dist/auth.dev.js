"use strict";

var _require = require('jsonwebtoken'),
    verify = _require.verify;

require('dotenv').config();

function auth(req, res, next) {
  var authHeader = req.headers['authorization'];
  var token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);
  verify(token, process.env.ACCTOKEN_SECRET);
  next();
}

module.exports = {
  auth: auth
};