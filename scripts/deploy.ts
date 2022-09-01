import { ethers, run } from 'hardhat'
import prompt from 'prompt'

async function main() {
  const [deployer] = await ethers.getSigners()

  // Deploy the contract
  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())

  const provider = ethers.provider
  const { chainId } = await provider.getNetwork()
  const chains = {
    1: 'mainnet',
    3: 'ropsten',
    4: 'rinkeby',
    5: 'goerli',
    137: 'polygon',
    80001: 'mumbai',
  } as { [chainId: number]: string }
  const chainName = chains[chainId]

  const { name, symbol } = await prompt.get({
    properties: {
      name: {
        required: true,
        type: 'string',
        message: 'Contract name',
        default: 'BWLDrop2',
      },
      symbol: {
        required: true,
        type: 'string',
        message: 'Contract symbol',
        default: 'BWLD2',
      },
    },
  })

  const contractName = 'BWLDrop'
  console.log(`Deploying ${contractName}...`)
  const factory = await ethers.getContractFactory(contractName)
  const contract = await factory.deploy(name, symbol)

  console.log('Deploy tx gas price:', contract.deployTransaction.gasPrice)
  console.log('Deploy tx gas limit:', contract.deployTransaction.gasLimit)
  await contract.deployed()
  const address = contract.address

  console.log('Contract deployed to:', address)
  console.log('Wait for 1 minute to make sure blockchain is updated')
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000))

  // Try to verify the contract on Etherscan
  console.log('Verifying contract on Etherscan')
  try {
    await run('verify:verify', {
      address,
      constructorArguments: [name, symbol],
    })
  } catch (err) {
    console.log(
      'Error verifiying contract on Etherscan:',
      err instanceof Error ? err.message : err
    )
  }

  // Print out the information
  console.log(`${contractName} deployed and verified on Etherscan!`)
  console.log('Contract address:', address)
  console.log(
    'Etherscan URL:',
    `https://${
      chainName !== 'polygon' ? `${chainName}.` : ''
    }polygonscan.com/address/${address}`
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
