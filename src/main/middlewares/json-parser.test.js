const request = require('supertest')
const app = require('../config/app')

describe('JSON Parser Middleware', () => {
  test('Should parse body as JSON', async () => {
    app.post('/test_json_parser', (req, res) => {
      res.send('')
    })
    const res = await request(app).get('/test_json_parser')
  })
})
