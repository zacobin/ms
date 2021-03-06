const mdl = require('../lib')
const MS = require('jm-ms-core')

const ms = new MS()
ms.use(mdl)

const uri = 'ws://gateway.test.jamma.cn'
let $ = null

async function prepare () {
  if (!$) {
    $ = await ms.client({ uri })
  }
}

describe('ms-client', async () => {
  test('request', async () => {
    await prepare()
    let doc = await $.request('/config')
    expect(doc).toBeTruthy()
  })

  test('request timeout', async () => {
    await prepare()
    try {
      await $.request('/config', {}, { timeout: 1 })
    } catch (e) {
      console.error(e)
      expect(e).toBeTruthy()
    }
  })
})
