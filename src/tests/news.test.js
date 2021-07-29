const { mongoose } = require('../utils/db')
const { News } = require('../api/notice')

const newObj = new News('test');
const personId = '507f1f77bcf86cd799439011';
const metadata = {
  inLanguage: 'en-us',
  accessMode: 'textual',
  thumbnailUrl: null,
  keywords: ['keyword']
}

it('should write the new', () =>
  expect(newObj.write('Title', '# Content', 'Description', personId, metadata))
    .resolves.not.toBeNull());

it('should return the new', () => expect(newObj.get()).resolves.not.toBeNull());

it('should remove the new', () => expect(newObj.remove()).resolves.toBeUndefined());

afterAll(done => {
  mongoose.connection.close()
  done()
});
