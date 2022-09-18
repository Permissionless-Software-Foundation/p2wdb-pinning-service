/*
  Unit tests for the REST API handler for the /users endpoints.
*/

// Public npm libraries
import { assert } from 'chai'
import sinon from 'sinon'

// Local support libraries
import adapters from '../../../mocks/adapters/index.js'
import UseCasesMock from '../../../mocks/use-cases/index.js'
import P2WDBRESTController from '../../../../../src/controllers/rest-api/p2wdb/controller.js'

import { context as mockContext } from '../../../../unit/mocks/ctx-mock.js'
let uut
let sandbox
let ctx

describe('#P2WDB-REST-Controller', () => {
  // const testUser = {}

  beforeEach(() => {
    const useCases = new UseCasesMock()
    uut = new P2WDBRESTController({ adapters, useCases })

    sandbox = sinon.createSandbox()

    // Mock the context object.
    ctx = mockContext()
  })

  afterEach(() => sandbox.restore())

  describe('#constructor', () => {
    it('should throw an error if adapters are not passed in', () => {
      try {
        uut = new P2WDBRESTController()

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Adapters library required when instantiating /p2wdb REST Controller.'
        )
      }
    })

    it('should throw an error if useCases are not passed in', () => {
      try {
        uut = new P2WDBRESTController({ adapters })

        assert.fail('Unexpected code path')
      } catch (err) {
        assert.include(
          err.message,
          'Instance of Use Cases library required when instantiating /p2wdb REST Controller.'
        )
      }
    })
  })

  describe('#POST /p2wdb', () => {
    it('should parse and route a JSON string', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.useCases.pin, 'pinCid').resolves(true)

      ctx.request.body = {
        data: '{"cid": "fake-cid"}'
      }

      await uut.routeWebhook(ctx)
      // console.log('ctx.body: ', ctx.body)
      // console.log('ctx.response.body: ', ctx.response.body)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      assert.equal(ctx.response.body.success, true)
    })

    it('should parse and route an object', async () => {
      // Mock dependencies and force desired code path.
      sandbox.stub(uut.useCases.pin, 'pinCid').resolves(true)

      ctx.request.body = {
        data: {
          cid: 'fake-cid'
        }
      }

      await uut.routeWebhook(ctx)
      // console.log('ctx.body: ', ctx.body)
      // console.log('ctx.response.body: ', ctx.response.body)

      // Assert the expected HTTP response
      assert.equal(ctx.status, 200)

      assert.equal(ctx.response.body.success, true)
    })

    it('should return 422 status on biz logic error', async () => {
      try {
        await uut.routeWebhook(ctx)

        assert.fail('Unexpected result')
      } catch (err) {
        // console.log(err)
        assert.equal(err.status, 422)
        assert.include(err.message, 'Cannot read')
      }
    })
  })
})
