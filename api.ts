import axios from "axios"
import { Car } from "./models"

export interface Block {
  from: string
  timeStamp: string
  tokenID: string
  blockHash: string
}

export interface Reveal {
  timestamp: string
  block: Block
}

export function saveRevealed(cars: Car[]) {
  try {
    const secret: string = require('./secret.json').secret
    return axios.post('https://hashgarage.com/api/metadata/cars', { secret, cars })    
  } catch (error) {
    return Promise.resolve()
  }
}

export function saveReveal(timestamp: string, block: Block) {
  try {
    const secret: string = require('./secret.json').secret
    return axios.post('https://hashgarage.com/api/metadata/reveals', { secret, reveal: { timestamp, block } })
  } catch (error) {
    return Promise.resolve()
  }
}

export async function getPreviousReveals() {
  try {
    const { data } = await axios.get('https://hashgarage.com/api/metadata/reveals')
    return data.list as Reveal[]
  } catch (error) {
    return []
  }
}