const LoginRouter = require('../../presentation/routers/login-router')
const AuthUseCase = require('../../domain/usecases/auth-usecase')
const LoadUserByEmailRepository = require('../../infra/repositories/load-user-by-email-repository')
const UpdateAccessTokenRepository = require('../../infra/repositories/update-access-token-repository')
const EmailValidator = require('../../utils/helpers/email-validator')
const Encrypter = require('../../utils/helpers/encrypter')
const TokenGenerator = require('../../utils/helpers/token-generator')
const env = require('../config/env')

module.exports = class LoginRouterComposer {
  static compose () {
    const emailValidator = new EmailValidator()
    const encrypter = new Encrypter()
    const tokenGenerator = new TokenGenerator(env.tokenSecret)
    const loadUserByEmailRepository = new LoadUserByEmailRepository()
    const updateAccessTokenRepository = new UpdateAccessTokenRepository()
    const authUseCase = new AuthUseCase({
      encrypter,
      tokenGenerator,
      loadUserByEmailRepository,
      updateAccessTokenRepository
    })
    return new LoginRouter({
      authUseCase,
      emailValidator
    })
  }
}
