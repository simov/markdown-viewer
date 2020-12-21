
module.exports = async ({popup, advanced, content}) => {
  // popup
  await popup.bringToFront()
  // defaults button
  await popup.click('button:nth-of-type(2)')
  await popup.waitForTimeout(300)

  // advanced
  await advanced.bringToFront()

  // enable header detection
  if (!await advanced.evaluate(() => origins.state.header)) {
    await advanced.click('.m-switch')
  }

  // remove origin
  if (await advanced.evaluate(() => Object.keys(origins.state.origins).length > 1)) {
    // expand origin
    if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
      await advanced.click('.m-list li:nth-of-type(1)')
    }
    await advanced.click('.m-list li:nth-of-type(1) .m-footer .m-button')
  }

  // add origin
  await advanced.select('.m-select', 'http')
  await advanced.type('[type=text]', 'localhost:3000')
  await advanced.click('button')
  await advanced.waitForTimeout(300)

  // expand origin
  if (!await advanced.evaluate(() => document.querySelector('.m-list li:nth-of-type(1)').classList.contains('m-expanded'))) {
    await advanced.click('.m-list li:nth-of-type(1)')
  }

  // content
  await content.bringToFront()
  await content.goto('about:blank')
  await content.waitForTimeout(300)
}
