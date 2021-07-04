export enum Rarity {
  mythic = "mythic",
  legendary = "legendary",
  epic = "epic",
  rare = "rare"
}
export interface CarStats {
  speed: number
  acceleration: number
  braking: number
  handling: number
  aerodynamics: number
}
export interface Car {
  _id?: string
  tokenId?: number
  rarity: Rarity
  model: string
  color: string
  stats: CarStats
  customPlate: string | null
  vinyls: any[]
}
