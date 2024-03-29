/*
  REST API Controller library for the /p2wdb route
  This route handles incoming data from the P2WDB webhook, and routes the data
  to the proper handler.
*/

// const { wlogger } = require('../../../adapters/wlogger')

let _this

class P2WDBRESTControllerLib {
  constructor (localConfig = {}) {
    // Dependency Injection.
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of Adapters library required when instantiating /p2wdb REST Controller.'
      )
    }
    this.useCases = localConfig.useCases
    if (!this.useCases) {
      throw new Error(
        'Instance of Use Cases library required when instantiating /p2wdb REST Controller.'
      )
    }

    // Encapsulate dependencies
    // this.OrderModel = this.adapters.localdb.Order
    // this.userUseCases = this.useCases.user

    _this = this
  }

  // This endpoint is called by ipfs-p2wdb-service via the app-ID webhook. When
  // someone posts data to the P2WDB with the appId of 'p2wdb-pin-001', it
  // triggers this webhook. The purpose is to pin a CID with the local go-ipfs
  // node attached to this app.
  async routeWebhook (ctx) {
    try {
      // console.log('p2wdb REST API handler body: ', ctx.request.body)
      /*
      Example output for pinning a CID:

      p2wdb REST API handler: body:  {
        appId: 'p2wdb-pin-001',
        data: '{"cid": "bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta"}',
        timestamp: '2022-07-24T13:37:06.276Z',
        localTimeStamp: '7/24/2022, 6:37:06 AM',
        txid: 'c67a7caaad81d7e666f378417ac095556fb8c7b6c0d77e384b49da9601021263',
        hash: 'zdpuB3PUQkecrHQB64fyFjLtXAyn8uiygHBieFosiv3jTBNK9'
      }
      */

      let data
      try {
        data = JSON.parse(ctx.request.body.data)
      } catch (err) {
        data = ctx.request.body.data
      }

      let status = false

      // Handle CID pinning.
      // if (data.cid) {
      const cid = data.cid

      status = await _this.useCases.pin.pinCid(cid)
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
      _this.handleError(ctx, err)
    }
  }

  // DRY error handler
  handleError (ctx, err) {
    console.log('err', err)

    // If an HTTP status is specified by the buisiness logic, use that.
    // if (err.status) {
    //   if (err.message) {
    //     ctx.throw(err.status, err.message)
    //   } else {
    //     ctx.throw(err.status)
    //   }
    // } else {
    // By default use a 422 error if the HTTP status is not specified.
    ctx.throw(422, err.message)
    // }
  }
}

export default P2WDBRESTControllerLib
