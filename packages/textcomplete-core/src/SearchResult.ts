import { Strategy } from "./Strategy"

export interface SearchResult<T = any> {
  data: T
  term: string
  strategy: Strategy<T>
}
