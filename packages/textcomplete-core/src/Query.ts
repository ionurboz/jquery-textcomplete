import { Strategy } from "./Strategy"

export interface Query<T> {
  match: RegExpMatchArray
  strategy: Strategy<T>
  term: string
}
