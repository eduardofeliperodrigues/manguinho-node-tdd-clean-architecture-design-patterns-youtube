const { MongoClient } = require('mongodb')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
let connection, db

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
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    db = await connection.db()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany({})
  })

  afterAll(async () => {
    await connection.close()
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
})
