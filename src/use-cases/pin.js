/*
  This is a use-case library for the pinning service. This library contains
  the business logic for pinning files. This library is primarily called by the
  the REST API controller.
*/

class PinUseCases {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Pin Use Cases library.'
      )
    }
  }

  // Given a CID, pin it with the IPFS node attached to this app.
  async pinCid (cid) {
    try {
      console.log(`Pinning CID: ${cid}`)

      // Verify the CID meets requirements for pinning.
      const isValid = await this.validateCid(cid)
      if (isValid) {
        await this.adapters.ipfs.ipfs.pin.add(cid)
        console.log('File pinned successfully.')

        return true
      }

      console.log('File bigger than a megabyte. Not pinning.')
      return false
    } catch (err) {
      console.error('Error in pinCid()')
      throw err
    }
  }

  // Given an object, pin it with the IPFS node and return the CID.
  async pinJson (jsonToPin) {
    try {
      console.log('pinJson will pin this object: ', jsonToPin)

      return true
    } catch (err) {
      console.error('Error in pinJson()')
      throw err
    }
  }

  // Validate the CID by ensuring it meets the requirements for pinning.
  async validateCid (cid) {
    try {
      // Get the filesize of the CID
      const fileStats = await this.adapters.ipfs.ipfs.files.stat(`/ipfs/${cid}`)
      console.log('fileStats: ', fileStats)

      /*
        fileStats:  {
          size: 0,
          cumulativeSize: 273,
          blocks: 1,
          type: 'directory',
          withLocality: false,
          cid: CID(bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta)
        }
      */

      const fileSize = fileStats.cumulativeSize
      console.log(`CID is ${fileSize} bytes is size.`)

      const oneMegabyte = 1000000

      if (fileSize < oneMegabyte) {
        return true
      }

      return false
    } catch (err) {
      console.error('Error in validateCid()')
      throw err
    }
  }
}

module.exports = PinUseCases
