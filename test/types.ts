import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import type { BWLDrop, BWLDrop__factory } from '../typechain'

declare module 'mocha' {
  export interface Context {
    // Facoriries for contracts
    contract: BWLDrop
    factory: BWLDrop__factory
    // Contract meta data
    name: string
    symbol: string
    tokenId: number
    // Signers
    accounts: SignerWithAddress[]
    owner: SignerWithAddress
    user: SignerWithAddress
  }
}
