export interface Strategy<T = any> {
  match: RegExp | ((text: string) => RegExpMatchArray | null)
  search: (term: string, callback: (results: T[]) => null, match: RegExpMatchArray) => void
  replace: ((data: T) => string[] | string | null)
  cache?: boolean
  context?: () => boolean
  template?: (data: T, term?: string) => string
  index?: number
  id?: string
}
