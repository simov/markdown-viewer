
var t = require('assert')
var defaults = require('./utils/defaults')


module.exports = ({popup, advanced, content}) => {

  before(async () => {
    await defaults({popup, advanced, content})
  })

  describe('validate input', () => {
    before(async () => {
      // advanced
      await advanced.bringToFront()
    })

    it('missing name and url', async () => {
      // both empty
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = ''
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = ''
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
      t.equal(
        await advanced.evaluate(() => {
          document.querySelector('.m-themes .m-list')
        }),
        null,
        'should not add theme with missing name and url'
      )
    })

    it('missing name', async () => {
      // empty name
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = ''
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
      t.equal(
        await advanced.evaluate(() => {
          document.querySelector('.m-themes .m-list')
        }),
        null,
        'should not add theme with missing name'
      )
    })

    it('missing url', async () => {
      // empty url
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'hey'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = ''
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
      t.equal(
        await advanced.evaluate(() => {
          document.querySelector('.m-themes .m-list')
        }),
        null,
        'should not add theme with missing url'
      )
    })

    it('duplicate name from the default themes', async () => {
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'github'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
      t.equal(
        await advanced.evaluate(() => {
          document.querySelector('.m-themes .m-list')
        }),
        null,
        'should not add theme with duplicate name'
      )
    })
  })

  describe('add', () => {

    before(async () => {
      await advanced.bringToFront()
    })

    it('add custom theme', async () => {
      // add theme
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'a custom theme'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'file:///hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
      await advanced.waitFor(300)
      t.equal(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-themes .m-list li').length
        ),
        1,
        'the new theme should be added to the list of custom themes'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-themes .m-list .m-title').innerText
        ),
        'a custom theme',
        'the custom theme name should be set in the list'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-add-theme [placeholder=Name]').innerText
        ),
        '',
        'cleanup name input'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-add-theme [placeholder~=URL]').innerText
        ),
        '',
        'cleanup url input'
      )
    })

    it('duplicate name from the custom themes', async () => {
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'a custom theme'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
      t.equal(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-themes .m-list').length
        ),
        1,
        'should not add theme with duplicate name'
      )
    })

    it('preserve state', async () => {
      await advanced.reload()
      await advanced.waitFor(300)
      t.equal(
        await advanced.evaluate(() =>
          document.querySelectorAll('.m-themes .m-list').length
        ),
        1,
        'the new theme should be added to the list of custom themes'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-themes .m-list .m-title').innerText
        ),
        'a custom theme',
        'the custom theme name should be set in the list'
      )
    })
  })

  describe('choose', () => {

    before(async () => {
      // advanced
      await advanced.bringToFront()
      // add theme
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'a custom theme'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'file:///hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
    })

    it('choose custom theme from the popup', async () => {
      // popup
      await popup.bringToFront()
      await popup.reload()
      // theme tab
      await popup.click('.m-tabs a:nth-of-type(1)')

      // select the first theme
      await popup.select('.m-panel:nth-of-type(1) select', 'a custom theme')
      t.equal(
        await popup.evaluate(() =>
          state.theme.name
        ),
        'a custom theme',
        'custom theme should be selected'
      )

      await popup.reload()
      await popup.waitFor(300)
      t.equal(
        await popup.evaluate(() =>
          state.theme.name
        ),
        'a custom theme',
        'custom theme should be selected'
      )
    })

    it('theme should be added to the content', async () => {
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor(300)
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_theme').getAttribute('href')
        ),
        'file:///hey',
        'custom theme should be embedded'
      )
    })
  })

  describe('update url', () => {

    before(async () => {
      // advanced
      await advanced.bringToFront()
      // add theme
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'a custom theme'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'file:///hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })
      // popup
      await popup.bringToFront()
      await popup.reload()
      // theme tab
      await popup.click('.m-tabs a:nth-of-type(1)')
      // select the first theme
      await popup.select('.m-panel:nth-of-type(1) select', 'a custom theme')
    })

    it('update custom theme url', async () => {
      // advanced
      await advanced.bringToFront()
      // expand theme
      if (!await advanced.evaluate(() => document.querySelector('.m-themes .m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-themes .m-list li:nth-of-type(1)')
      }
      // update theme
      await advanced.evaluate(() => {
        document.querySelector('.m-themes .m-option:nth-of-type(2) input').value = 'file:///hi'
        document.querySelector('.m-themes .m-option:nth-of-type(2) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)

      // reload
      await advanced.reload()
      await advanced.waitFor(300)

      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-themes .m-option:nth-of-type(2) input').value
        ),
        'file:///hi',
        'the custom theme URL should be updated'
      )
    })

    it('check content', async () => {
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor(300)
      t.equal(
        await content.evaluate(() =>
          document.querySelector('#_theme').getAttribute('href')
        ),
        'file:///hi',
        'custom theme url should be updated'
      )
    })
  })

  describe('update name', () => {

    before(async () => {
      // advanced
      await advanced.bringToFront()
      // add theme
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'a custom theme'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'file:///hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })

      // popup
      await popup.bringToFront()
      await popup.reload()
      // theme tab
      await popup.click('.m-tabs a:nth-of-type(1)')
      // select the first theme
      await popup.select('.m-panel:nth-of-type(1) select', 'a custom theme')

      // advanced
      await advanced.bringToFront()
      // expand theme
      if (!await advanced.evaluate(() => document.querySelector('.m-themes .m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-themes .m-list li:nth-of-type(1)')
      }
    })

    it('update custom theme name', async () => {
      // update theme
      await advanced.evaluate(() => {
        document.querySelector('.m-themes .m-option:nth-of-type(1) input').value = 'a very custom theme'
        document.querySelector('.m-themes .m-option:nth-of-type(1) input').dispatchEvent(new Event('keyup'))
      })
      // there is debounce timeout of 750ms in the options UI
      await advanced.waitFor(800)

      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-themes .m-list .m-title').innerText
        ),
        'a very custom theme',
        'the custom theme name should be updated in the list title'
      )

      // reload
      await advanced.reload()
      await advanced.waitFor(300)

      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-themes .m-list .m-title').innerText
        ),
        'a very custom theme',
        'the custom theme name should be updated in the list title'
      )
      t.equal(
        await advanced.evaluate(() =>
          document.querySelector('.m-themes .m-option:nth-of-type(1) input').value
        ),
        'a very custom theme',
        'the custom theme name should be updated'
      )
    })

    it('check popup', async () => {
      // popup
      await popup.bringToFront()
      await popup.reload()
      // theme tab
      await popup.click('.m-tabs a:nth-of-type(1)')

      t.equal(
        await popup.evaluate(() =>
          document.querySelector('.m-panel:nth-of-type(1) select option').innerText
        ),
        'a very custom theme',
        'the custom theme should be updated'
      )
    })

    it('check content', async () => {
      await content.goto('http://localhost:3000/correct-content-type')
      await content.bringToFront()
      await content.waitFor(300)
      t.ok(
        /github\.css$/.test(
          await content.evaluate(() =>
            document.querySelector('#_theme').getAttribute('href')
          )
        ),
        'defaults to github theme if the custom theme was active'
      )
    })
  })

  describe('remove', () => {

    before(async () => {
      // advanced
      await advanced.bringToFront()
      // add theme
      await advanced.evaluate(() => {
        document.querySelector('.m-add-theme [placeholder=Name]').value = 'a custom theme'
        document.querySelector('.m-add-theme [placeholder=Name]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme [placeholder~=URL]').value = 'file:///hey'
        document.querySelector('.m-add-theme [placeholder~=URL]').dispatchEvent(new Event('change'))
        document.querySelector('.m-add-theme button').click()
      })

      // advanced
      await advanced.bringToFront()
      // expand theme
      if (!await advanced.evaluate(() => document.querySelector('.m-themes .m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
        await advanced.click('.m-themes .m-list li:nth-of-type(1)')
      }
    })

    it('remove custom theme', async () => {
      // remove
      await advanced.evaluate(() => {
        document.querySelector('.m-themes .m-list button').click()
      })
      t.equal(
        await advanced.evaluate(() => {
          document.querySelector('.m-themes .m-list')
        }),
        null,
        'should not have any themes'
      )
    })
  })

}
