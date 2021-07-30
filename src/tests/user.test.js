const { mongoose } = require('../utils/db')
const { Person } = require('../api/user')

const personObj = new Person('username')
const details = { profilePhotoUrl: null, bio: 'Biograph', nationality: 'us', gender: 0 }
const password = 'password1234';

it('should create a user', () =>
  expect(personObj.create('First Name', 'Family Name', 'example@domain.com', details, password))
      .resolves.not.toBeNull());

it('should return a user', () => expect(personObj.get()).resolves.not.toBeNull());

it('should login a user', () => expect(personObj.login(password)).resolves.not.toBeNull())

it('should remove a user', () => expect(personObj.remove()).resolves.toBeNull());

afterAll(done => {
  mongoose.connection.close()
  done()
});
