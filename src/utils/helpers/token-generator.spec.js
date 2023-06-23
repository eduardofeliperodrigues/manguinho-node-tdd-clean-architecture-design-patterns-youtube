const jwt = require('jsonwebtoken')

class TokenGenerator {
  generate (id) {
    const token = jwt.sign(id, 'secret')
    return token
  }
}

describe('Token Generator', () => {
  test('Should return null if JWT returns null', async () => {
    const sut = new TokenGenerator()
    jwt.token = null
    const token = await sut.generate('any_id')
    expect(token).toBeNull()
  })

  test('Should return a token if JWT returns tokne', async () => {
    const sut = new TokenGenerator()
    const token = await sut.generate('any_id')
    expect(token).toBe(jwt.token)
  })
})
