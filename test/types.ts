import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'

import type {
  SCNikitaAppreciatesYou,
  SCNikitaAppreciatesYou__factory,
} from '../typechain'

declare module 'mocha' {
  export interface Context {
    // Facoriries for contracts
    contract: SCNikitaAppreciatesYou
    factory: SCNikitaAppreciatesYou__factory
    // Contract metadata
    name: string
    symbol: string
    // Signers
    accounts: SignerWithAddress[]
    owner: SignerWithAddress
    user: SignerWithAddress
  }
}
