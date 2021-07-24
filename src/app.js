const express = require('express');
const swagger = require('swagger-ui-express');
const notice = require('./api/notice');
const sec = require('./api/security');
const { Person } = require('./api/user');

const port = process.env.PORT || 3000;

const app = express();
app.use(express.urlencoded({
  extended: false,
}));
app.use(express.json());

app.use('/docs', swagger.serve, swagger.setup(
  JSON.parse(require('fs').readFileSync(
    require('path').join('src', 'docs.json'),
  )),
));

app.get('/new/:path', (req, res, next) => {
  new notice.News(req.params.path).get()
    .then(([newObj]) => res.json({ newObj }))
    .catch((err) => next(err));
});

app.post('/login', (req, res, next) => {
  new Person(req.body.username).login(req.body.password)
    .then(([token]) => {
      res.json(token);
    })
    .catch((err) => next(err));
});

app.get('/new/:path/remove', sec.noticeOwner, (req, res) => {
  req.newObj.remove()
    .then(res.sendStatus(204))
    .catch((err) => res.status(500).send(err));
});

app.get('/catalog', (req, res) => {
  let filters = {};
  let limit = 0;
  let sort = {};

  if (req.query) {
    if (req.query.q) { filters = { title: { $regex: new RegExp(req.query.q) } }; }
    if (req.query.author) { filters = { author: req.query.author }; }
    if (req.query.lim) { limit = Number(req.query.lim); }
    if (req.query.highest) { sort = { downloads: -1 }; }
  }

  notice.seeCatalog((err, doc) => {
    if (err) return res.status(500);

    return res.json(doc);
  }, filters, sort, limit);
});

app.get('/new/:path/write', sec.authMiddleware, (req, res, next) => {
  const { body } = req;
  req.person.get()
    .then((person) => {
      new notice.News(req.params.path).write(
        body.title,
        body.content,
        body.desc,
        person,
        body.metadata,
      )
        .then((newObj) => res.json(newObj))
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

app.get('/person/:username', (req, res, next) => {
  const person = new Person(req.params.username);
  person.get()
    .then((obj) => {
      res.send(obj);
    })
    .catch((err) => {
      next(err);
    });
});

app.use((req, res) => {
  res.status(404).send('Unable to find the requested resource!');
});

app.listen(port, console.info(`Server on localhost:${port}`));
