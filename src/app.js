require('dotenv').config();
const { body, param, query } = require('express-validator');
const express = require('express');
const swagger = require('swagger-ui-express');
const cors = require('cors');
const notice = require('./api/notice');
const { Person } = require('./api/user');
const {
  newExists, validation, auth, isOwnerOfNew,
} = require('./middlewares');

const port = Number(process.env.PORT) || 3000;

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

app.use(cors());

app.get('/new/:path',
  param('path').isAscii(),
  validation, newExists,
  (req, res) => res.json(req.newArticle.article));

app.post('/login',
  body('username').isAscii(),
  body('password').isLength({ min: 4 }),
  validation,
  (req, res, next) => new Person(req.body.username).login(req.body.password)
    .then(([token]) => {
      res.json(token);
    })
    .catch((err) => next(err)));

app.get('/new/:path/remove',
  param('path').isAscii(),
  validation, isOwnerOfNew,
  (req, res) => req.newArticle.remove()
    .then(res.sendStatus(200))
    .catch(res.sendStatus(500)));

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
  body('thumbnailUrl').isAscii(),
  body('accessMode').isAscii(),
  body('isBasedOn').isArray(),
  body('inLanguage').isAscii().isLength({ min: 2, max: 2 }),
  body('keywords').isArray(),
  validation, auth,
  (req, res, next) => {
    const {
      title,
      content,
      desc,
      thumbnailUrl,
      accessMode,
      isBasedOn,
      inLanguage,
      keywords,
    } = req.body;

    new notice.News(req.params.path).write(
      title,
      content,
      desc,
      // eslint-disable-next-line no-underscore-dangle
      req.person.data._id,
      {
        thumbnailUrl,
        accessMode,
        isBasedOn,
        inLanguage,
        keywords,
      },
    ).then((newObj) => res.json(newObj)).catch((err) => next(err));
  });

app.get('/person/get',
  query('username').optional().isAscii(),
  query('id').optional().isMongoId(),
  validation,
  (req, res) => {
    if (req.query.username !== undefined) {
      return new Person(req.query.username).get()
        .then((obj) => res.send(obj))
        .catch((err) => res.status(500).send(`An error occured! ${err.message}`));
    }

    if (req.query.id !== undefined) {
      return Person.getById(req.query.id).then((person) => person.get()
        .then((user) => res.json(user))
        .catch((err) => res.status(500).send(`An error occured! ${err.message}`)));
    }

    return res.status(400).json({ errors: 'ID and username variables are not defined!' });
  });

app.get('/new/:path/react',
  param('path').isAscii(),
  query('weight').isInt(),
  validation,
  newExists,
  auth,
  (req, res) => req.person.get()
    .then((person) => {
      // eslint-disable-next-line no-underscore-dangle
      req.newArticle.react(person._id, Number(req.query.weight))
        .then(res.sendStatus(200));
    }));

app.get('/new/:path/comment',
  param('path').isAscii(),
  body('content').isAscii(),
  validation,
  newExists,
  auth,
  // eslint-disable-next-line no-underscore-dangle
  (req, res) => req.newArticle.comment(req.person.data._id, req.body.content)
    .then(res.sendStatus(200))
    .catch(res.sendStatus(500)));

app.use((req, res) => {
  res.status(404).send('Unable to find the requested resource!');
});

// eslint-disable-next-line no-console
app.listen(port, console.info(`Server on localhost:${port}`));
