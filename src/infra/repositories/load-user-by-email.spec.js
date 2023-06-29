class LoadUserByEmailRepository {
  async load (email) {
    return null
  }
}

const makeSUT = () => {
  return new LoadUserByEmailRepository()
}

describe('LoadUserByEmail Repository', () => {
  test('Should return null if no user is found', async () => {
    const sut = makeSUT()
    const user = await sut.load('invalid_email@mail.com')
    expect(user).toBe(null)
  })
})
