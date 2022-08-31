import { ethers } from 'hardhat'
import { prepareAllBatches } from '../src/index'
import prompt from 'prompt'

async function main() {
  const { contractAddress, tokenId } = await prompt.get({
    properties: {
      contractAddress: {
        required: true,
        type: 'string',
        message: 'Contract address',
        default: '0x32b6ca2af210f9422a262ff20e42331eaa92dfae',
      },
      tokenId: {
        required: true,
        type: 'number',
        message: 'Token ID',
        default: 1,
      },
    },
  })

  const factory = await ethers.getContractFactory('BWLDrop')
  const contract = await factory.attach(contractAddress)
  const batches = prepareAllBatches()

  console.log('Total batches: ', batches.length)

  for (const [i, batch] of batches.entries()) {
    console.log(`Minting batch ${i}`)
    try {
      const tx = await contract.mintBatch(
        batch.map(([address]) => address),
        tokenId,
        batch.map(([, amount]) => amount),
        {
          gasPrice: 50000000000,
        }
      )
      const receipt = await tx.wait()
      console.log(
        `Batch ${i} minted `,
        `https://polygonscan.com/tx/${receipt.transactionHash}`
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
