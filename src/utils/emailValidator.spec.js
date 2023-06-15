const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

const makeSUT = () => {
  return new EmailValidator()
}

describe('Email validator', () => {
  test('Should return true if validator return true', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('valid_email@mail.com')
    expect(isEmailValid).toBe(true)
  })

  test('Should return false if validator return false', () => {
    validator.isEmailValid = false
    const sut = makeSUT()
    const isEmailInvalid = sut.isValid('invalid_email@mail.com')
    expect(isEmailInvalid).toBe(false)
  })
})
