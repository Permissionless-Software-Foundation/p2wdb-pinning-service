# p2wdb-pinning-service

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Overview

This is a prototype IPFS pinning service. It's an extension to [P2WDB](https://github.com/Permissionless-Software-Foundation/ipfs-p2wdb-service) service. It uses the webhook feature of P2WDB to monitor for entries that instruct it to pin a content ID (CID) that represents a file on IPFS. The same IPFS node the runs P2WDB also pins the CID.

Pinning fees are paid in [PSF tokens](https://psfoundation.cash). The price of pinning files is set by the [PSF Minting Council](https://psfoundation.info). The fee is currently set at a rate of:
- $0.01 USD per megabyte

Like data on the P2WDB, they slowly fall off the network after a year. So data is guaranteed to be pinned by nodes on the network for at least one year.



## License

[MIT](./LICENSE.md)
