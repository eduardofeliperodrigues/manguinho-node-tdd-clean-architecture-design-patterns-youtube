const LoginRouter = require('./login-router')
const { UnauthorizedError, ServerError } = require('../errors')
const { InvalidParamError, MissingParamError } = require('../../utils/errors')

const makeSUT = () => {
  const authUseCaseSpy = makeAuthUseCase()
  const emailValidatorSpy = makeEmailValidator()
  const sut = new LoginRouter({
    authUseCase: authUseCaseSpy,
    emailValidator: emailValidatorSpy
  })
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidator {
    isValid (email) {
      this.email = email
      return this.isValidEmail
    }
  }
  const emailValidatorSpy = new EmailValidator()
  emailValidatorSpy.isValidEmail = true
  return emailValidatorSpy
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'valid_access_token'
  return authUseCaseSpy
}

const makeEmailValidatorWithError = () => {
  class EmailValidator {
    isValid (email) {
      throw new Error()
    }
  }
  const emailValidatorSpy = new EmailValidator()
  emailValidatorSpy.isValidEmail = true
  return emailValidatorSpy
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpyWithError {
    async auth (email, password) {
      throw new Error()
    }
  }
  const authUseCaseSpyWithError = new AuthUseCaseSpyWithError()
  authUseCaseSpyWithError.accessToken = 'valid_access_token'
  const sut = new LoginRouter(authUseCaseSpyWithError)
  return {
    sut,
    authUseCaseSpyWithError
  }
}

describe('Login Router', () => {
  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toEqual(new MissingParamError('email').message)
  })

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSUT()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toEqual(new MissingParamError('password').message)
  })

  test('Should return 500 if no httpRequest is provided', async () => {
    const { sut } = makeSUT()
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error).toEqual(new ServerError().message)
  })

  test('Should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSUT()
    const httpRequest = {}
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body.error).toEqual(new ServerError().message)
  })

  test('Should call AuthUseCase with correct param', async () => {
    const { sut, authUseCaseSpy } = makeSUT()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('Should return 401 wwhen invalid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSUT()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'invalid_email@email.com',
        password: 'invalid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body.error).toEqual(new UnauthorizedError().message)
  })

  test('Should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSUT()
    const httpRequest = {
      body: {
        email: 'valid_email@email.com',
        password: 'valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  })

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorSpy } = makeSUT()
    emailValidatorSpy.isValidEmail = false
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body.error).toEqual(new InvalidParamError('email').message)
  })

  test('Should call EmailValidator with correct param', async () => {
    const { sut, emailValidatorSpy } = makeSUT()
    const httpRequest = {
      body: {
        email: 'any_email@email.com',
        password: 'any_password'
      }
    }
    await sut.route(httpRequest)
    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })

  test('Should throw if invalid dependecies are provided', async () => {
    const invalid = {}
    const authUseCase = makeAuthUseCase()
    const suts = [
      new LoginRouter(),
      new LoginRouter({}),
      new LoginRouter({
        authUseCase: invalid
      }),
      new LoginRouter({
        authUseCase
      }),
      new LoginRouter({
        authUseCase,
        emailValidator: invalid
      })
    ]

    for (const sut of suts) {
      const httpRequest = {
        body: {
          email: 'invalid_email@email.com',
          password: 'invalid_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toEqual(new ServerError().message)
    }
  })

  test('Should throw if any dependency throws', async () => {
    const authUseCase = makeAuthUseCase()
    const suts = [
      new LoginRouter({
        authUseCase: makeAuthUseCaseWithError()
      }),
      new LoginRouter({
        authUseCase: makeAuthUseCaseWithError()
      }),
      new LoginRouter({
        authUseCase,
        emailValidator: makeEmailValidatorWithError()
      })
    ]

    for (const sut of suts) {
      const httpRequest = {
        body: {
          email: 'invalid_email@email.com',
          password: 'invalid_password'
        }
      }
      const httpResponse = await sut.route(httpRequest)
      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body.error).toEqual(new ServerError().message)
    }
  })
})
