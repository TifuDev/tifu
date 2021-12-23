require('@utils/db')
const { connection } = require('mongoose');
const { News } = require('../api/notice');

const newObj = new News('test');
const metadata = {
  inLanguage: 'en-us',
  accessMode: 'textual',
  thumbnailUrl: null,
  keywords: ['keyword']
}

it('should write the new', () =>
  expect(newObj.write('Title', '# Content', 'Description', '', metadata))
    .resolves.not.toBeNull());

it('should return the new', () => expect(newObj.get()).resolves.not.toBeNull());

it('should remove the new', () => expect(newObj.remove()).resolves.toBeUndefined());

afterAll(done => {
  connection.close()
  done()
});
