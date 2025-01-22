type Listener<T = any> = (...args: T[]) => void

export class EventBus {
  private events: Record<string, Listener[]> = {}
  constructor() {}

  on(eventName: string, listener: Listener) {
    const events = (this.events[eventName] ||= [])
    events.push(listener)
  }

  off(eventName: string, listener: Listener) {
    if (!this.events[eventName]) return
    this.events[eventName] = this.events[eventName].filter(l => l !== listener)
  }

  once(eventName: string, listener: Listener) {
    const wrapper = (...args: any[]) => {
      listener(...args)
      this.off(eventName, wrapper)
    }
    this.on(eventName, wrapper)
  }

  emit(eventName: string, ...args: any[]) {
    if (!this.events[eventName]) return
    this.events[eventName].forEach(listener => listener(...args))
  }
}
