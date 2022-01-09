const fs = require('fs-extra')
const path = require('path')
const execa = require('execa')
const puppeteer = require('puppeteer')
const { time } = require('console')

jest.setTimeout(100000)

const timeout = (n) => new Promise((r) => setTimeout(r, n))

const servePath = path.resolve(__dirname, '../server/index.js')
const fixtureDir = path.join(__dirname, '../playground')
const tempDir = path.join(__dirname, '../temp')
let devServer
let browser
let page
// const browserLogs = []

const getEl = async (selectorOrEl) => {
  return typeof selectorOrEl === 'string'
    ? await page.$(selectorOrEl)
    : selectorOrEl
}

const getText = async (selectorOrEl) => {
  const el = await getEl(selectorOrEl)
  return el ? el.evaluate((el) => el.textContent) : null
}

const getComputedColor = async (selectorOrEl) => {
  return (await getEl(selectorOrEl)).evaluate(
    (el) => getComputedStyle(el).color
  )
}

describe('editor', () => {
  beforeAll(async () => {
    // devServer = execa('pnpm run dev')

    //await new Promise((resolve) => {
    //  devServer.stdout.on('data', (data) => {
    //    serverLogs.push(data.toString())
    //    if (data.toString().match('running')) {
    //      resolve()
    //    }
    //  })
    // })

    browser = await puppeteer.launch({ headless: false })
    page = await browser.newPage()
  })

  test('测试大写功能', async () => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
    editorElement = await getEl("#editor-content")
    // await time(5000)
    // await page.waitForSelector('#editor-content'); // <-- wait until it exists
    // await page.focus("#editor-content");
    await page.waitForSelector('#editor-content')
    let element = await page.$('#editor-content')
    let value = await page.evaluate(el => el.textContent, element)
    // page.focus(editorElement)
    // page.type(editorElement, '123')
  })
})

async function expectByPolling(poll, expected) {
  const maxTries = 20
  for (let tries = 0; tries < maxTries; tries++) {
    const actual = (await poll()) || ''
    if (actual.indexOf(expected) > -1 || tries === maxTries - 1) {
      expect(actual).toMatch(expected)
      break
    } else {
      await timeout(50)
    }
  }
}
