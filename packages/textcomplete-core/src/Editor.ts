import { EventEmitter } from "eventemitter3"

import { SearchResult } from "./SearchResult"

export interface EditorCursorOffset {
  lineHeight: number
  top: number
  left?: number
  right?: number
}

export abstract class Editor extends EventEmitter {
  public abstract applySearchResult(result: SearchResult): void
  public abstract getCursorOffset(): EditorCursorOffset
}
