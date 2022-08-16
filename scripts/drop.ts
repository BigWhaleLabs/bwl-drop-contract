import { ethers } from 'hardhat'
import { prepareAllBatches } from '../src/index'
import prompt from 'prompt'

async function main() {
  const { contractAddress, tokenId, amount } = await prompt.get({
    properties: {
      contractAddress: {
        required: true,
        type: 'string',
        message: 'Contract address',
      },
      tokenId: {
        required: true,
        type: 'number',
        message: 'Token ID',
      },
      amount: {
        required: true,
        type: 'number',
        message: 'Amount',
      },
    },
  })

  const factory = await ethers.getContractFactory('BWLDrop')
  const contract = await factory.attach(contractAddress)
  const batches = prepareAllBatches()

  console.log('Total batches: ', batches.length)

  for (const [i, batch] of batches.entries()) {
    try {
      const tx = await contract.mint(batch, tokenId, amount)
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
