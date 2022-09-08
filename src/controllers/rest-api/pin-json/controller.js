/*
  REST API Controller library for the /p2wdb route
  This route handles incoming data from the P2WDB webhook, and routes the data
  to the proper handler.
*/

// Global npm libraries
import axios from 'axios'
// const { File } = require('web3.storage')

// const { wlogger } = require('../../../adapters/wlogger')

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
      Example output for pinning a JSON object:

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
      const entry2 = JSON.parse(data)
      console.log('entry2: ', entry2)

      // Isolate the raw data
      const rawData = entry2.data
      console.log('rawData: ', rawData)

      // Convert the object to a string
      // const objString = JSON.stringify(rawData)
      // console.log('objString: ', objString)

      // Convert the string to a buffer.
      // const bufferedStr = Buffer.from(objString)
      // console.log('bufferedStr: ', bufferedStr)

      // console.log('this.adapters.ipfs.ipfs: ', this.adapters.ipfs.ipfs)

      // https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/FILES.md#ipfsadddata-options
      // const fileObj = {
      //   path: '/',
      //   content: objString
      // }
      // console.log('fileObj: ', fileObj)

      // const file = {
      //   path: '/tmp/myfile.txt',
      //   content: 'ABC'
      // }

      // console.log(`__dirname: ${__dirname}`)
      const path = `${__dirname.toString()}/test.json`

      // const testJson = {
      //   a: 'b',
      //   foo: 'bar',
      //   c: 4
      // }
      //
      // const objString = JSON.stringify(testJson)
      // const bufferedStr = Buffer.from(objString)
      //
      // const file = {
      //   path: '/',
      //   content: bufferedStr
      // }
      // const bufferedFile = Buffer.from(JSON.stringify(file))

      // const buffer = Buffer.from(JSON.stringify(testJson))

      // const file = [new File([buffer], 'data.json')]

      // Add the buffer to IPFS.
      const ipfsResult = await this.adapters.ipfs.ipfs.pin.add(path)
      console.log('ipfsResult: ', ipfsResult)

      // const cid = ipfsResult.path

      // return cid

      // let data
      // try {
      //   data = JSON.parse(ctx.request.body.data)
      // } catch (err) {
      //   data = ctx.request.body.data
      // }

      const status = true
      //
      // // Handle CID pinning.
      // if (data.cid) {
      //   const cid = data.cid
      //
      //   status = await _this.useCases.pin.pinCid(cid)
      // } else if (data.jsonToPin) {
      //   console.log('Pinning this JSON object: ', data.jsonToPin)
      //
      //   status = await _this.useCases.pin.pinJson(data.jsonToPin)
      // } else {
      //   throw new Error('Input data does not have a cid or jsonToPin property. This app does not know how to process this data.')
      // }

      ctx.body = {
        success: status
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
