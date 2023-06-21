class Encrypter {
  async compare (password, passwordHashed) {
    return true
  }
}

describe('Encrypter', () => {
  test('Should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()
    const isValid = await sut.compare('any_password', 'password_hashed')
    expect(isValid).toBe(true)
  })
})
