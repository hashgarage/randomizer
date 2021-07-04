import { DISTRIBUTION_BY_RARITY, GROUP_SIZE } from "./constants";
import shuffle from 'knuth-shuffle-seeded'
import { DAO } from "./DAO";
import { Car, Rarity } from "./models";

function countByRarity(cars: Car[]) {
  return cars.reduce((count, car) => {
    count[car.rarity] = (count[car.rarity] ?? 0) + 1
    return count
  }, {} as Record<string, number>)
}

function countMissing(record: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(DISTRIBUTION_BY_RARITY).map(([rarity, maxCount]) => [rarity, maxCount - (record[rarity] ?? 0)])
  )
}

async function getSampleOfAvailablesByRarity(rarity: Rarity, sampleSize: number, seed: any) {
  const allAvailable = await DAO.availables.getByRarity(rarity)
  const shuffled = shuffle(allAvailable, seed) as Car[]
  return shuffled.slice(0, sampleSize)
}

export async function buildGroup(groupNumber: number, seed: any) {
  const lowerLimit = groupNumber * GROUP_SIZE + 1
  const currentlyOnGroup = await DAO.revealed.findWithTokenId({ from: lowerLimit })
  const currentCount = countByRarity(currentlyOnGroup)
  const missingCount = countMissing(currentCount)
  
  const samples = await Promise.all(
    Object.entries(missingCount).map(async ([rarity, missing]) => {
      return getSampleOfAvailablesByRarity(rarity as Rarity, missing, seed)
    })
  )
  return shuffle(samples.flat(), seed) as Car[]
}

export function getGroupNumbers(start: number, finish: number) {
  const diff = finish - start
  if (diff <= -1) {
    return []
  }
  const startGroupNumber = Math.floor((start - 1) / GROUP_SIZE)
  const finishGroupNumber = Math.floor((finish - 1) / GROUP_SIZE)
  const groupCount = finishGroupNumber - startGroupNumber + 1
  return Array(groupCount).fill(0).map((_, i) => {
    const groupNumber = i + startGroupNumber
    const groupStart = i ? groupNumber * GROUP_SIZE + 1 : start % GROUP_SIZE
    const groupEnd = i === groupCount - 1 ? finish : (groupNumber + 1) * GROUP_SIZE

    return {
      number: groupNumber,
      first: groupStart,
      last: groupEnd,
      length: groupEnd - groupStart + 1
    }
  })
}
