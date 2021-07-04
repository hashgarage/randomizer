import Datastore from 'nedb-promises'
import { Car, Rarity } from './models'

const availablesDB = Datastore.create('./dbs/availables.json')
const revealedDB = Datastore.create('./dbs/revealed.json')

const availables = {
  save(car: Car) {
    if (car._id !== undefined) {
      return availablesDB.insert(car)
    }
    return availablesDB.update({ _id: car._id }, car)
  },
  async getAll() {
    const all: Car[] = await availablesDB.find({})
    return all
  },
  async getByRarity(rarity: Rarity) {
    const cars: Car[] = await availablesDB.find({ rarity })
    return cars
  },
  async remove(cars: Car[]) {
    const ids = cars.map(c => c._id)
    return availablesDB.remove({ _id: { $in: ids } }, { multi: true })
  }
}

const revealed = {
  insert(cars: Car[]) {
    return revealedDB.insert(cars)
  },
  async getAll() {
    const all: Car[] = await revealedDB.find({})
    return all
  },
  async findWithTokenId({ from, to }: { from?: number, to?: number } = {}) {
    const query: { tokenId?: Record<string, any> } = {}
    if (from) {
      query.tokenId = query.tokenId ?? {}
      query.tokenId.$gte = from
    }
    if (to) {
      query.tokenId = query.tokenId ?? {}
      query.tokenId.$lte = to
    }
    const results: Car[] = await revealedDB.find(query)
    return results
  },
  async count() {
    return revealedDB.count({})
  }
}

export const DAO = {
  availables,
  revealed
}
