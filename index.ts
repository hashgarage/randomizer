import { DAO } from "./DAO"
import { buildGroup, getGroupNumbers } from "./groups"
import { Car, Rarity } from "./models"
import shuffle from 'knuth-shuffle-seeded'
import { getLastMintedBeforeTimestamp } from "./minted"
import { getPreviousReveals, saveReveal, saveRevealed } from "./api"

async function revealGroups(seed: string, lastMinted: number) {
  const firstNewlyMinted = await DAO.revealed.count() + 1
  const groups = getGroupNumbers(firstNewlyMinted, lastMinted)
  
  for (const [i, group] of groups.entries()) {
    const availablesInGroup = await buildGroup(group.number, seed + i)
    console.log(`Revealing ${group.length} cars!!`)
    const revealedInGroup = availablesInGroup.slice(0, group.length).map((car, i) => ({ tokenId: group.first + i, ...car }) as Car)
    await DAO.availables.remove(revealedInGroup)
    await DAO.revealed.insert(revealedInGroup)
    await saveRevealed(revealedInGroup)
  }
}

async function reveal100Rares(seed: string) {
  const amount = 100
  const availables = await DAO.availables.getByRarity(Rarity.rare)
  const shuffled: Car[] = shuffle([...availables], seed)
  console.log(`Revealing ${amount} cars!!`)
  const revealed = shuffled.slice(0, amount).map((car, i) => ({ tokenId: 1 + i, ...car }) as Car)
  await DAO.availables.remove(revealed)
  await DAO.revealed.insert(revealed)
  await saveRevealed(revealed)
}

async function reveal(timestamp: string) {
  const numberOfRevealed = await DAO.revealed.count()
  const lastMinted = await getLastMintedBeforeTimestamp(timestamp)
  const seed = lastMinted.blockHash
  const lastMintedId = parseInt(lastMinted.tokenID, 10)
  console.log(`The last car minted was #${lastMintedId}`)
  if (numberOfRevealed === 0) {
    await reveal100Rares(seed)
  }
  await revealGroups(seed, lastMintedId)
  return lastMinted
}

async function runPreviousReveals() {
  const numberOfRevealed = await DAO.revealed.count()
  if (numberOfRevealed === 0) {
    const prevReveals = await getPreviousReveals()
    for (const rev of prevReveals) {
      await reveal(rev.timestamp)
    }
  }
}

async function main() {
  await runPreviousReveals()
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const lastMinted = await reveal(timestamp)
  await saveReveal(timestamp, {
    timeStamp: lastMinted.timeStamp,
    blockHash: lastMinted.blockHash,
    from: lastMinted.from,
    tokenID: lastMinted.tokenID
  })
}
main()
