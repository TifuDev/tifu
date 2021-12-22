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

interface bodyRequestSchema {
  body: {
    title: string,
    content: string,
    desc: string,
    thumbnailUrl: string,
    accessMode: string,
    isBasedOn: string[],
    inLanguage: string,
    keywords: string[],
  }
  person: {
    data: {
      _id: string
    }
  }
  params: {
    path: string
  }
}

const port: number = Number(process.env.PORT) || 3000;

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
  (req: any, res: any) => res.json(req.newArticle.article));

app.post('/login',
  body('username').isAscii(),
  body('password').isLength({ min: 4 }),
  validation,
  (req: any, res: any, next: Function) => new Person(req.body.username).login(req.body.password)
    .then(([token]: [string]): void => {
        res.json(token);
      })
    .catch((err: Error) => next(err)));

app.get('/new/:path/remove',
  param('path').isAscii(),
  validation, isOwnerOfNew,
  (req: any, res: any) => req.newArticle.remove()
    .then(res.sendStatus(200))
    .catch(res.sendStatus(500)));

app.get('/catalog', (req: any, res: any) => {
  let filters = {};
  let limit = 0;
  let sort = {};

  if (req.query) {
    if (req.query.q) { filters = { title: { $regex: new RegExp(req.query.q) } }; }
    if (req.query.author) { filters = { author: req.query.author }; }
    if (req.query.lim) { limit = Number(req.query.lim); }
    if (req.query.highest) { sort = { downloads: -1 }; }
  }

  notice.seeCatalog((err: Error, doc: {}) => {
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
  (req: bodyRequestSchema, res: any, next: Function) => {
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
    ).then((newObj: object) => res.json(newObj)).catch((err: Error) => next(err));
  });

app.get('/person/get',
  query('username').optional().isAscii(),
  query('id').optional().isMongoId(),
  validation,
  (req: { query: { username: string, id: string | undefined }}, res: any) => {
    if (req.query.username !== undefined) {
      return new Person(req.query.username).get()
        .then((obj: any) => res.send(obj))
        .catch((err: any) => res.status(500).send(`An error occured! ${err.message}`));
    }

    if (req.query.id !== undefined) {
      return Person.getById(req.query.id).then((person: any) => person.get()
        .then((user: any) => res.json(user))
        .catch((err: Error) => res.status(500).send(`An error occured! ${err.message}`)));
    }

    return res.status(400).json({ errors: 'ID and username variables are not defined!' });
  });

app.get('/new/:path/react',
  param('path').isAscii(),
  query('weight').isInt(),
  validation,
  newExists,
  auth,
  (req: any, res: any) => req.person.get()
    .then((person: any) => {
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
  (req: any, res: any) => req.newArticle.comment(req.person.data._id, req.body.content)
    .then(res.sendStatus(200))
    .catch(res.sendStatus(500)));

app.use((req: any, res: any) => {
  res.status(404).send('Unable to find the requested resource!');
});

// eslint-disable-next-line no-console
app.listen(port, console.info(`Server on localhost:${port}`));
