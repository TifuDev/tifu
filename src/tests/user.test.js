const { mongoose } = require('../utils/db') 
const { Person } = require('../api/user')

const personObj = new Person("hytalo-bassi") // Change the username to your need

const ownerOf = "abc" // Change the path to your need
const notOwnerOf = "some-randomic-username"

const personNotFound = new Person("some-randomic-username")

describe("Possible user responses", () => {
  test("Normal request to user response", () => {
    return expect(personObj.get()).resolves.not.toBe(null)
  })

  test("Request to not found user response", () => {
    return expect(personNotFound.get()).rejects.toStrictEqual(Error('User not found!'))
  })

  test("User is owner of new response", () => {
    return expect(personObj.isOwnerOf(ownerOf)).resolves.toBe(true);
  })

  test("User is not owner of new response", () => {
    return expect(personObj.isOwnerOf(notOwnerOf)).resolves.toBe(false);
  })
})

afterAll(done => {
  mongoose.connection.close()
  done()
})