
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

  it('csp option', async () => {
    t.strictEqual(
      await advanced.evaluate(() =>
        state.csp
      ),
      false,
      'state.csp should be false'
    )
  })

  it('allowed origins', async () => {
    t.deepStrictEqual(
      await advanced.evaluate(() =>
        state.origins
      ),
      {
        'file://': '\\.(?:markdown|mdown|mkdn|md|mkd|mdwn|mdtxt|mdtext|text)(?:#.*|\\?.*)?$'
      },
      'state.origins should contain only the file:// origin'
    )

    t.deepStrictEqual(
      await advanced.evaluate(() =>
        state.origins
      ),
      await advanced.evaluate(() =>
        Array.from(document.querySelectorAll('.m-list li'))
          .reduce((obj, origin) => (
            obj[
              origin.querySelector('span:nth-of-type(1)').innerText.trim() +
              '://' +
              origin.querySelector('span:nth-of-type(2)').innerText.trim()
            ] = origin.querySelector('.m-textfield input').value,
            obj
          ), {})
      ),
      'state.origins should be identical to dom origins'
    )
  })

}
