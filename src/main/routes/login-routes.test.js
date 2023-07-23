const request = require('supertest')
const app = require('../config/app')
const bcrypt = require('bcrypt')
const MongoHelper = require('../../infra/helpers/mongo-helper')
let db

describe('Login Routes', () => {
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

  test('Should return 200 when valid credentials are provided', async () => {
    const mockUser = {
      email: 'valid_email@mail.com',
      password: bcrypt.hashSync('hashed_password', 10)
    }
    await db.insertOne(mockUser)
    await request(app)
      .post('/api/login')
      .send({
        email: 'valid_email@mail.com',
        password: 'hashed_password'
      })
      .expect(200)
  })
})
