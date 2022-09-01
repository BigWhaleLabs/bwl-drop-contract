import { ethers } from 'hardhat'
import { expect } from 'chai'
import {
  getBatchOfAddresses,
  prepareAllBatches,
  prepareAllBatchesForMint,
} from '../src'
import { holders } from '../src/index'

function constructURI(id: number): string {
  return `https://game.example/api/item/${id}.json`
}

describe('BWLDrop contract tests', () => {
  before(async function () {
    this.accounts = await ethers.getSigners()
    this.owner = this.accounts[0]
    this.user = this.accounts[1]
    this.tokenId = 0
    this.name = 'BWLDrop'
    this.symbol = 'BWLD'
    this.factory = await ethers.getContractFactory('BWLDrop')
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
    it('should not be able to call "mint"', async function () {
      const batch = getBatchOfAddresses(0, 500)
      const serializedBatch = batch.map((pair) => pair[0])
      await expect(
        this.contractWithIncorrectOwner.mint(serializedBatch, this.tokenId, 1)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
    it('should not be able to call "mintBatch"', async function () {
      const batch = getBatchOfAddresses(0, 100)
      await expect(
        this.contractWithIncorrectOwner.mintBatch(
          batch.map(([address]) => address),
          new Array(batch.length).fill([1]),
          batch.map(([, amount]) => [amount])
        )
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
    it('should "mintBatch" with one batch', async function () {
      const batch = getBatchOfAddresses(0, 100)
      const tx = await this.contract.mintBatch(
        batch.map(([address]) => address),
        new Array(batch.length).fill([1]),
        batch.map(([, amount]) => [amount])
      )
      const receipt = await tx.wait()

      expect(receipt.gasUsed).to.be.below(30000000)

      for (let i = 0; i < batch.length; i++) {
        expect(await this.contract.balanceOf(batch[i][0], 1)).to.equal(
          batch[i][1]
        )
      }
    })
    it('should "mintBatch" all batch', async function () {
      // Mint 5 batches by 100 addresses with specific amounts
      const batches = prepareAllBatches().slice(0, 5)
      for (const batch of batches) {
        const tx = await this.contract.mintBatch(
          batch.map(([address]) => address),
          new Array(batch.length).fill([this.tokenId]),
          batch.map(([, amount]) => [amount])
        )
        const receipt = await tx.wait()
        expect(receipt.gasUsed).to.be.below(30000000)
      }
      for (const batch of batches) {
        for (const pair of batch) {
          expect(await this.contract.balanceOf(pair[0], this.tokenId)).to.equal(
            pair[1]
          )
        }
      }
    })
    it('should "mint" one batch', async function () {
      const batch = getBatchOfAddresses(0, 500)
      const serializedBatch = batch.map((pair) => pair[0])
      const tx = await this.contract.mint(serializedBatch, this.tokenId, 1)
      const receipt = await tx.wait()

      expect(receipt.gasUsed).to.be.below(30000000)

      for (const address of serializedBatch) {
        expect(await this.contract.balanceOf(address, this.tokenId)).to.equal(1)
      }
    })
    it('should "mint" all batches', async function () {
      // Mint 5 batches by 100 addresses
      const dropHolders = holders.slice(0, 500)
      const batches = prepareAllBatchesForMint().slice(0, 5)
      for (const batch of batches) {
        const tx = await this.contract.mint(batch, this.tokenId, 1)
        const receipt = await tx.wait()
        expect(receipt.gasUsed).to.be.below(30000000)
      }

      for (const [i, address] of dropHolders.entries()) {
        if (i % 100 === 0) {
          console.log(
            address,
            i / 100,
            (await this.contract.balanceOf(address[0], this.tokenId)).toString()
          )
        }
        expect(
          await this.contract.balanceOf(address[0], this.tokenId)
        ).to.equal(1)
      }
    })
  })
})
