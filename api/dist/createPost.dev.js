"use strict";

var db = require('../utils/db');

var fs = require('fs');

function createPost(title, desc, id, author, content) {
  var status, newData, users, posts;
  return regeneratorRuntime.async(function createPost$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          status = 'FAIL';
          _context.next = 3;
          return regeneratorRuntime.awrap(db.user.findOne({
            username: author
          }, 'post'));

        case 3:
          users = _context.sent;

          if (users !== null) {
            newData = savePostData(title, desc, createPage(id, content), id, author);
            posts = users.post;
            console.log(users);
            posts.push(id);
            db.user.updateOne({
              username: author
            }, {
              $or: [{
                post: posts
              }]
            });
            status = 'SUCC';
          }

          return _context.abrupt("return", {
            status: status,
            newsData: newData
          });

        case 6:
        case "end":
          return _context.stop();
      }
    }
  });
}

function createPage(name, content) {
  var path = "news/".concat(name, ".md");
  fs.writeFileSync(path, content);
  return path;
}

function savePostData(title, desc, path, id, author) {
  var current, doc;
  return regeneratorRuntime.async(function savePostData$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          current = new Date();
          doc = {
            title: title,
            desc: desc,
            path: path,
            id: id,
            author: author,
            date: current
          };
          _context2.next = 4;
          return regeneratorRuntime.awrap(db.news.create(doc));

        case 4:
          return _context2.abrupt("return", doc);

        case 5:
        case "end":
          return _context2.stop();
      }
    }
  });
}

createPost('Teste 1', 'Testando', 'test-1', 'hytalo-bassi', '# Isso é um teste').then(function (data) {
  return console.log(data);
});
module.exports = {
  createPost: createPost
};