import 'dotenv/config';
import { Request, Response, NextFunction } from 'express';
import { newExists, validation, auth, isOwnerOfNew, newRequest, authenticatedNewRequest } from './middlewares';
import { body, param, query } from 'express-validator';
import swagger = require('swagger-ui-express');
import express = require('express');
import { readFileSync } from 'fs';
import Person from '@api/user';
import News from '@api/notice';
import cors = require('cors');
import { join } from 'path';

const port: number = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.urlencoded({
  extended: false,
}));
app.use(express.json());

app.use('/docs', swagger.serve, swagger.setup(
  JSON.parse(readFileSync(join('src', 'docs.json')).toString())
));

app.use(cors());

app.get('/new/:path',
  param('path').isAscii(),
  validation, newExists,
  (req: newRequest, res: Response) => res.json(req.newArticle?.article));

app.post('/login',
  body('username').isAscii(),
  body('password').isLength({ min: 4 }),
  validation,
  (req: Request, res: Response, next: NextFunction) => {
    new Person(req.body.username).login(req.body.password)
      .then(([token]: [string, Record<string, unknown>]): void => {
          res.json(token);
        })
      .catch((err: Error) => next(err));
  })

app.get('/new/:path/remove',
  param('path').isAscii(),
  validation, isOwnerOfNew,
  (req: authenticatedNewRequest, res: Response) => req.newArticle?.remove()
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500)));

app.get('/catalog', (req: Request, res: Response) => {
  let filters = {};
  let limit = 0;
  let sort = {};

  if (req.query) {
    if (req.query.q) { filters = { title: { $regex: new RegExp(req.query.q as string) } }; }
    if (req.query.author) { filters = { author: req.query.author }; }
    if (req.query.lim) { limit = Number(req.query.lim); }
    if (req.query.highest) { sort = { downloads: -1 }; }
  }
 
  News.seeCatalog((_err, doc) => {
    res.json(doc);
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
  (req: authenticatedNewRequest, res: Response, next: NextFunction) => {
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


    new News(req.params.path).write(
      title,
      content,
      desc,
      req.person?.data._id as string,
      {
        thumbnailUrl,
        accessMode,
        isBasedOn,
        inLanguage,
        keywords,
      },
    ).then((newObj) => res.json(newObj)).catch(err => next(err));
  });

app.get('/person/get',
  query('username').optional().isAscii(),
  query('id').optional().isMongoId(),
  validation,
  (req: Request, res: Response) => {
    if (req.query.username !== undefined) {
      return new Person(req.query.username as string).get()
        .then((obj: unknown) => res.send(obj))
        .catch((err: Error) => res.status(500).send(`An error occured! ${err.message}`));
    }

    if (req.query.id !== undefined) {
      return Person.getById(req.query.id as string)
        .then(person => person.get()
          .then(user => res.json(user))
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
  (req: authenticatedNewRequest, res: Response) => req.person?.get()
    .then(person => {
      req.newArticle?.react(person._id, Number(req.query.weight))
        .then(() => res.sendStatus(200));
    }));

app.get('/new/:path/comment',
  param('path').isAscii(),
  body('content').isAscii(),
  validation,
  newExists,
  auth,
  (req: authenticatedNewRequest, res: Response) => 
    req.newArticle?.comment(req.person?.data._id as string, req.body.content)
      .then(() => res.sendStatus(200))
      .catch(() => res.sendStatus(500))
);

app.use((_req: Request, res: Response) => {
  res.status(404).send('Unable to find the requested resource!');
});

app.listen(port, () => console.info(`Server on localhost:${port}`));
