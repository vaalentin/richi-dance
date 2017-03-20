type callback = (any) => void;
type type = string|number;

export default class EventDispatcher {
  private _listeners: {[name: string]: callback[]}

  constructor() {
    this._listeners = {}
  }

  public addEventListener(type: type, callback: callback) {
    if (!this._listeners[type]) {
      this._listeners[type] = []
    }

    const i = this._listeners[type].indexOf(callback)

    if (i !== -1) {
      return
    }

    this._listeners[type].push(callback)
  }

  public removeEventListener(type: type, callback: callback) {
    if (!this._listeners[type]) {
      return
    }

    const i = this._listeners[type].indexOf(callback)

    if (i === -1) {
      return
    }

    this._listeners[type].splice(i, 1)
  }

  public dispatchEvent(type: type, data?: any) {
    if (!this._listeners[type]) {
      return
    }

    for (let callback of this._listeners[type]) {
      callback(data);
    }
  }

  public dispose() {
    this._listeners = null
  }
}