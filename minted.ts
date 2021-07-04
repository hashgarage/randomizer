import axios from "axios";
import { Block } from "./api";

const nullAddress = '0x0000000000000000000000000000000000000000'

export async function getLastMintedBeforeTimestamp(timestamp: string) {
  const { data } = await axios.get('https://api.etherscan.io/api?module=account&action=tokennfttx&contractaddress=0x747b1606da0adf2a00c3fba0204b0ea6f2047244&tag=latest&sort=desc')
  const list: Block[] = data?.result || []
  return list.find(item => item.from === nullAddress && item.timeStamp <= timestamp)
}