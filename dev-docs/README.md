# Developer Documentation for p2wdb-pinning-service

## Theory of Operation
The p2wdb-pinning-service leverages the webhook feature of P2WDB:

- P2WDB now exists on the public IPFS network and is running well. This means the same node that maintains the P2WDB can be used to pin content.

- I'm going to fork ipfs-service-provider into p2wdb-pinning-service. It'll use the P2WDB app ID of 'p2wd-pin-001'.

- p2wdb-pinning-service will run on top of the P2WDB. On startup, it will register a webhook with a local P2WDB instance. When new data enters the P2WDB with the app ID of 'p2wdb-pin-001', it will trigger the webhook and pass the data from the P2WDB instance to p2wdb-pinning-service.

- The data will include a CID to be pinned, and metadata. The metadata will include the pinners estimate of the size of the file, the expected price in PSF for pinning, a proof of burn (for payment).

- Each instance of p2wdb-pinning-service will evaluate the data and pin the CID if it passes. Default payment will be set at $0.01 per megabyte. The cost in PSF tokens will use the same token data that now sets the price of P2WDB writes.

- Like the data in the P2WDB, new instances entering the network will ignore entries older than a year. So data will naturally fall off the network after about a year.

- If this pinning service is popular enough, it can fund bounties to encourage people to run more instances of p2wdb-pinning-service.
