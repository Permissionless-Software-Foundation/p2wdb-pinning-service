/*
  This is a use-case library for the pinning service. This library contains
  the business logic for pinning files. This library is primarily called by the
  the REST API controller.
*/

// Global npm libraries
import axios from 'axios'
import RetryQueue from '@chris.troutner/retry-queue'

class PinUseCases {
  constructor (localConfig = {}) {
    // console.log('User localConfig: ', localConfig)
    this.adapters = localConfig.adapters
    if (!this.adapters) {
      throw new Error(
        'Instance of adapters must be passed in when instantiating Pin Use Cases library.'
      )
    }

    // Encapsulate dependencies
    this.axios = axios
    this.retryQueue = new RetryQueue()
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
  async pinJson (zcid) {
    try {
      console.log('pinJson will pin the content in this P2WDB entry: ', zcid)

      // Get the entry from the P2WDB. Automatically retry if it fails.
      const data = await this.retryQueue.addToQueue(this.getJsonFromP2wdb, { zcid })

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

      return cid
    } catch (err) {
      console.error('Error in pinJson()')
      throw err
    }
  }

  // A promise-based function for retrieving the data that was just written
  // to the P2WDB. This function is loaded into the Retry Queue, so that it
  // is automatically retried until it succeeds.
  async getJsonFromP2wdb (inObj) {
    // Exract the input arguments from the input object.
    const { zcid } = inObj

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

    return data
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

export default PinUseCases
