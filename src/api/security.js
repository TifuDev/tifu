const { verify } = require('jsonwebtoken');
const { Person } = require('./user');
const { News } = require('./notice');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(405).send('No authorization header provided');

  const access = authHeader.split('Bearer ')[1];
  if (!access) return res.status(405).send('No token provided');
  return verify(access, process.env.ACCTOKEN_SECRET, (err, dec) => {
    if (err) {
      if (err.name === 'TokenExpiredError') return res.sendStatus(403);

      return res.sendStatus(405);
    }
    req.person = new Person(dec.username);

    return req.person.get()
      .then((personObj) => {
        if (personObj === null) return res.status(404).send('User provided do not exists!');
        return next();
      })
      .catch((getErr) => res.status(500).send(getErr));
  });
}

function noticeOwner(req, res, next) {
  const newObj = new News(req.params.path);

  authMiddleware(req, res, async () => {
    const isOwnerOf = req.person.isOwnerOf(req.params.path)
      .then((isOwner) => isOwner)
      .catch((err) => res.status(500).send(err));

    if (!isOwnerOf) return res.sendStatus(403);
    req.newObj = newObj;

    return next();
  });
}

module.exports = { authMiddleware, noticeOwner };
