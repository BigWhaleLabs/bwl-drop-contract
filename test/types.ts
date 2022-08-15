import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import type { SCNFTDrop, SCNFTDrop__factory } from '../typechain'

declare module 'mocha' {
  export interface Context {
    // Facoriries for contracts
    contract: SCNFTDrop
    factory: SCNFTDrop__factory
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
