
var t = require('assert')
var defaults = require('./utils/defaults')


module.exports = ({popup, advanced, content}) => {

  before(async () => {
    await defaults({popup, advanced, content})
  })

  describe('defaults', () => {
    it('localhost:3000', async () => {
      await advanced.bringToFront()
      await advanced.waitForTimeout(300)
      t.equal(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-origins .m-list li').length
        ),
        2,
        'allowed origins count should be 2'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-origins .m-list li:nth-of-type(1) .m-title').innerText
        ),
        'http://localhost:3000',
        'origin name should be http://localhost:3000'
      )
      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelector('.m-origins .m-list li:nth-of-type(1) .m-switch').classList.contains('is-checked')
        ),
        false,
        'csp checkbox should be disabled'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-origins .m-list li:nth-of-type(1) .m-encoding select').value
        ),
        '',
        'encoding should be set to auto'
      )
      t.strictEqual(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-origins .m-list li:nth-of-type(1) .m-footer .m-button').length
        ),
        1,
        'only one button should be visible in the origin footer'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-origins .m-list li:nth-of-type(1) .m-footer .m-button').innerText.toLowerCase()
        ),
        'remove',
        'remove origin button should be rendered'
      )
    })
  })

}
