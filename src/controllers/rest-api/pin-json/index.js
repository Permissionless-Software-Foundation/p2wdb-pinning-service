/*
  REST API library for /pin-json route.
  This route handles requests to pin JSON data.
*/

// Public npm libraries.
import Router from 'koa-router'

// Local libraries.
import PinJsonRESTControllerLib from './controller.js'

class PinJsonRouter {
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

    const dependencies = {
      adapters: this.adapters,
      useCases: this.useCases
    }

    // Encapsulate dependencies.
    this.pinJsonRESTController = new PinJsonRESTControllerLib(dependencies)

    // Instantiate the router and set the base route.
    const baseUrl = '/pin-json'
    this.router = new Router({ prefix: baseUrl })
  }

  attach (app) {
    if (!app) {
      throw new Error(
        'Must pass app object when attached REST API controllers.'
      )
    }

    // Define the routes and attach the controller.
    this.router.post('/', this.pinJsonRESTController.routeWebhook)

    // Attach the Controller routes to the Koa app.
    app.use(this.router.routes())
    app.use(this.router.allowedMethods())
  }
}

export default PinJsonRouter
