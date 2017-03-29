import { TweenMax } from 'gsap'

import Component from '../../core/Component'
import { createElement } from '../../core/dom'

const template = require<string>('./Loader.html')
const styles = require<{[name:string]: string}>('./Loader.css')

export default class Loader extends Component {
  private _$title: HTMLElement

  constructor() {
    super('div', styles.loader, `
      <h1 class="${styles.title}">Hello, World</h1>
    `)
  }

  public enter(done?: () => any) {
    TweenMax.from(this._$element, 1, {
      opacity: 0,
      onComplete: done
    })
  }

  public leave(done?: () => any) {
    TweenMax.to(this._$element, 1, {
      opacity: 0,
      onComplete: done
    } as any)
  }

  dispose() {
    super.dispose()
  }
}