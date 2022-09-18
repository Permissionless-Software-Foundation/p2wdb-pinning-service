# Developer Documentation for p2wdb-pinning-service

## Theory of Operation
The P2WDB Pinning Service currently provides two services:
- Pinning an IPFS CID
- Pinning JSON data written to the P2WDB

### Pinning an IPFS CID
- P2WDB now exists on the public IPFS network and is running well. This means the same node that maintains the P2WDB can be used to pin content.

- This repository (p2wdb-pinning-service) is a fork of [ipfs-service-provider](https://github.com/Permissionless-Software-Foundation/ipfs-service-provider). It's considered an optional 'add-on' package to [ipfs-p2wdb-service](https://github.com/Permissionless-Software-Foundation/ipfs-p2wdb-service).

- p2wdb-pinning-service runs on top of the P2WDB. On startup, it will register a webhook with a local P2WDB instance. When new data enters the P2WDB with the app ID of 'p2wdb-pin-001', it will trigger the webhook and pass the data from the P2WDB instance to p2wdb-pinning-service.

- The data passed from the P2WDB to the pinning service will includes an IPFS CID to be pinned.

- Each instance of p2wdb-pinning-service will evaluate the data independently. Default payment will be set at $0.01 per megabyte by the PSF Minting Council. **Currently, only files 1MB or smaller are supported**.

- Like the data in the P2WDB, new instances entering the network will ignore entries older than a year. So data will naturally fall off the network after about a year.

- If this pinning service is popular enough, it can fund bounties to encourage people to run more instances of p2wdb-pinning-service.

### Pinning JSON Data
- There is frequently a need to upload arbitrary JSON data to the IPFS network. Like any other file, this data is passed around as a CID.

- If the JSON already exists in the P2WDB, this app can retrieve that data and pin it separately to the IPFS node.

- Given a P2WDB zcid (P2WDB CID's start with the letter 'z'), the REST API endpoint will fetch the JSON data from the P2WDB, pin it, and return the IPFS CID for that data.

- The pinning of the JSON data is only done by the single node. A second P2WDB entry must be made to pin that CID across the cluster of IPFS nodes running this p2wdb-pinning-service.
