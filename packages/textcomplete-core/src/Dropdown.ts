import { EventEmitter } from "eventemitter3"

import { SearchResult } from "./SearchResult"
import { EditorCursorOffset } from "./Editor"

export interface DropdownOptions {
  className?: string
  footer?: ((results: any[]) => string) | string
  header?: ((results: any[]) => string) | string
  maxCount?: number
  placement?: "top" | "bottom"
  rotate?: boolean
  style?: Record<string, string>
  item?: {
    className?: string
  }
}

class DropdownRenderer {
  public el: HTMLUListElement

  private itemClassName: string
  private footer: (results: any[]) => string
  private header: (results: any[]) => string

  constructor({ footer, header, style, item }: DropdownOptions) {
    this.el = document.createElement("ul")
    this.footer = typeof footer === "function" ? footer : () => footer || ""
    this.header = typeof header === "function" ? header : () => header || ""
    this.itemClassName = (item && item.className) || "textcomplete-item"
    this.initializeEl(style)
  }

  public destroy() {
    this.clear()
  }

  public render(searchResults: SearchResult[]): this {
    const rawResults = searchResults.map(searchResult => searchResult.data)

    const headerEl = this.el.firstChild as HTMLLIElement
    headerEl.innerHTML = this.header(rawResults)
    const footerEl = this.el.lastChild as HTMLLIElement
    footerEl.innerHTML = this.footer(rawResults)

    const fragment = document.createDocumentFragment()
    fragment.appendChild(headerEl)
    for (const searchResult of searchResults) {
      const li = document.createElement("li")
      li.className = this.itemClassName
      const a = document.createElement("a")
      a.innerHTML = this.renderResult(searchResult)
      li.appendChild(a)
      fragment.appendChild(li)
    }
    fragment.appendChild(footerEl)

    this.clear()
    this.el.appendChild(fragment)
    return this
  }

  public setOffset(offset: EditorCursorOffset): this {
    console.log(offset)
    return this
  }

  public activate(next: number | null, prev: number | null) {
    if (next === prev) {
      return
    }
    if (next) {
      this.el.children[next + 1].classList.add("active")
    }
    if (prev) {
      this.el.children[prev + 1].classList.remove("active")
    }
  }

  private renderResult(searchResult: SearchResult): string {
    return searchResult.strategy.template
      ? searchResult.strategy.template(searchResult.data, searchResult.term)
      : searchResult.data
  }

  private initializeEl(styleOption?: Record<string, string>): void {
    const style = {
      display: "none",
      posiiton: "absolute",
      zIndex: "1000",
      ...styleOption
    }
    Object.keys(style).forEach(name => ((this.el.style as any)[name] = (style as any)[name]))
    // Make sure that there are header and footer elements.
    for (const key of ["header", "footer"]) {
      const li = document.createElement("li")
      li.className = `textcomplete-${key}`
      this.el.appendChild(li)
    }
  }

  private clear() {
    while (this.el.lastChild) {
      this.el.removeChild(this.el.lastChild)
    }
  }
}

export class Dropdown extends EventEmitter {
  public shown: boolean
  public el: HTMLUListElement

  private activeIndex: number | null
  private searchResults: SearchResult[]
  private maxCount: number
  private renderer: DropdownRenderer

  constructor(public options: DropdownOptions) {
    super()

    this.activeIndex = null
    this.shown = false
    this.searchResults = []
    this.maxCount = options.maxCount || 10
    this.renderer = new DropdownRenderer(options)
    this.el = this.renderer.el

    this.handleClick = this.handleClick.bind(this)
    this.handleMouseover = this.handleMouseover.bind(this)

    this.startListening()
  }

  public destroy(): this {
    this.stopListening()
    this.renderer.destroy()
    this.searchResults = []
    return this
  }

  public deactivate() {
    this.hide()
  }

  public render<T>(searchResults: SearchResult<T>[], offset: EditorCursorOffset): this {
    if (searchResults.length) {
      const renderEvent = new CustomEvent("render", {
        cancelable: true
      })
      this.emit("render", renderEvent)
      if (renderEvent.defaultPrevented) {
        return this
      }
      this.searchResults = this.maxCount ? searchResults.slice(0, this.maxCount) : searchResults
      this.renderer.render(this.searchResults).setOffset(offset)
      this.emit("rendered", new CustomEvent("rendered"))
      this.show()
    } else {
      this.deactivate()
    }
    this.setActiveIndex(null)
    return this
  }

  public up(event: CustomEvent<{ code: "UP" }>): this {
    console.log(event)
    return this
  }

  public down(event: CustomEvent<{ code: "DOWN" }>): this {
    console.log(event)
    return this
  }

  /** Select current active item. */
  public select(): boolean {
    return false
  }

  private startListening() {
    this.el.addEventListener("mousedown", this.handleClick)
    this.el.addEventListener("mouseover", this.handleMouseover)
    this.el.addEventListener("touchstart", this.handleClick)
  }

  private stopListening() {
    this.el.removeEventListener("mousedown", this.handleClick)
    this.el.removeEventListener("mouseover", this.handleMouseover)
    this.el.removeEventListener("touchstart", this.handleClick)
  }

  private setActiveIndex(next: number | null) {
    const prev = this.activeIndex
    this.activeIndex = next
    if (next) {
      this.renderer.activate(next, prev)
    }
  }

  /** Show the element */
  private show(): this {
    if (!this.shown) {
      const showEvent = new CustomEvent("show", { cancelable: true })
      this.emit("show", showEvent)
      if (showEvent.defaultPrevented) {
        return this
      }
      this.el.style.display = "block"
      this.shown = true
      this.emit("shown", new CustomEvent("shown"))
    }
    return this
  }

  /** Hide the element */
  private hide(): this {
    if (this.shown) {
      const hideEvent = new CustomEvent("hide", { cancelable: true })
      this.emit("hide", hideEvent)
      if (hideEvent.defaultPrevented) {
        return this
      }
      this.el.style.display = "none"
      this.shown = false
      this.emit("hidden", new CustomEvent("hidden"))
    }
    return this
  }

  private handleClick(event: Event) {
    const index = this.getResultIndex(event.target as Element)
  }

  private handleMouseover(event: Event) {
    // Since this.handleMouseover() is added to this.el, we can assume that
    // target is a descendant of this.el element.
    const index = this.getResultIndex(event.target as Element)
    if (index !== -1) {
      this.setActiveIndex(index)
    }
  }

  /**
   * @param el a descendant of this.el element.
   * @return index of corresponding result. returns -1 if the el is a descendant of header or footer.
   */
  private getResultIndex(el: Element): number {
    while (el.parentElement !== this.el) {
      el = el.parentElement as Element
    }
    let index = 0
    // tslint:disable-next-line:no-conditional-assignment
    for (; el = el.previousElementSibling as any; index++) {}
    return index === this.el.childElementCount - 1 ? -1 : index - 1
  }
}
