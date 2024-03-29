/*
  Unit tests for the pin use-case library.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import PinLib from '../../../src/use-cases/pin.js'

import adapters from '../mocks/adapters/index.js'

describe('#users-use-case', () => {
  let uut
  let sandbox
  // const testUser = {}

  before(async () => {
    // Delete all previous users in the database.
    // await testUtils.deleteAllUsers()
  })

  beforeEach(() => {
    sandbox = sinon.createSandbox()

    uut = new PinLib({ adapters })
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new PinLib()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of adapters must be passed in when instantiating Pin Use Cases library.'
        )
      }
    })
  })

  describe('#validateCid', () => {
    it('should return true for a CID with a small file size', async () => {
      const cid = 'bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta'

      sandbox.stub(uut.adapters.ipfs.ipfs.files, 'stat').resolves({ cumulativeSize: 273 })

      const result = await uut.validateCid(cid)

      assert.equal(result, true)
    })

    it('should return false for a CID with a large file size', async () => {
      const cid = 'bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta'

      sandbox.stub(uut.adapters.ipfs.ipfs.files, 'stat').resolves({ cumulativeSize: 27300000000 })

      const result = await uut.validateCid(cid)

      assert.equal(result, false)
    })

    it('should catch and throw errors', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.adapters.ipfs.ipfs.files, 'stat').rejects(new Error('test error'))

        await uut.validateCid()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })

  describe('#pinCid', () => {
    it('should return false if file is too big', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.adapters.ipfs.ipfs, 'get').resolves()
      sandbox.stub(uut.adapters.ipfs.ipfs.pin, 'add').resolves()
      sandbox.stub(uut.adapters.ipfs.ipfs.pin, 'rm').resolves()
      sandbox.stub(uut, 'validateCid').resolves(false)

      const cid = 'bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta'

      const result = await uut.pinCid(cid)

      assert.equal(result, false)
    })

    it('should return true if file is successfully pinned', async () => {
      const cid = 'bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta'

      // Mock dependencies
      sandbox.stub(uut, 'validateCid').resolves(true)
      sandbox.stub(uut.adapters.ipfs.ipfs.pin, 'add').resolves()

      const result = await uut.pinCid(cid)

      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut, 'validateCid').rejects(new Error('test error'))

        await uut.pinCid()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })
  })

  describe('#getJsonFromP2wdb', () => {
    it('should retrieve an entry from the P2WDB', async () => {
      const inObj = {
        zcid: 'fake-cid'
      }

      // Mock dependencies and force desired code path
      sandbox.stub(uut.axios, 'request').resolves({
        data: {
          data: {
            value: {
              data: {
                foo: 'bar'
              }
            }
          }
        }
      })

      const result = await uut.getJsonFromP2wdb(inObj)
      // console.log('result: ', result)

      assert.equal(result.foo, 'bar')
    })
  })

  describe('#pinJson', () => {
    it('should pin JSON stored in the P2WDB and return the CID', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.retryQueue, 'addToQueue').resolves('{"data": {"foo": "bar"}}')
      sandbox.stub(uut.adapters.ipfs.ipfs, 'add').resolves({ cid: 'fake-cid' })

      const zcid = 'fake-zcid'

      const result = await uut.pinJson(zcid)

      assert.equal(result, 'fake-cid')
    })

    it('should catch and throw errors', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.retryQueue, 'addToQueue').rejects(new Error('test error'))

        await uut.pinJson()

        assert.fail('Unexpected result')
      } catch (err) {
        assert.equal(err.message, 'test error')
      }
    })

    it('should throw error if the P2WDB entry can be parsed into JSON', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.retryQueue, 'addToQueue').resolves('a string that does not parse')

        const zcid = 'fake-zcid'

        await uut.pinJson(zcid)

        assert.fail('Unexpected result')
      } catch (err) {
        assert.include(err.message, 'Could not parse P2WDB entry into a JSON object.')
      }
    })
  })
})
