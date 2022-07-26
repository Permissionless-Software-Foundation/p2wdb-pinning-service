# p2wdb-pinning-service

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

This is a prototype IPFS pinning service. It's an extension to [P2WDB](https://github.com/Permissionless-Software-Foundation/ipfs-p2wdb-service) service. It uses the webhook feature of P2WDB to monitor for entries that instruct it to pin a content ID (CID) that represents a file on IPFS. The same IPFS node the runs P2WDB also pins the CID.

Pinning fees are paid in [PSF tokens](https://psfoundation.cash). The price of pinning files is set by the [PSF Minting Council](https://psfoundation.info). The fee is currently set at a rate of:
- $0.01 USD per megabyte

Like data on the P2WDB, they slowly fall off the network after a year. So data is guaranteed to be pinned by nodes on the network for at least one year.

## Usage

This service will pin an IPFS CID when the appropriate command is written to the P2WDB. Using [psf-bch-wallet](https://github.com/Permissionless-Software-Foundation/psf-bch-wallet), this command can be used to pin content:

`./bin/run p2wdb-write -n test01 -a p2wdb-pin-001 -d '{"cid": "bafybeidmxb6au63p6t7wxglks3t6rxgt6t26f3gx26ezamenznkjdnwqta"}'`

## Production

The pinning service is operated by members of the [PSF](https://psfoundation.cash), who are paid for their efforts through [bounties](https://github.com/Permissionless-Software-Foundation/bounties). The software is composed of several Docker containers:

- **ipfs** - An instance of go-ipfs (kubo).
- **mongo** - An instance of the Mongo Database.
- **p2wdb** - An instance of the pay-to-write database (P2WDB).
- **pin-service** - The code in this repository compiled into a Docker container.
- **circuit-relay-v1** - A V1 Circuit Relay. This is used to punch holes through firewalls for the purpose of file sharing. See [this thread](https://discuss.ipfs.io/t/roadmap-for-circuit-relay-v2-file-transfer/14713/3) for more info.


## License

[MIT](./LICENSE.md)
