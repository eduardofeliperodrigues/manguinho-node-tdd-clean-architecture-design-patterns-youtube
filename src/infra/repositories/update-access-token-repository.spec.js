const MissingParamError = require('../../utils/errors/missing-param-error')
const MongoHelper = require('../helpers/mongo-helper')
let db

class UpdateAccessTokenRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async update (userId, accessToken) {
    if (!userId) throw new MissingParamError('userId')
    if (!accessToken) throw new MissingParamError('accessToken')
    await this.userModel.updateOne({
      _id: userId
    }, {
      $set: {
        accessToken
      }
    })
  }
}

const makeSUT = () => {
  const userModel = db.collection('users')
  const sut = new UpdateAccessTokenRepository(userModel)
  return {
    sut,
    userModel
  }
}

describe('UpdateAccessToken Repository', () => {
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

  test('Should update the user with given accessToken', async () => {
    const { userModel, sut } = makeSUT()
    const mockUser = {
      email: 'valid_email@mail.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password'
    }
    const fakeUser = await userModel.insertOne(mockUser)
    await sut.update(fakeUser.insertedId, 'valid_token')
    const updatedFakeUser = await userModel.findOne({ _id: fakeUser.insertedId })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  test('Should throw if no userModel is provided', async () => {
    const sut = new UpdateAccessTokenRepository()
    const userModel = db.collection('users')
    const mockUser = {
      email: 'valid_email@mail.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password'
    }
    const fakeUser = await userModel.insertOne(mockUser)
    const promise = sut.update(fakeUser.insertedId, 'valid_token')
    await expect(promise).rejects.toThrow()
  })

  test('Should throw if no params are provided', async () => {
    const { sut, userModel } = makeSUT()
    const mockUser = {
      email: 'valid_email@mail.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password'
    }
    const fakeUser = await userModel.insertOne(mockUser)
    await expect(sut.update()).rejects.toThrow(new MissingParamError('userId'))
    await expect(sut.update(fakeUser.insertedId)).rejects.toThrow(new MissingParamError('accessToken'))
  })
})
