
var t = require('assert')


module.exports = ({advanced}) => {

  before(async () => {
    await advanced.bringToFront()
  })

  it('access to file URLs', async () => {
    t.strictEqual(
      await advanced.evaluate(() =>
        state.file
      ),
      true,
      'state.file should be true'
    )
  })

  it('header detection', async () => {
    t.strictEqual(
      await advanced.evaluate(() =>
        state.header
      ),
      true,
      'state.header should be true'
    )
  })

  it('allowed origins', async () => {
    t.deepStrictEqual(
      await advanced.evaluate(() =>
        state.origins
      ),
      {
        'file://': {
          match: '\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\\?.*)?$',
          csp: false,
          encoding: ''
        }
      },
      'state.origins should contain the file:// origin'
    )
    t.equal(
      await advanced.evaluate(() =>
        document.querySelectorAll('.m-list li').length
      ),
      1,
      'should contain only one origin'
    )
    t.equal(
      await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(1) .m-origin').innerText
      ),
      'file://',
      'origin name should be file://'
    )
    t.equal(
      await advanced.evaluate(() =>
        document.querySelector('.m-list li:nth-of-type(1) .m-match input').value
      ),
      '\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\\?.*)?$',
      'the text input should contain the default path matching regexp'
    )
  })

}
