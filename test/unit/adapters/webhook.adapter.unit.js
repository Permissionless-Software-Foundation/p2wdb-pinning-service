/*
  Unit tests for the webhook adapter.
*/

import { assert } from 'chai'
import sinon from 'sinon'

import WebHook from '../../../src/adapters/webhook.js'

// Set the environment variable to signal this is a test.
process.env.TORLIST_ENV = 'test'

describe('#Webhook-Adapter', () => {
  let uut
  let sandbox

  beforeEach(async () => {
    uut = new WebHook()
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#createWebHook', () => {
    it('should throw error if input is not provided', async () => {
      try {
        await uut.createWebhook()
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'url must be a string')
      }
    })

    it('should throw error if input is not string', async () => {
      try {
        await uut.createWebhook(1)
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'url must be a string')
      }
    })

    it('should handle error', async () => {
      try {
        sandbox.stub(uut.axios, 'post').throws(new Error('test error'))
        await uut.createWebhook('https://test.com/my-webhook')
        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should return response', async () => {
      sandbox
        .stub(uut.axios, 'post')
        .resolves({ data: { success: true, id: '61018c8c9a71973a596cdccb' } })

      const url = 'https://test.com/my-webhook'
      const result = await uut.createWebhook(url)

      assert.isObject(result)
      assert.property(result, 'success')
      assert.property(result, 'id')
      assert.isBoolean(result.success)
      assert.isString(result.id)
    })
  })

  describe('#deleteWebhook', () => {
    it('should delete a webhook', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut.axios, 'delete').resolves({ data: true })

      const url = 'fake-url'

      const result = await uut.deleteWebhook(url)

      assert.equal(result, true)
    })

    it('should catch and throw errors', async () => {
      try {
        // Mock dependencies and force desired code path
        sandbox.stub(uut.axios, 'delete').rejects(new Error('test error'))

        await uut.deleteWebhook('fake-url')

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'test error')
      }
    })

    it('should throw error url is not included', async () => {
      try {
        await uut.deleteWebhook()

        assert.fail('unexpected code path')
      } catch (err) {
        assert.include(err.message, 'url must be a string')
      }
    })
  })

  describe('#waitUntilSuccess', () => {
    it('should return true when webhook is successfully established', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'deleteWebhook').resolves()
      uut.webhookWaitPeriod = 1
      sandbox.stub(uut, 'createWebhook')
        .onCall(0).rejects('not found')
        .onCall(1).resolves()

      const result = await uut.waitUntilSuccess('fake-url')

      assert.equal(result, true)
    })

    it('should continue if deleting the webhook fails', async () => {
      // Mock dependencies and force desired code path
      sandbox.stub(uut, 'deleteWebhook').rejects(new Error('test error'))
      uut.webhookWaitPeriod = 1
      sandbox.stub(uut, 'createWebhook')
        .onCall(0).rejects('not found')
        .onCall(1).resolves()

      const result = await uut.waitUntilSuccess('fake-url')

      assert.equal(result, true)
    })
  })
})
