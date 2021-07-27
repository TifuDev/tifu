const { config } = require('dotenv');

module.exports = () => {
  config({ path: '.env.test' });
};
