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

  // No api-doc documentation because this wont be a public endpoint
  async routeWebhook (ctx) {
    try {
      console.log('p2wdb REST API handler: body: ', ctx.request.body)

      const data = JSON.parse(ctx.request.body.data)

      const cid = data.cid
      console.log(`Pinning CID: ${cid}`)

      const fileStats = await _this.adapters.ipfs.ipfs.files.stat(
        `/ipfs/${cid}`
      )
      // console.log('fileStats: ', fileStats)

      const fileSize = fileStats.cumulativeSize
      console.log(`CID is ${fileSize} bytes is size.`)

      const oneMegabyte = 1000000
      if (fileSize < oneMegabyte) {
        await _this.adapters.ipfs.ipfs.pin.add(cid)
        console.log('File pinned successfully.')
      } else {
        console.log('File bigger than one megabyte. Not pinning.')
      }

      // const dataType = ctx.request.body.data.dataType
      //
      // if (dataType.includes('counter')) {
      //   // Detect and handle Counter Offers
      //   console.log('counter-offer data detected.')
      //
      //   const counterOffer = ctx.request.body
      //
      //   await _this.useCases.offer.acceptCounterOffer(counterOffer)
      // } else if (dataType.includes('offer')) {
      //   // Detect and handle new Offers
      //   console.log('offer data detected')
      //
      //   const offerObj = ctx.request.body
      //   await _this.useCases.offer.createOffer(offerObj)
      // } else {
      //   console.log('Could not route P2WDB webhook data.')
      // }

      // const orderObj = ctx.request.body.order
      //
      // const hash = await _this.useCases.order.createOrder(orderObj)
      //
      // ctx.body = { hash }

      ctx.body = {
        success: true
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

module.exports = P2WDBRESTControllerLib
