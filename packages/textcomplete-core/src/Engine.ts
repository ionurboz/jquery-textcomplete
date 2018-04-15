import { EventEmitter } from "eventemitter3"

import { Strategy } from "./Strategy"

export class Engine extends EventEmitter {
  private strategies: Strategy[]

  constructor() {
    super()
    this.strategies = []
  }

  public destroy() {}

  public register(strategies: Strategy[]) {
    this.strategies = this.strategies.concat(strategies)
  }

  public run(text: string) {
    console.log(text)
  }
}
