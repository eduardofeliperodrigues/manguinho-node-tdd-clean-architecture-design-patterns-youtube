const { MongoClient } = require('mongodb')

module.exports = {
  async connect (uri) {
    this.connection = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  },

  async db (dbName) {
    const db = await this.connection.db(dbName)
    return db
  },

  async disconnect () {
    await this.connection.close()
  }
}
