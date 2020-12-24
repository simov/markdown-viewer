
var t = require('assert')
var defaults = require('./utils/defaults')


module.exports = ({popup, advanced, content}) => {

  before(async () => {
    await defaults({popup, advanced, content})
  })

  describe('button - raw/markdown', () => {
    before(async () => {
      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
    })

    it('render markdown as html', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitForTimeout(300)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p strong').innerText
        ),
        'bold',
        'markdown should be rendered'
      )

      // popup
      await popup.bringToFront()

      t.strictEqual(
        await popup.evaluate(() =>
          state.raw
        ),
        false,
        'state.raw should equal false'
      )
      t.equal(
        await popup.evaluate(() =>
          document.querySelector('.m-button:first-child').innerText.toLowerCase()
        ),
        'markdown',
        'button text should equal markdown'
      )
    })

    it('display raw markdown', async () => {
      // raw button
      await popup.bringToFront()
      await popup.click('button:nth-of-type(1)')
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_markdown').innerText
        ),
        '**bold**',
        'markdown should not be rendered'
      )

      // popup
      await popup.bringToFront()

      t.strictEqual(
        await popup.evaluate(() =>
          state.raw
        ),
        true,
        'state.raw should equal true'
      )
      t.equal(
        await popup.evaluate(() =>
          document.querySelector('.m-button:first-child').innerText.toLowerCase()
        ),
        'html',
        'button text should equal html'
      )
    })
  })

  describe('set theme', () => {
    before(async () => {
      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // theme tab
      await popup.click('.m-tabs a:nth-of-type(1)')
    })

    it('github theme should be set by default', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          /github\.css$/.test(
            document.querySelector('#_theme').getAttribute('href')
          )
        ),
        true,
        'github theme styles should be included'
      )
    })

    it('set github-dark theme', async () => {
      // select github-dark theme
      await popup.bringToFront()
      await popup.select('.m-panel:nth-of-type(1) select', 'github-dark')
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()

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

    it('popup should preserve state', async () => {
      // reload popup
      await popup.bringToFront()
      await popup.reload()
      await popup.waitForTimeout(300)

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
  })

  describe('set compiler options - marked', () => {
    before(async () => {
      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // compiler tab
      await popup.click('.m-tabs a:nth-of-type(2)')
    })

    it('gfm is enabled by default', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/compiler-options-marked')
      await content.bringToFront()
      await content.waitForTimeout(300)

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
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()
      await content.waitForTimeout(300)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p').innerText
        ),
        '~~strikethrough~~',
        'gfm should not be rendered'
      )
    })

    it('popup should preserve state', async () => {
      // reload popup
      await popup.bringToFront()
      await popup.reload()
      await popup.waitForTimeout(300)

      t.equal(
        await popup.evaluate(() =>
          document.querySelectorAll('.m-panel:nth-of-type(2) .m-select option')[
            document.querySelector('.m-panel:nth-of-type(2) .m-select').selectedIndex
          ].innerText
        ),
        'marked',
        'dom select option should be marked'
      )
      t.strictEqual(
        await popup.evaluate(() =>
          state.options.gfm
        ),
        false,
        'state.options.gfm should be false'
      )
      t.strictEqual(
        await popup.evaluate(() =>
          document.querySelector('.m-panel:nth-of-type(2) .m-switch:nth-of-type(2)').classList.contains('is-checked')
        ),
        false,
        'dom gfm checkbox should be disabled'
      )
    })
  })

  describe('set compiler options - remark', () => {
    before(async () => {
      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // compiler tab
      await popup.click('.m-tabs a:nth-of-type(2)')
    })

    it('marked should render gfm task lists by default', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/compiler-options-remark')
      await content.bringToFront()
      await content.waitForTimeout(300)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html ul li').getAttribute('class')
        ),
        null,
        'no class on dom li'
      )
      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('#_html ul li [type=checkbox]').hasAttribute('disabled')
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

    it('remark should render gfm task lists by default', async () => {
      // select remark compiler
      await popup.bringToFront()
      await popup.select('.m-panel:nth-of-type(2) select', 'remark')
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()
      await content.waitForTimeout(300)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html ul li').getAttribute('class')
        ),
        'task-list-item',
        'dom li should have a class set'
      )
      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('#_html ul li [type=checkbox]').hasAttribute('disabled')
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
      // redraw popup
      await popup.bringToFront()
      await popup.reload()
      await popup.waitForTimeout(300)

      // disable gfm - gfm switch
      await popup.click('.m-panel:nth-of-type(2) .m-switch[title~=GFM]')
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()
      await content.waitForTimeout(300)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html ul li').innerText
        ),
        '[ ] task',
        'gfm task lists should not be rendered'
      )
    })

    it('popup should preserve state', async () => {
      // reload popup
      await popup.bringToFront()
      await popup.reload()
      await popup.waitForTimeout(300)

      t.equal(
        await popup.evaluate(() =>
          document.querySelectorAll('.m-panel:nth-of-type(2) .m-select option')[
            document.querySelector('.m-panel:nth-of-type(2) .m-select').selectedIndex
          ].innerText
        ),
        'remark',
        'dom select option should be remark'
      )
      t.strictEqual(
        await popup.evaluate(() =>
          state.options.gfm
        ),
        false,
        'state.options.gfm should be false'
      )
      t.strictEqual(
        await popup.evaluate(() =>
          document.querySelector('.m-panel:nth-of-type(2) .m-switch[title~=GFM]').classList.contains('is-checked')
        ),
        false,
        'dom gfm checkbox should be disabled'
      )
    })
  })

  describe('set content options - toc', () => {
    before(async () => {
      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // content tab
      await popup.click('.m-tabs a:nth-of-type(3)')
    })

    it('toc is disabled by default', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/content-options-toc')
      await content.bringToFront()
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('#_toc')
        ),
        null,
        'toc should be disabled'
      )
    })

    it('enable toc', async () => {
      // enable toc
      await popup.bringToFront()
      // toc switch
      await popup.click('.m-panel:nth-of-type(3) .m-switch:nth-of-type(3)')
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()
      await content.waitForTimeout(300)

      t.deepStrictEqual(
        await content.evaluate(() =>
          Array.from(document.querySelectorAll('#_toc ._ul a'))
            .map((a) => ({href: a.getAttribute('href'), text: a.innerText}))
        ),
        [
          {href: '#h1', text: 'h1'},
          {href: '#h2', text: 'h2'},
          {href: '#h3', text: 'h3'},
        ],
        'toc should be rendered'
      )
    })
  })

  describe('set content options - scroll', () => {
    before(async () => {
      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // content tab
      await popup.click('.m-tabs a:nth-of-type(3)')
    })

    it('preserve scroll position by default', async () => {
      // go to page serving markdown as text/markdown
      await content.goto('http://localhost:3000/content-options-scroll')
      await content.bringToFront()
      await content.waitForTimeout(300)

      // scroll down 200px
      await content.evaluate(() =>
        document.querySelector('html').scrollTop = 200
      )
      await content.waitForTimeout(300)

      // reload page
      await content.reload()
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('html').scrollTop,
        ),
        200,
        'scrollTop should be 200px'
      )
    })

    it('scroll to top', async () => {
      // disable scroll option
      await popup.bringToFront()
      // scroll switch
      await popup.click('.m-panel:nth-of-type(3) .m-switch:nth-of-type(2)')
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('html').scrollTop,
        ),
        0,
        'scrollTop should be 0px'
      )

      // scroll down 200px
      await content.evaluate(() =>
        document.querySelector('html').scrollTop = 200
      )
      await content.waitForTimeout(300)

      // reload page
      await content.reload()
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('html').scrollTop,
        ),
        0,
        'scrollTop should be 0px'
      )
    })

    it('scroll to anchor', async () => {
      // click on header link
      await content.click('h2 a')
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('html').scrollTop + 1
        ),
        await content.evaluate(() =>
          document.querySelector('h2').offsetTop
        ),
        'page should be scrolled to the anchor'
      )

      // scroll down 200px
      await content.evaluate(() =>
        document.querySelector('html').scrollTop += 200
      )
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('html').scrollTop + 1
        ),
        await content.evaluate(() =>
          document.querySelector('h2').offsetTop + 200
        ),
        'page should be scrolled below the anchor'
      )

      // reload page
      await content.reload()
      await content.waitForTimeout(300)

      t.strictEqual(
        await content.evaluate(() =>
          document.querySelector('html').scrollTop
        ),
        await content.evaluate(() =>
          document.querySelector('h2').offsetTop
        ),
        'page should be scrolled back to the anchor'
      )
    })
  })

  describe('set content options - autoreload', () => {
    before(async () => {
      // popup
      await popup.bringToFront()
      // defaults button
      await popup.click('button:nth-of-type(2)')
      // content tab
      await popup.click('.m-tabs a:nth-of-type(3)')

      await content.goto('about:blank')
      await content.bringToFront()
      await content.waitForTimeout(300)

      // go to test page
      await content.goto('http://localhost:3000/popup-autoreload')
      await content.bringToFront()
      await content.waitForTimeout(300)

      // enable autoreload
      await popup.bringToFront()
      // autoreload switch
      await popup.click('.m-panel:nth-of-type(3) .m-switch:nth-of-type(5)')
      // content auto reloads, but there is no way to have both tabs active
      await content.bringToFront()
      await content.reload()
      await content.waitForTimeout(300)

      // TODO: wait for https://github.com/GoogleChrome/puppeteer/pull/2812
      // update autoreload interval
      // await content.evaluate(() => state.ms = 250)
    })

    it('test ajax autoreload with non UTF-8 encoding and inactive tab', async () => {
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p').innerText.trim()
        ),
        '你好',
        'first request'
      )
      // the initial interval is 1000
      await content.waitForTimeout(1300)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p').innerText.trim()
        ),
        '你好',
        'second request - xhr body is UTF-8 - should not trigger reload'
      )
      // the initial interval is 1000
      await content.waitForTimeout(1300)

      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p').innerText.trim()
        ),
        '你好你好',
        'third request - actual change'
      )

      // popup
      await popup.bringToFront()
      // the initial interval is 1000
      await content.waitForTimeout(1300)
      await content.bringToFront()
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_html p').innerText.trim()
        ),
        '你好你好你好',
        'fourth request - should reload inactive tab'
      )
    })
  })

}
