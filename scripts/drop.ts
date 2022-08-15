import { ethers } from 'hardhat'
import { prepareAllBatches } from '../src/index'
import prompt from 'prompt'

async function main() {
  const { contractAddress } = await prompt.get({
    properties: {
      contractAddress: {
        required: true,
        type: 'string',
        message: 'Contract address',
      },
    },
  })

  const factory = await ethers.getContractFactory('SCNikitaAppreciatesYou')
  const contract = await factory.attach(contractAddress)
  const batches = prepareAllBatches()

  console.log('Total batches: ', batches.length)

  for (const [i, batch] of batches.entries()) {
    try {
      const tx = await contract.mint(batch)
      const receipt = await tx.wait()
      console.log(
        `Batch ${i} minted `,
        `https://$polygonscan.com/tx/${receipt.transactionHash}`
      )
    } catch (error) {
      console.log(`Batch ${i} minting failed: `, error)
    }
  }

  console.log('All batches minted')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
