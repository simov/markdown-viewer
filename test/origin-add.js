
var t = require('assert')


module.exports = ({popup, advanced, content}) => {

  before(async () => {
    // popup
    await popup.bringToFront()
    // defaults button
    await popup.click('button:nth-of-type(2)')

    // advanced
    await advanced.bringToFront()

    // remove origin
    if (await advanced.evaluate(() => Object.keys(state.origins).length > 1)) {
      // expand origin
      if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(2)').classList.contains('m-expanded'))) {
        await advanced.click('.m-list li:nth-of-type(2)')
      }
      await advanced.click('.m-list li:nth-of-type(2) .m-footer .m-button')
    }

    // add origin
    await advanced.select('.m-select', 'http')
    await advanced.type('[type=text]', 'localhost:3000')
    await advanced.click('button')
    await advanced.waitFor(200)

    // expand origin
    if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(2)').classList.contains('m-expanded'))) {
      await advanced.click('.m-list li:nth-of-type(2)')
    }
  })

  describe('defaults', () => {
    it('localhost:3000', async () => {
      t.equal(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-list li').length
        ),
        2,
        'allowed origins count should be 2'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-origin').innerText
        ),
        'http://localhost:3000',
        'origin name should be http://localhost:3000'
      )
      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-switch').classList.contains('is-checked')
        ),
        false,
        'csp checkbox should be disabled'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-encoding select').value
        ),
        '',
        'encoding should be set to auto'
      )
      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-list li:nth-of-type(2) .m-footer .m-button').length
        ),
        1,
        'only one button should be visible in the origin footer'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-list li:nth-of-type(2) .m-footer .m-button').innerText.toLowerCase()
        ),
        'remove',
        'remove origin button should be rendered'
      )
    })
  })

}
