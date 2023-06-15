class AuthUseCase {
  async auth (email) {
    if (!email) throw new Error()
  }
}

const makeSUT = () => {
  return new AuthUseCase()
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const sut = makeSUT()
    const promise = sut.auth()
    expect(promise).rejects.toThrow()
  })
})
