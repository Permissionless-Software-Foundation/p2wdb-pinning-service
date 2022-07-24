/*
  Unit tests for the pin use-case library.
*/

// Public npm libraries
const assert = require('chai').assert
const sinon = require('sinon')

// Local support libraries
const PinLib = require('../../../src/use-cases/pin')
const adapters = require('../mocks/adapters')

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
  })
})
