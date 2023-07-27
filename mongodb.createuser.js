const MongoHelper = require('./src/infra/helpers/mongo-helper')
const env = require('./src/main/config/env')
const bcrypt = require('bcrypt')

MongoHelper.connect(env.mongoUrl)
  .then(async () => {
    const userModel = await MongoHelper.db('users')
    try {
      await userModel.insertOne({
        email: 'eduardo@mail.com',
        password: bcrypt.hashSync('123', 10)
      })
    } catch (error) {
      console.log(error)
    }
    MongoHelper.disconnect()
  })
  .catch(console.error)
