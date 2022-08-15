import holders from './verifiedHolders'

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
