const { MissingParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  constructor ({ loadUserByEmailRepository, encrypter, tokenGenerator, updateAccessTokenRepository } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypter
    this.tokenGenerator = tokenGenerator
    this.updateAccessTokenRepository = updateAccessTokenRepository
  }

  async auth (email, password) {
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    /*
      Opção 1 de fluxo de validações
      const user = await this.loadUserByEmailRepository.load(email)
      if (!user) return null
      const isValidPassword = await this.encrypter.compare(password, user.hashedPassword)
      if (!isValidPassword) return null
      const accessToken = await this.tokenGenerator.generate(user.id)
      return accessToken
    */

    const user = await this.loadUserByEmailRepository.load(email)
    if (user) {
      const isValidPassword = await this.encrypter.compare(password, user.hashedPassword)
      if (isValidPassword) {
        const accessToken = await this.tokenGenerator.generate(user.id)
        await this.updateAccessTokenRepository.update(user.id, accessToken)
        return accessToken
      }
    }
    return null
  }
}
