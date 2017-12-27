
var t = require('assert')


module.exports = ({popup}) => {

  before(async () => {
    await popup.bringToFront()
  })

  it('button - raw', async () => {
    t.strictEqual(
      await popup.evaluate(() =>
        state.raw
      ),
      false,
      'state.raw should equal false'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        document.querySelector('.m-button:first-child').innerText.toLowerCase()
      ),
      'markdown',
      'button text should equal markdown'
    )
  })

  it('tabs', async () => {
    t.equal(
      await popup.evaluate(() =>
        state.tab
      ),
      'theme',
      'state.tab should equal theme'
    )
    t.deepStrictEqual(
      await popup.evaluate(() =>
        state.tabs
      ),
      await popup.evaluate(() =>
        Array.from(document.querySelectorAll('.m-tabs a'))
          .map((tab) => tab.innerText.trim().toLowerCase())
      ),
      'state.tabs should be identical to dom tabs'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        localStorage.getItem('tab')
      ),
      null,
      'localStorage tab key should be null'
    )
  })

  it('tab - theme', async () => {
    t.equal(
      await popup.evaluate(() =>
        state.theme
      ),
      'github',
      'state.theme should equal github'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        document.querySelector('.m-panel:first-child')
          .classList.contains('is-active')
      ),
      true,
      'the first tab panel should be active'
    )
    t.deepStrictEqual(
      await popup.evaluate(() =>
        state.themes
      ),
      await popup.evaluate(() =>
        Array.from(document.querySelectorAll('.m-panel:first-child select option'))
          .map((option) => option.innerText)
      ),
      'state.themes should be identical to dom themes'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        document.querySelector('.m-panel:first-child select').selectedIndex
      ),
      0,
      'dom select option should be 0'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        state.themes.length
      ),
      20,
      'state.themes count should be 20'
    )
  })

  it('tab - compiler', async () => {
    await popup.click('.m-tabs a:nth-of-type(2)')

    t.equal(
      await popup.evaluate(() =>
        state.tab
      ),
      'compiler',
      'state.tab should equal compiler'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        localStorage.getItem('compiler')
      ),
      null,
      'localStorage compiler key should be null'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        document.querySelector('.m-panel:nth-of-type(2)')
          .classList.contains('is-active')
      ),
      true,
      'the second tab panel should be active'
    )
    t.deepStrictEqual(
      await popup.evaluate(() =>
        state.compilers
      ),
      await popup.evaluate(() =>
        Array.from(document.querySelectorAll('.m-panel:nth-of-type(2) select option'))
          .map((option) => option.innerText)
      ),
      'state.compilers should be identical to dom compilers'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        document.querySelector('.m-panel:first-child select').selectedIndex
      ),
      0,
      'dom select option should be 0'
    )
    t.strictEqual(
      await popup.evaluate(() =>
        state.compilers.length
      ),
      2,
      'state.compilers length should equal 2'
    )
    t.deepStrictEqual(
      await popup.evaluate(() =>
        Object.keys(state.options)
        .filter((key) => typeof state.options[key] === 'boolean')
        .reduce((obj, key) => (obj[key] = state.options[key], obj), {})
      ),
      await popup.evaluate(() =>
        Array.from(document.querySelectorAll('.m-panel:nth-of-type(2) label'))
          .reduce((all, option) => (
            all[option.querySelector('span').innerText.trim()] =
            option.classList.contains('is-checked'), all
          ), {})
      ),
      'state.options should equal dom compiler options'
    )
  })

  it('tab - content', async () => {
    await popup.click('.m-tabs a:nth-of-type(3)')

    t.equal(
      await popup.evaluate(() =>
        state.tab
      ),
      'content',
      'state.tab should equal content'
    )
    t.deepStrictEqual(
      await popup.evaluate(() =>
        state.content
      ),
      await popup.evaluate(() =>
        Array.from(document.querySelectorAll('.m-panel:nth-of-type(3) label'))
          .reduce((all, option) => (
            all[option.querySelector('span').innerText.trim()] =
            option.classList.contains('is-checked'), all
          ), {})
      ),
      'state.content should equal dom content options'
    )
  })

}
