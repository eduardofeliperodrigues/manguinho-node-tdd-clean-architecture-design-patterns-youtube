const jwt = require('jsonwebtoken')

class TokenGenerator {
  generate (id) {
    const token = jwt.sign(id, 'secret')
    return token
  }
}

const makeSUT = () => {
  return new TokenGenerator()
}

describe('Token Generator', () => {
  test('Should return null if JWT returns null', async () => {
    const sut = makeSUT()
    jwt.token = null
    const token = await sut.generate('any_id')
    expect(token).toBeNull()
  })

  test('Should return a token if JWT returns tokne', async () => {
    const sut = makeSUT()
    const token = await sut.generate('any_id')
    expect(token).toBe(jwt.token)
  })
})
