const { sign, verify } = require('jsonwebtoken');
const { user } = require('./db');

async function signTokens(payload, type = ' access') {
  let token;
  if (type === 'access') {
    token = sign(payload, process.env.ACCTOKEN_SECRET, { expiresIn: process.env.ACCTOKEN_LIFE });
  } else {
    const query = await user.findOne(payload);

    verify(query.reftoken, process.env.REFTOKEN_SECRET, (err) => {
      if (err) {
        token = sign(payload, process.env.REFTOKEN_SECRET, {
          expiresIn: process.env.REFTOKEN_LIFE,
        });
      } else token = query.reftoken;
    });
  }
  return token;
}

module.exports = { signTokens };
