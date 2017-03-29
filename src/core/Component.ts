import { createElement } from './dom'

export default class Component {
  protected _$element: HTMLElement|null
  private _$parent: HTMLElement|null

  protected _$references: {[name:string]: HTMLElement}

  constructor(type: string = 'div', className: string = '', template: string = '') {
    this._$element = createElement(type, className)
    this._$parent = null

    this._$element.innerHTML = template

    this._$references = {}

    const $refs = this._$element.querySelectorAll('[ref]')
    
    for (let i = 0; i < $refs.length; ++i) {
      const $ref = $refs[i]

      this._$references[$ref.getAttribute('ref')] = $ref as HTMLElement

      $ref.removeAttribute('ref')
    }
  }

  public enter() {
  }

  public leave() {
  }

  public mount($element: HTMLElement) {
    $element.appendChild(this._$element)

    this._$parent = $element
  }

  public unmount() {
    if (!this._$parent) {
      return
    }

    this._$parent.removeChild(this._$element)

    this._$parent = null
  }

  public getElement(): HTMLElement {
    return this._$element
  }

  public dispose() {
    this.unmount()
  }
}
