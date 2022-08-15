import { ethers } from 'hardhat'
import { expect } from 'chai'
import { getBatchOfAddresses, prepareAllBatches } from '../src'
import holders from '../src/verifiedHolders'

const BASE_URI = 'example.com'

describe('SCNikitaAppreciatesYou contract tests', () => {
  before(async function () {
    this.accounts = await ethers.getSigners()
    this.owner = this.accounts[0]
    this.user = this.accounts[1]
    this.name = 'SCNikitaAppreciatesYou'
    this.symbol = 'SCNAY'
    this.factory = await ethers.getContractFactory('SCNikitaAppreciatesYou')
  })

  describe('Constructor', function () {
    beforeEach(async function () {
      this.contract = await this.factory.deploy(BASE_URI)
      await this.contract.deployed()
    })
    it('should deploy the contract with the correct fields', async function () {
      expect(await this.contract.name()).to.equal(this.name)
      expect(await this.contract.symbol()).to.equal(this.symbol)
      expect(await this.contract.baseTokenURI()).to.equal(BASE_URI)
    })
  })
  describe('Owner-only calls from non-owner', function () {
    beforeEach(async function () {
      this.contract = await this.factory.deploy(BASE_URI)
      await this.contract.deployed()

      this.contractWithIncorrectOwner = this.contract.connect(this.user)
    })
    it('should have the correct owner', async function () {
      expect(await this.contract.owner()).to.equal(this.owner.address)
    })
    it('should not be able to call setBaseURI', async function () {
      await expect(
        this.contractWithIncorrectOwner.setBaseURI(BASE_URI)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('should not be able to call mint', async function () {
      const addresses = getBatchOfAddresses(0, 500)

      await expect(
        this.contractWithIncorrectOwner.mint(addresses)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })
  describe('Contract', function () {
    beforeEach(async function () {
      this.contract = await this.factory.deploy(BASE_URI)
      await this.contract.deployed()
    })
    it('should mint one batch', async function () {
      const addresses = getBatchOfAddresses(0, 500)
      const tx = await this.contract.mint(addresses)
      const receipt = await tx.wait()

      expect(receipt.gasUsed).to.be.below(30000000)

      for (const address of addresses) {
        expect(await this.contract.balanceOf(address)).to.equal(1)
      }
    })
    it('should mint all batches', async function () {
      const batches = prepareAllBatches()
      for (const batch of batches) {
        const tx = await this.contract.mint(batch)
        const receipt = await tx.wait()
        expect(receipt.gasUsed).to.be.below(30000000)
      }

      for (const [i, address] of holders.entries()) {
        console.log(address, i, await this.contract.balanceOf(address))
        expect(await this.contract.balanceOf(address)).to.equal(1)
      }
    })
  })
})
