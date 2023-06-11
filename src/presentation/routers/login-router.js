const HttpResponse = require('../helpers/http-response')
const InvalidParamError = require('../errors/invalid-param-error')
const MissingParamError = require('../errors/missing-param-error')

module.exports = class LoginRouter {
  constructor (authUseCase, emailValidator) {
    this.authUseCase = authUseCase
    this.emailValidator = emailValidator
  }

  async route (httpRequest) {
    /*
      Alteramos este código por um try catch, mas é necessário tomar cuidado,
      pois com try catch, qualquer erro referente a falta de dependencias/parametros
      caíra como server error.

      if (!httpRequest || !httpRequest.body) {
        return HttpResponse.serverError()
      }
      if (!this.authUseCase || !this.authUseCase.auth) {
        return HttpResponse.serverError()
      }
    */
    try {
      const { email, password } = httpRequest.body
      if (!email) return HttpResponse.badRequest(new MissingParamError('email'))
      if (!this.emailValidator.isValid(email)) return HttpResponse.badRequest(new InvalidParamError('email'))
      if (!password) return HttpResponse.badRequest(new MissingParamError('password'))

      const accessToken = await this.authUseCase.auth(email, password)
      if (!accessToken) return HttpResponse.unauthorizedError()
      return HttpResponse.ok({ accessToken })
    } catch (error) {
      return HttpResponse.serverError()
    }
  }
}
