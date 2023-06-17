const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

class LoadUserByEmailRepositorySpy {
  async load (email) {
    this.email = email
    return this.user
  }
}

class EncrypterSpy {
  async compare (password, hashedPassword) {
    this.password = password
    this.hashedPassword = hashedPassword
  }
}

const makeSUT = () => {
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const encrypterSpy = new EncrypterSpy()
  loadUserByEmailRepositorySpy.user = {
    hashedPassword: 'hashed_password'
  }
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy)
  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy
  }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSUT()
    const promise = sut.auth()
    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSUT()
    const promise = sut.auth('any_email@email.com')
    await expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSUT()
    await sut.auth('any_email@email.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@email.com')
  })

  test('Should throw if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()
    const promise = sut.auth('any_email@email.com', 'any_password')
    await expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
  })

  test('Should throw if LoadUserByEmailRepository has no load method', async () => {
    class LoadUserByEmailRepositorySpy {}
    const loadUserByEmailRepository = new LoadUserByEmailRepositorySpy()
    const sut = new AuthUseCase(loadUserByEmailRepository)
    const promise = sut.auth('any_email@email.com', 'any_password')
    await expect(promise).rejects.toThrow(new InvalidParamError('loadUserByEmailRepository'))
  })

  test('Should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSUT()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = await sut.auth('invalid_email@email.com', 'any_password')
    expect(accessToken).toBe(null)
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut } = makeSUT()
    const accessToken = await sut.auth('any_email@email.com', 'invalid_password')
    expect(accessToken).toBe(null)
  })

  test('Should call encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSUT()
    await sut.auth('any_email@email.com', 'any_password')
    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.user.hashedPassword)
  })
})
