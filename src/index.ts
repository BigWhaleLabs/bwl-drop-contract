import { cwd } from 'process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const holdersWithDuplicates = readFileSync(
  resolve(cwd(), 'src/holders.txt'),
  'utf8'
)
  .split('\n')
  .filter((v) => !!v)
console.log('Holders with duplicates:', holdersWithDuplicates.length)
export const holders = Object.keys(
  holdersWithDuplicates.reduce(
    (acc, v) => ({
      ...acc,
      [v]: true,
    }),
    {} as { [key: string]: boolean }
  )
)
console.log('Holders:', holders.length)

export function getBatchOfAddresses(start: number, end: number): string[] {
  return holders.slice(start, end)
}

export function prepareAllBatches() {
  const batchStep = 500
  const batches = [] as string[][]
  for (let i = 0; i < holders.length; i += batchStep) {
    const batch = getBatchOfAddresses(i, i + batchStep)
    batches.push(batch)
  }
  return batches
}
