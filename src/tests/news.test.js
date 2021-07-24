const { mongoose } = require('../utils/db') 
const { News } = require('../api/notice')

const newObj = new News('abc') // Change the path parameter to your need
const newNotFound = new News('some-randomic-path')

describe('Possible new responses', () => {
  test('Normal request to new response', () => {
    return expect(newObj.get()).resolves.not.toBe(null)
  })
  
  test('Request to not existent new response', () => {
    return expect(newNotFound.get()).rejects.toStrictEqual(Error('New not found!'))
  })
})

afterAll(done => {
  mongoose.connection.close()
  done()
})