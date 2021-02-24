"use strict";

var _require = require('jsonwebtoken'),
    sign = _require.sign,
    verify = _require.verify;

var db = require('../utils/db');

require('dotenv').config();

function generateToken(username) {
  var payload, token, reftoken, status;
  return regeneratorRuntime.async(function generateToken$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          payload = {
            username: username
          };
          status = 'UNOTF';

          if (!(db.user.findOne({
            username: username
          }) !== undefined)) {
            _context.next = 8;
            break;
          }

          token = sign(payload, process.env.ACCTOKEN_SECRET, {
            expiresIn: process.env.ACCTOKEN_LIFE
          });
          reftoken = sign(payload, process.env.REFTOKEN_SECRET, {
            expiresIn: process.env.REFTOKEN_LIFE
          });
          _context.next = 7;
          return regeneratorRuntime.awrap(db.user.updateOne({
            username: username
          }, {
            $set: {
              reftoken: reftoken
            }
          }));

        case 7:
          status = 'SUCC';

        case 8:
          return _context.abrupt("return", {
            status: status,
            token: token,
            reftoken: reftoken
          });

        case 9:
        case "end":
          return _context.stop();
      }
    }
  });
}

function getTokens(username) {
  var query, status, reftoken, token;
  return regeneratorRuntime.async(function getTokens$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(db.user.findOne({
            username: username
          }, 'reftoken'));

        case 2:
          query = _context2.sent;
          status = 'UNOTF';

          if (query !== null) {
            status = 'SUCC';
            reftoken = query.reftoken;
            token = sign({
              username: username
            }, process.env.ACCTOKEN_SECRET, {
              expiresIn: process.env.ACCTOKEN_LIFE
            });
          }

          return _context2.abrupt("return", {
            status: status,
            token: token,
            reftoken: reftoken
          });

        case 6:
        case "end":
          return _context2.stop();
      }
    }
  });
}

getTokens('hytalo-bassi').then(function (i) {
  return console.log(verify(i.token, process.env.ACCTOKEN_SECRET));
});
module.exports = {
  generateToken: generateToken,
  getTokens: getTokens
};