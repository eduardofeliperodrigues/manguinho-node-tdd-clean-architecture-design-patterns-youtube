/*
  O conceito principal do clen architecture é o desacoplamento de código
  e a não dependencia de frameworks/bibliotecas externas, abaixo temos um exemplo
  de uma rota simples de signup, e a modificamos para ficar nos padrões do clean.

  const express = require('express')
  const router = express.Router()
  const mongoose = require('mongoose')
  const AccountModel = mongoose.model('Account')
  module.exports = () => {
    router.post('/signup', async (req, res) => {
      const { email, password, repeatPassword } = req.body
      if (password === repeatPassword) {
        const user = await AccountModel.create({ email, password })
        return res.json(user)
      }
      res.status(400).json({ error: 'password must be equal to repeat Password' })
    })
  }

*/

/*
  na configuração de rotas do framework não chamamos mais a classe router e sim
  a classe de adapter, passando para o adapter qual router deve ser executado
*/
const express = require('express')
const router = express.Router()

module.exports = () => {
  const signUpRouter = new SignUpRouter()
  router.post('/signup', ExpressRouterAdapter.adapt(signUpRouter))
}

/*
  Para conseguirmos desacoplar nossas classes de rota do framework express (neste caso)
  precisamos criar uma classe adapter, ela que fara a comunicação entre o framework
  e a classe de rota em si, a classe adapter receberá qual router ela irá executar como
  parametro do construtor.
*/
// um arquivo adapter, express-router-adapter
class ExpressRouterAdapter {
  static adapt (router) {
    return async function (request, response) {
      const httpRequest = {
        body: request.body
      }
      const httpResponse = await router.route(httpRequest)
      response.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}

/*
  Para desacoplarmos nossa rota do framework express, e caso necessário
  podermos usar qualquer outro, precisamos alterar nossa classe de rota
  para receber um request personalizado e devolver um response personalizado.
*/
// seria um arquivo de rota, o signup-router - camada de presentation
class SignUpRouter {
  async route (httpRequest) {
    const { email, password, repeatPassword } = httpRequest.body
    const user = new SignUpUseCase().signUp(email, password, repeatPassword)
    return {
      statusCode: 200,
      body: user
    }
  }
}

/*
  No clean architecture as regras de negócios/casos de negócios
  são aplicadas dentro de arquivos/classes chamadas use cases,
  no caso abaixo temos um caso de negócio temos a criação de um usuário,
  dentro do usecase fazemos uma validação se a senha e confirmação de senha
  conferem, se sim criamos o usuário, o use case é desviculado de rotas e de
  conexões com banco de dados, as partes ficam desacopladas
*/
// seria um arquivo de usecase - camada de domain
class SignUpUseCase {
  async signUp (email, password, repeatPassword) {
    if (password === repeatPassword) {
      const user = new AddAccountRepository().newAccount(email, password)
      return user
    }
  }
}

/*
  O repositório normalmente tem a conexão com o banco de dados
  e fica desacoplada das regras de negócio, porque se quisermos por exemplo
  trocar o banco de dados, não precisamos mexer nas regras/casos de negócio
  nem nas rotas
*/
// seria um repository - add-account-repo - camda de infra
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')
class AddAccountRepository {
  async newAccount (email, password) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}
