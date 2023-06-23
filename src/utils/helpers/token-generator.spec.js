const MissingParamError = require('../errors/missing-param-error')
const jwt = require('jsonwebtoken')

class TokenGenerator {
  constructor (secret) {
    this.secret = secret
  }

  async generate (id) {
    if (!this.secret) throw new MissingParamError('secret')
    if (!id) throw new MissingParamError('id')
    return jwt.sign(id, this.secret)
  }
}

const makeSUT = () => {
  return new TokenGenerator('secret')
}

describe('Token Generator', () => {
  test('Should return null if JWT returns null', async () => {
    const sut = makeSUT()
    jwt.token = null
    const token = await sut.generate('any_id')
    expect(token).toBeNull()
  })

  test('Should return a token if JWT returns token', async () => {
    const sut = makeSUT()
    const token = await sut.generate('any_id')
    expect(token).toBe(jwt.token)
  })

  test('Should call JWT with correct values', async () => {
    const sut = makeSUT()
    await sut.generate('any_id')
    expect(jwt.id).toBe('any_id')
    expect(jwt.secret).toBe(sut.secret)
  })

  test('Should throw if no secret is provided', async () => {
    const sut = new TokenGenerator()
    const promise = sut.generate('any_id')
    await expect(promise).rejects.toThrow(new MissingParamError('secret'))
  })

  test('Should throw if no id is provided', async () => {
    const sut = makeSUT()
    const promise = sut.generate()
    await expect(promise).rejects.toThrow(new MissingParamError('id'))
  })
})
