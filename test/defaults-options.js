
var t = require('assert')


module.exports = ({advanced}) => {

  before(async () => {
    await advanced.bringToFront()
  })

  it('access to file URLs', async () => {
    t.strictEqual(
      await advanced.evaluate(() =>
        origins.state.file
      ),
      true,
      'origins.state.file should be true'
    )
  })

  it('header detection', async () => {
    t.strictEqual(
      await advanced.evaluate(() =>
        origins.state.header
      ),
      true,
      'origins.state.header should be true'
    )
    t.strictEqual(
      await advanced.evaluate(() =>
        document.querySelector('.m-switch')
      ),
      null,
      'header detection switch should be hidden'
    )
  })

  it('allowed origins', async () => {
    t.deepStrictEqual(
      await advanced.evaluate(() =>
        origins.state.origins
      ),
      {
        'file://': {
          match: '\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\\?.*)?$',
          csp: false,
          encoding: ''
        }
      },
      'origins.state.origins should contain the file:// origin'
    )
    t.equal(
      await advanced.evaluate(() =>
        document.querySelectorAll('.m-origins .m-list li').length
      ),
      1,
      'should contain only one origin'
    )
    t.equal(
      await advanced.evaluate(() =>
        document.querySelector('.m-origins .m-list li:nth-of-type(1) .m-title').innerText
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
