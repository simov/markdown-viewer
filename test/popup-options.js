
var t = require('assert')


module.exports = ({browser, popup, advanced}) => {

  describe('set theme', () => {
    var content

    before(async () => {
      // add origin
      await advanced.bringToFront()
      await advanced.select('.m-select', 'http')
      await advanced.type('[type=text]', 'localhost:3000')
      await advanced.click('button')
      await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // select github-dark theme
      await popup.bringToFront()
      await popup.click('.m-tabs a:nth-of-type(1)')
      await popup.select('.m-panel:nth-of-type(1) select', 'github-dark')

      // go to page serving markdown as text/markdown
      content = await browser.newPage()
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor('#_theme')
    })

    it('content', async () => {
      t.strictEqual(
        await content.evaluate(() =>
          /github-dark\.css$/.test(
            document.querySelector('#_theme').getAttribute('href')
          )
        ),
        true,
        'github-dark theme styles should be included'
      )
    })

    it('popup', async () => {
      // reaload popup
      await popup.bringToFront()
      await popup.reload()
      await popup.waitFor('#popup')

      t.equal(
        await popup.evaluate(() =>
          state.theme
        ),
        'github-dark',
        'state.theme should equal github-dark'
      )
      t.equal(
        await popup.evaluate(() =>
          document.querySelectorAll('.m-panel:nth-of-type(1) select option')[
            document.querySelector('.m-panel:nth-of-type(1) select').selectedIndex
          ].innerText
        ),
        'github-dark',
        'dom select option should be github-dark'
      )
    })

    after(async () => {
      await content.close()
    })
  })

  describe('set compiler options - marked', () => {
    var content

    before(async () => {
      // add origin
      await advanced.bringToFront()
      await advanced.select('.m-select', 'http')
      await advanced.type('[type=text]', 'localhost:3000')
      await advanced.click('button')
      await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // compiler tab
      await popup.click('.m-tabs a:nth-of-type(2)')

      // go to page serving markdown as text/markdown
      content = await browser.newPage()
      await content.goto('http://localhost:3000/compiler-options-marked')
      await content.bringToFront()
      await content.waitFor('#_html')
    })

    it('gfm is enabled by default', async () => {
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p del').innerText
        ),
        'strikethrough',
        'gfm should be rendered'
      )
    })

    it('gfm is disabled', async () => {
      // disable gfm
      await popup.bringToFront()
      // gfm switch
      await popup.click('.m-panel:nth-of-type(2) .m-switch:nth-of-type(2)')

      // reload content
      await content.bringToFront()
      await content.reload()
      await content.waitFor('#_html')

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p').innerText
        ),
        '~~strikethrough~~',
        'gfm should not be rendered'
      )
    })

    it('popup state', async () => {
      // reload popup
      await popup.bringToFront()
      await popup.reload()
      await popup.waitFor('#popup')

      t.strictEqual(
        await popup.evaluate(() =>
          state.options.gfm
        ),
        false,
        'state.options.gfm should be false'
      )
      t.strictEqual(
        await popup.evaluate(() =>
          document.querySelector('.m-panel:nth-of-type(2) .m-switch:nth-of-type(2)')
            .classList.contains('is-checked')
        ),
        false,
        'dom gfm checkbox should be disabled'
      )
    })

    after(async () => {
      await content.close()
    })
  })

  describe('set compiler options - remark', () => {
    var content

    before(async () => {
      // add origin
      await advanced.bringToFront()
      await advanced.select('.m-select', 'http')
      await advanced.type('[type=text]', 'localhost:3000')
      await advanced.click('button')
      await advanced.waitFor(() => document.querySelectorAll('.m-list li').length === 2)

      // enable header detection
      if (!await advanced.evaluate(() => state.header)) {
        await advanced.click('.m-switch')
      }

      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // compiler tab
      await popup.click('.m-tabs a:nth-of-type(2)')

      // go to page serving markdown as text/markdown
      content = await browser.newPage()
      await content.goto('http://localhost:3000/compiler-options-remark')
      await content.bringToFront()
      await content.waitFor('#_html')
    })

    it('marked should not render gfm task lists', async () => {
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html ul li').innerText
        ),
        '[ ] task',
        'gfm task lists should not be rendered'
      )
    })

    it('remark should render gfm task lists by default', async () => {
      // select remark compiler
      await popup.bringToFront()
      await popup.select('.m-panel:nth-of-type(2) select', 'remark')

      // reload content page
      await content.bringToFront()
      await content.reload()
      await content.waitFor('#_html')

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html ul li').getAttribute('class')
        ),
        'task-list-item',
        'dom li should have a class set'
      )
      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('#_html ul li [type=checkbox]')
            .hasAttribute('disabled')
        ),
        true,
        'dom li should contain checkbox in it'
      )
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html ul li').innerText
        ),
        ' task',
        'dom li should contain the task text'
      )
    })

    it('remark disable gfm', async () => {
      // disable gfm
      await popup.bringToFront()
      // gfm switch
      await popup.click('.m-panel:nth-of-type(2) .m-switch:nth-of-type(4)')

      // reload content
      await content.bringToFront()
      await content.reload()
      await content.waitFor('#_html')

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html ul li').innerText
        ),
        '[ ] task',
        'gfm task lists should not be rendered'
      )
    })

    after(async () => {
      await content.close()
    })
  })

}
