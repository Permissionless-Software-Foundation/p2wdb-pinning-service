/*
  REST API Controller library for the /p2wdb route
  This route handles incoming data from the P2WDB webhook, and routes the data
  to the proper handler.
*/

// Local libraries
import config from '../../../../config/index.js'

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

    // this.serverURL = 'http://localhost:5010'
    this.serverURL = config.p2wdbServerUrl

    // bind 'this' object to event handlers
    this.handleError = this.handleError.bind(this)
    this.routeWebhook = this.routeWebhook.bind(this)
    // this.getJsonFromP2wdb = this.getJsonFromP2wdb.bind(this)
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

      const cid = await this.useCases.pin.pinJson(zcid)

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

export default PinJsonRESTControllerLib
