import { EventEmitter } from "eventemitter3"

import { Dropdown, DropdownOptions } from "./Dropdown"
import { Editor } from "./Editor"
import { Engine } from "./Engine"
import { Strategy } from "./Strategy"
import { SearchResult } from "./SearchResult"

export interface TextcompleteOptions {
  dropdown?: DropdownOptions
}

export class Textcomplete extends EventEmitter {
  private dropdown: Dropdown
  private engine: Engine

  constructor(private editor: Editor, options: TextcompleteOptions) {
    super()
    this.dropdown = new Dropdown(options.dropdown || {})
    this.engine = new Engine()

    this.startListening()
  }

  public destroy() {
    this.dropdown.destroy()
    this.engine.destroy()
    this.stopListening()
    return this
  }

  public hide() {
    this.dropdown.deactivate()
    return this
  }

  public register(strategies: Strategy[]) {
    this.engine.register(strategies)
    return this
  }

  public trigger(text: string) {
    this.engine.run(text)
    return this
  }

  private startListening() {
    this.engine.on("hit", this.handleHit, this)
    this.dropdown.on("select", this.handleSelect, this)
    ;["show", "shown", "render", "rendered", "selected", "hidden", "hide"].forEach(eventName =>
      this.dropdown.on(eventName, (event: CustomEvent) => this.emit(eventName, event))
    )
    this.editor
      .on("move", this.handleMove, this)
      .on("enter", this.handleEnter, this)
      .on("esc", this.handleEsc, this)
      .on("change", this.handleChange, this)
  }

  private stopListening() {
    this.dropdown.removeAllListeners()
    this.engine.removeAllListeners()
    this.editor
      .removeListener("move", this.handleMove, this)
      .removeListener("enter", this.handleEnter, this)
      .removeListener("esc", this.handleEsc, this)
      .removeListener("change", this.handleChange, this)
  }

  private handleHit(results: SearchResult[]) {
    this.dropdown.render(results, this.editor.getCursorOffset())
  }

  private handleSelect(event: CustomEvent<{ searchResult: SearchResult }>) {
    this.emit("select", event)
    if (!event.defaultPrevented) {
      this.editor.applySearchResult(event.detail.searchResult)
    }
  }

  private handleMove(event: CustomEvent<{ code: "UP" | "DOWN" }>) {
    event.detail.code === "UP"
      ? this.dropdown.up(event as CustomEvent<{ code: "UP" }>)
      : this.dropdown.down(event as CustomEvent<{ code: "DOWN" }>)
  }

  private handleEnter(event: CustomEvent) {
    const selected = this.dropdown.select()
    if (selected) {
      event.preventDefault()
    } else {
      this.hide()
    }
  }

  private handleEsc(event: CustomEvent) {
    if (this.dropdown.shown) {
      this.hide()
      event.preventDefault()
    }
  }

  private handleChange(event: CustomEvent<{ beforeCursor: string }>) {
    this.trigger(event.detail.beforeCursor)
  }
}
