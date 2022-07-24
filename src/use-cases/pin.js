/*
  This is a use-case library for the pinning service. This library contains
  the business logic for pinning files. This library is primarily called by the
  the REST API controller.
*/

class PinUseCase {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Pin Use Cases library.'
      )
    }
  }
}

module.exports = PinUseCase
