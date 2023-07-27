module.exports = {
  mongoUrl: process.env.MONGO_URL || 'mongodb://admin:password@localhost:27017',
  tokenSecret: process.env.TOKEN_SECRET || 'secret',
  port: process.env.PORT || 5858
}
