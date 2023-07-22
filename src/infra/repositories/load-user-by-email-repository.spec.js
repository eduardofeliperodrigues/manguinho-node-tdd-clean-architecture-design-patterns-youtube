const MissingParamError = require('../../utils/errors/missing-param-error')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
const MongoHelper = require('../helpers/mongo-helper')
let db

const makeSUT = () => {
  const sut = new LoadUserByEmailRepository()

  return {
    sut
  }
}

describe('LoadUserByEmail Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    db = await MongoHelper.db('users')
  })

  beforeEach(async () => {
    await db.deleteMany({})
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('Should return null if no user is found', async () => {
    const { sut } = makeSUT()
    const user = await sut.load('invalid_email@mail.com')
    expect(user).toBe(null)
  })

  test('Should return an user if user is found', async () => {
    const { sut } = makeSUT()
    const mockUser = {
      email: 'valid_email@mail.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password'
    }
    await db.insertOne(mockUser)
    const user = await sut.load('valid_email@mail.com')
    expect(user).toEqual(mockUser)
  })

  test('Should throw if no userModel is provided', async () => {
    const { sut } = makeSUT()
    const promise = sut.load()
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})
