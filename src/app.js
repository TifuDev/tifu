const { body, validationResult, param } = require('express-validator');
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

app.get('/new/:path',
  param('path').isAscii(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    new notice.News(req.params.path).get()
      .then(([newObj]) => res.json({ newObj }))
      .catch((err) => next(err));
  });

app.post('/login',
  body('username').isAscii(),
  body('password').isLength({ min: 4 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    return new Person(req.body.username).login(req.body.password)
      .then(([token]) => {
        res.json(token);
      })
      .catch((err) => next(err));
  });

app.get('/new/:path/remove',
  param('path').isAscii(),
  sec.noticeOwner, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    return req.newObj.remove()
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

app.get('/new/:path/write',
  body('title').not().isEmpty(),
  body('content').not().isEmpty(),
  body('desc').not().isEmpty().isLength({ min: 12, max: 256 }),
  body('metadata').isJSON(),
  sec.authMiddleware, (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { body } = req;
    return req.person.get()
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

app.get('/person/:username',
  param('username').isAscii(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const person = new Person(req.params.username);
    return person.get()
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
