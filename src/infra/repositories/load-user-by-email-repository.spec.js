const MissingParamError = require('../../utils/errors/missing-param-error')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
const MongoHelper = require('../helpers/mongo-helper')
let db

const makeSUT = () => {
  const userModel = db.collection('users')
  const sut = new LoadUserByEmailRepository(userModel)

  return {
    sut,
    userModel
  }
}

describe('LoadUserByEmail Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(global.__MONGO_URI__)
    db = await MongoHelper.db()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany({})
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
    const { sut, userModel } = makeSUT()
    const mockUser = {
      email: 'valid_email@mail.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password'
    }
    const fakeUser = await userModel.insertOne(mockUser)
    console.log(fakeUser.insertedId)
    const user = await sut.load('valid_email@mail.com')
    expect(user).toEqual(mockUser)
  })

  test('Should throw if no userModel is provided', async () => {
    const sut = new LoadUserByEmailRepository()
    const promise = sut.load('any_email@mail.com')
    await expect(promise).rejects.toThrow()
  })

  test('Should throw if no userModel is provided', async () => {
    const { sut } = makeSUT()
    const promise = sut.load()
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})
