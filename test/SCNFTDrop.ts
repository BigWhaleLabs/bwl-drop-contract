import { ethers } from 'hardhat'
import { expect } from 'chai'
import { getBatchOfAddresses, prepareAllBatches } from '../src'
import holders from '../src/verifiedHolders'

function constructURI(id: number): string {
  return `https://game.example/api/item/${id}.json`
}

describe('SCNFTDrop contract tests', () => {
  before(async function () {
    this.accounts = await ethers.getSigners()
    this.owner = this.accounts[0]
    this.user = this.accounts[1]
    this.tokenId = 0
    this.name = 'SCNFTDrop'
    this.symbol = 'SCNFT'
    this.factory = await ethers.getContractFactory('SCNFTDrop')
  })

  describe('Constructor', function () {
    beforeEach(async function () {
      this.contract = await this.factory.deploy(this.name, this.symbol)
      await this.contract.deployed()
    })
    it('should deploy the contract with the correct fields', async function () {
      expect(await this.contract.name()).to.equal(this.name)
      expect(await this.contract.symbol()).to.equal(this.symbol)
    })
  })
  describe('Owner-only calls from non-owner', function () {
    beforeEach(async function () {
      this.contract = await this.factory.deploy(this.name, this.symbol)
      await this.contract.deployed()

      this.contractWithIncorrectOwner = this.contract.connect(this.user)
    })
    it('should not be able to call setURI', async function () {
      const tokenId = 1
      const newURI = constructURI(tokenId)
      await expect(
        this.contractWithIncorrectOwner.setURI(tokenId, newURI)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('should not be able to call mint', async function () {
      const addresses = getBatchOfAddresses(0, 500)

      await expect(
        this.contractWithIncorrectOwner.mint(addresses, this.tokenId, 1)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
  describe('Contract', function () {
    beforeEach(async function () {
      this.contract = await this.factory.deploy(this.name, this.symbol)
      await this.contract.deployed()
    })
    it('should have the correct owner', async function () {
      expect(await this.contract.owner()).to.equal(this.owner.address)
    })
    it('should be able to call setURI', async function () {
      const tokenId = 1
      const newURI = constructURI(tokenId)

      await this.contract.setURI(tokenId, newURI)

      expect(await this.contract.tokenURI(tokenId)).to.equal(newURI)
    })
    it('should mint one batch', async function () {
      const addresses = getBatchOfAddresses(0, 500)
      const tx = await this.contract.mint(addresses, this.tokenId, 1)
      const receipt = await tx.wait()

      expect(receipt.gasUsed).to.be.below(30000000)

      for (const address of addresses) {
        expect(await this.contract.balanceOf(address, this.tokenId)).to.equal(1)
      }
      console.log(await this.contract.uri(0))
    })
    it('should mint all batches', async function () {
      const batches = prepareAllBatches()

      for (const batch of batches) {
        const tx = await this.contract.mint(batch, this.tokenId, 1)
        const receipt = await tx.wait()
        expect(receipt.gasUsed).to.be.below(30000000)
      }

      for (const [i, address] of holders.entries()) {
        if (i % 1000 === 0) {
          console.log(
            address,
            i,
            await this.contract.balanceOf(address, this.tokenId)
          )
        }
        expect(await this.contract.balanceOf(address, this.tokenId)).to.equal(1)
      }
    })
  })
})
