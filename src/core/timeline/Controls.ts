import EventDispatcher from '../EventDispatcher'
import { createElement, appendChild } from '../../core/dom'

export const CONTROLS_TOGGLE = 0
export const CONTROLS_CLEAR = 1
export const CONTROLS_TOGGLE_CURVES = 2
export const CONTROLS_SPEED_CHANGE = 3
export const CONTROLS_BOUNDARIES_CHANGE = 4

export default class Controls extends EventDispatcher {
  private _$element: HTMLElement

  private _$toggleButton: HTMLInputElement
  private _$clearButton: HTMLInputElement
  private _$curvesButton: HTMLInputElement
  private _$speedInput: HTMLInputElement
  private _$fromInput: HTMLInputElement
  private _$toInput: HTMLInputElement

  constructor($element: HTMLElement) {
    super()

    this._$element = $element

    this._createElements()
    this._bindMethods()
    this._addListeners()
  }

  private _createElements() {
    this._$toggleButton = createElement('input', null, {
      name: 'toggle',
      type: 'button',
      value: 'Toggle'
    }) as HTMLInputElement

    this._$element.appendChild(this._$toggleButton)

    this._$clearButton = createElement('input', null, {
      name: 'clear',
      type: 'button',
      value: 'Clear'
    }) as HTMLInputElement

    this._$element.appendChild(this._$clearButton)

    this._$curvesButton = createElement('input', null, {
      name: 'curves',
      type: 'button',
      value: 'Toggle curves'
    }) as HTMLInputElement

    this._$element.appendChild(this._$curvesButton)

    this._$speedInput = createElement('input', null, {
      name: 'speed',
      type: 'number',
      min: '0.1',
      max: '10',
      value: '1'
    }) as HTMLInputElement

    this._$element.appendChild(this._$speedInput)

    this._$fromInput = createElement('input', null, {
      name: 'from',
      type: 'number',
      value: '0'
    }) as HTMLInputElement

    this._$element.appendChild(this._$fromInput)

    this._$toInput = createElement('input', null, {
      name: 'to',
      type: 'number',
      value: '10'
    }) as HTMLInputElement

    this._$element.appendChild(this._$toInput)
  }

  private _bindMethods() {
    this._handleToggle = this._handleToggle.bind(this)
    this._handleClear = this._handleClear.bind(this)
    this._handleToggleCurves = this._handleToggleCurves.bind(this)
    this._handleSpeedChange = this._handleSpeedChange.bind(this)
    this._handleBoundariesChange = this._handleBoundariesChange.bind(this)
  }

  private _addListeners() {
    this._$toggleButton.addEventListener('click', this._handleToggle)
    this._$clearButton.addEventListener('click', this._handleClear)
    this._$curvesButton.addEventListener('click', this._handleToggleCurves)
    this._$speedInput.addEventListener('input', this._handleSpeedChange)
    this._$fromInput.addEventListener('input', this._handleBoundariesChange)
    this._$toInput.addEventListener('input', this._handleBoundariesChange)
  }

  private _removeListeners() {
    this._$toggleButton.removeEventListener('click', this._handleToggle)
    this._$clearButton.removeEventListener('click', this._handleClear)
    this._$curvesButton.removeEventListener('click', this._handleToggleCurves)
    this._$speedInput.removeEventListener('input', this._handleSpeedChange)
    this._$fromInput.removeEventListener('input', this._handleBoundariesChange)
    this._$toInput.removeEventListener('input', this._handleBoundariesChange)
  }

  private _handleToggle() {
    this.dispatchEvent(CONTROLS_TOGGLE)
  }

  private _handleClear() {
    this.dispatchEvent(CONTROLS_CLEAR)
  }

  private _handleToggleCurves() {
    this.dispatchEvent(CONTROLS_TOGGLE_CURVES)
  }

  private _handleSpeedChange() {
    const speed = parseFloat(this._$speedInput.value)
    
    this.dispatchEvent(CONTROLS_SPEED_CHANGE, speed)
  }

  private _handleBoundariesChange() {
    const from = parseFloat(this._$fromInput.value)
    let to = parseFloat(this._$toInput.value)

    if (to <= from) {
      to = from + 1
      this._$toInput.value = to.toString()
    }

    this.dispatchEvent(CONTROLS_BOUNDARIES_CHANGE, [from, to])
  }

  dispose() {
    this._removeListeners()

    super.dispose()
  }
}