import { cwd } from 'process'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const holders = (
  Object.entries(
    JSON.parse(readFileSync(resolve(cwd(), 'src', 'holders_1.json'), 'utf8'))
  ).sort((a, b) => Number(b[1]) - Number(a[1])) as [string, number][]
).map(([address, amount]) => [
  address,
  Math.floor(amount * 1000000000000000000),
]) as [string, number][]
console.log('Holders:', holders.length)

export function getBatchOfAddresses(start: number, end: number) {
  return holders.slice(start, end)
}

export function prepareAllBatches() {
  const batchStep = 500
  const batches = [] as [string, number][][]
  for (let i = 0; i < holders.length; i += batchStep) {
    const batch = getBatchOfAddresses(i, i + batchStep)
    batches.push(batch)
  }
  return batches
}
