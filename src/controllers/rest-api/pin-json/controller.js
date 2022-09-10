/*
  REST API Controller library for the /p2wdb route
  This route handles incoming data from the P2WDB webhook, and routes the data
  to the proper handler.
*/

// Global npm libraries
import axios from 'axios'
// const { File } = require('web3.storage')

// const { wlogger } = require('../../../adapters/wlogger')

// Hack to get __dirname back.
// https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
// import * as url from 'url'
// const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

class PinJsonRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /pin-json REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /pin-json REST Controller.'
      )
    }

    this.serverURL = 'http://localhost:5010'

    // Encapsulate dependencies
    // this.OrderModel = this.adapters.localdb.Order
    // this.userUseCases = this.useCases.user
    this.axios = axios

    // bind 'this' object to event handlers
    this.handleError = this.handleError.bind(this)
    this.routeWebhook = this.routeWebhook.bind(this)
  }

  // No api-doc documentation because this wont be a public endpoint
  async routeWebhook (ctx) {
    try {
      console.log('pin-json REST API handler body: ', ctx.request.body)
      /*
        Example input for pinning a JSON object:

        typical body:  {
          zcid: 'zdpuAqc2yMsrdM39gDyhhoCSPpoceGjaTJforddKhaGjBjVUD'
        }
      */

      const zcid = ctx.request.body.zcid
      if (!zcid) {
        throw new Error('P2WDB CID must be included with property zcid')
      }

      // Get the entry from the P2WDB.
      const options = {
        method: 'GET',
        url: `${this.serverURL}/entry/hash/${zcid}`
      }
      const result = await this.axios.request(options)
      const entry = result.data.data
      console.log('entry: ', entry)

      // Isolate the data.
      const data = entry.value.data

      // Convert the data from a string to JSON
      let entry2
      try {
        entry2 = JSON.parse(data)
        console.log('entry2: ', entry2)
      } catch (err) {
        throw new Error('Could not parse P2WDB entry into a JSON object.')
      }

      // Isolate the raw data
      const rawData = entry2.data
      console.log('rawData: ', rawData)

      // Create a FileObject
      // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
      const file = {
        path: '/data.json',
        content: JSON.stringify(rawData)
      }

      const addOptions = {
        cidVersion: 1,
        wrapWithDirectory: true
      }

      // Add the file to IPFS.
      const ipfsResult = await this.adapters.ipfs.ipfs.add(file, addOptions)
      console.log('ipfsResult: ', ipfsResult)

      const cid = ipfsResult.cid.toString()

      const status = true

      ctx.body = {
        success: status,
        cid
      }
    } catch (err) {
      // console.log(`err.message: ${err.message}`)
      // console.log('err: ', err)
      // ctx.throw(422, err.message)
      this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    console.log('err', err)

    // If an HTTP status is specified by the buisiness logic, use that.
    if (err.status) {
      if (err.message) {
        ctx.throw(err.status, err.message)
      } else {
        ctx.throw(err.status)
      }
    } else {
      // By default use a 422 error if the HTTP status is not specified.
      ctx.throw(422, err.message)
    }
  }
}

export default PinJsonRESTControllerLib
