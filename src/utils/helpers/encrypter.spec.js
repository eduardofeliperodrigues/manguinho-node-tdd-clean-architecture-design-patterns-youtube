jest.mock('bcrypt', () => ({
  isValid: true,
  async compare (value, hashedValue) {
    this.value = value
    this.hashedValue = hashedValue
    return this.isValid
  }
}))

const bcrypt = require('bcrypt')
const Encrypter = require('./encrypter')
const MissingParamError = require('../errors/missing-param-error')

const makeSUT = () => {
  return new Encrypter()
}

describe('Encrypter', () => {
  test('Should return true if bcrypt returns true', async () => {
    const sut = makeSUT()
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(true)
  })

  test('Should return false if bcrypt returns false', async () => {
    const sut = makeSUT()
    bcrypt.isValid = false
    const isValid = await sut.compare('any_value', 'hashed_value')
    expect(isValid).toBe(false)
  })

  test('Should call bcrypt with correct values', async () => {
    const sut = makeSUT()
    await sut.compare('any_value', 'hashed_value')
    expect(bcrypt.value).toBe('any_value')
    expect(bcrypt.hashedValue).toBe('hashed_value')
  })

  test('Should throws if no params are provided', async () => {
    const sut = makeSUT()
    await expect(sut.compare()).rejects.toThrow(new MissingParamError('value'))
    await expect(sut.compare('any_value')).rejects.toThrow(new MissingParamError('hashedValue'))
  })
})
