import Timeline from './Timeline'
import { createElement } from '../dom'

export default class TimelineScrubber {
  private _timeline: Timeline

  private _$element: HTMLElement

  private _$canvas: HTMLCanvasElement
  private _context: CanvasRenderingContext2D

  private _boundaries: [number, number]
  private _boundariesInView: [number, number]

  constructor(timeline: Timeline, $element: HTMLElement) {
    this._timeline = timeline

    this._$element = $element

    this._$canvas = createElement('canvas') as HTMLCanvasElement
    this._$canvas.width = this._$element.offsetWidth
    this._$canvas.height = this._$element.offsetHeight
    this._context = this._$canvas.getContext('2d')

    this._$element.appendChild(this._$canvas)

    this._boundaries = this._timeline.getBoundaries()
    this._boundariesInView = this._boundaries

    this._bindMethods()
    this._addListeners()

    this._render()
  }

  private _bindMethods() {
    this._handleResize = this._handleResize.bind(this)
    this._handleMouseDown = this._handleMouseDown.bind(this)
    this._handleMouseMove = this._handleMouseMove.bind(this)
    this._handleMouseUp = this._handleMouseUp.bind(this)
  }

  private _addListeners() {
    window.addEventListener('resize', this._handleResize)
    this._$element.addEventListener('mousedown', this._handleMouseDown)
    this._$element.addEventListener('mousemove', this._handleMouseMove)
    this._$element.addEventListener('mouseup', this._handleMouseUp)
  }

  private _removeListeners() {
    window.removeEventListener('resize', this._handleResize)
    this._$element.removeEventListener('mousedown', this._handleMouseDown)
    this._$element.removeEventListener('mousemove', this._handleMouseMove)
    this._$element.removeEventListener('mouseup', this._handleMouseUp)
  }

  private _handleResize() {
    this._$canvas.width = this._$element.offsetWidth
    this._$canvas.height = this._$element.offsetHeight
  }

  private _handleMouseDown({ offsetX }: MouseEvent) {
  }

  private _handleMouseMove({ offsetX }: MouseEvent) {
  }

  private _handleMouseUp({ offsetX }: MouseEvent) {
  }

  private _render() {
    this._context.clearRect(0, 0, this._$canvas.width, this._$canvas.height)
  }

  public setBoundaries(from: number, to: number) {
    this._boundaries[0] = this._boundariesInView[0] = from
    this._boundaries[1] = this._boundariesInView[1] = to
  }

  dispose() {
    this._removeListeners()
  }
}