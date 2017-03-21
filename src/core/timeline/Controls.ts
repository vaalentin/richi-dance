import EventDispatcher from '../EventDispatcher'
import { createElement, appendChild } from '../../core/dom'

export const CONTROLS_TOGGLE = 0
export const CONTROLS_CLEAR = 1
export const CONTROLS_PLAY = 2
export const CONTROLS_PAUSE = 3
export const CONTROLS_TOGGLE_CURVES = 4
export const CONTROLS_SPEED_CHANGE = 5
export const CONTROLS_BOUNDARIES_CHANGE = 6
export const CONTROLS_TOGGLE_SNAP = 7
export const CONTROLS_SNAP_RESOLUTION_CHANGE = 8

export default class Controls extends EventDispatcher {
  private _$element: HTMLElement

  private _$toggleButton: HTMLInputElement
  private _$clearButton: HTMLInputElement
  private _$playButton: HTMLInputElement
  private _$pauseButton: HTMLInputElement
  private _$curvesButton: HTMLInputElement
  private _$speedInput: HTMLInputElement
  private _$fromInput: HTMLInputElement
  private _$toInput: HTMLInputElement
  private _$snapButton: HTMLInputElement
  private _$snapResolution: HTMLInputElement

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

    this._$playButton = createElement('input', null, {
      name: 'play',
      type: 'button',
      value: 'Play'
    }) as HTMLInputElement

    this._$element.appendChild(this._$playButton)

    this._$pauseButton = createElement('input', null, {
      name: 'pause',
      type: 'button',
      value: 'Pause'
    }) as HTMLInputElement

    this._$element.appendChild(this._$pauseButton)

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

    this._$snapButton = createElement('input', null, {
      name: 'snap',
      type: 'button',
      value: 'Toggle snap'
    }) as HTMLInputElement

    this._$element.appendChild(this._$snapButton)

    this._$snapResolution = createElement('input', null, {
      name: 'to',
      type: 'number',
      min: '1',
      max: '10',
      value: '1'
    }) as HTMLInputElement

    this._$element.appendChild(this._$snapResolution)
  }

  private _bindMethods() {
    this._handleToggle = this._handleToggle.bind(this)
    this._handleClear = this._handleClear.bind(this)
    this._handlePlay = this._handlePlay.bind(this)
    this._handlePause = this._handlePause.bind(this)
    this._handleToggleCurves = this._handleToggleCurves.bind(this)
    this._handleSpeedChange = this._handleSpeedChange.bind(this)
    this._handleBoundariesChange = this._handleBoundariesChange.bind(this)
    this._handleToggleSnap = this._handleToggleSnap.bind(this)
    this._handleSnapResolutionChange = this._handleSnapResolutionChange.bind(this)
  }

  private _addListeners() {
    this._$toggleButton.addEventListener('click', this._handleToggle)
    this._$clearButton.addEventListener('click', this._handleClear)
    this._$playButton.addEventListener('click', this._handlePlay)
    this._$pauseButton.addEventListener('click', this._handlePause)
    this._$curvesButton.addEventListener('click', this._handleToggleCurves)
    this._$speedInput.addEventListener('input', this._handleSpeedChange)
    this._$fromInput.addEventListener('input', this._handleBoundariesChange)
    this._$toInput.addEventListener('input', this._handleBoundariesChange)
    this._$snapButton.addEventListener('click', this._handleToggleSnap)
    this._$snapResolution.addEventListener('input', this._handleSnapResolutionChange)
  }

  private _removeListeners() {
    this._$toggleButton.removeEventListener('click', this._handleToggle)
    this._$clearButton.removeEventListener('click', this._handleClear)
    this._$playButton.removeEventListener('click', this._handlePlay)
    this._$pauseButton.removeEventListener('click', this._handlePause)
    this._$curvesButton.removeEventListener('click', this._handleToggleCurves)
    this._$speedInput.removeEventListener('input', this._handleSpeedChange)
    this._$fromInput.removeEventListener('input', this._handleBoundariesChange)
    this._$toInput.removeEventListener('input', this._handleBoundariesChange)
    this._$snapButton.removeEventListener('click', this._handleToggleSnap)
    this._$snapResolution.removeEventListener('input', this._handleSnapResolutionChange)
  }

  private _handleToggle() {
    this.dispatchEvent(CONTROLS_TOGGLE)
  }

  private _handleClear() {
    this.dispatchEvent(CONTROLS_CLEAR)
  }

  private _handlePlay() {
    this.dispatchEvent(CONTROLS_PLAY)
  }

  private _handlePause() {
    this.dispatchEvent(CONTROLS_PAUSE)
  }

  private _handleToggleCurves() {
    this.dispatchEvent(CONTROLS_TOGGLE_CURVES)
  }

  private _handleSpeedChange() {
    const speed = parseFloat(this._$speedInput.value)
    
    this.dispatchEvent(CONTROLS_SPEED_CHANGE, speed)
  }

  private _handleBoundariesChange() {
    let from = parseFloat(this._$fromInput.value)
    let to = parseFloat(this._$toInput.value)

    if (from < 0) {
      from = 0
      this._$fromInput.value = from.toString()
    }

    if (to <= from) {
      to = from + 1
      this._$toInput.value = to.toString()
    }

    this.dispatchEvent(CONTROLS_BOUNDARIES_CHANGE, [from, to])
  }

  private _handleToggleSnap() {
    this.dispatchEvent(CONTROLS_TOGGLE_SNAP)
  }

  private _handleSnapResolutionChange() {
    const resolution = Math.round(parseFloat(this._$snapResolution.value))

    this.dispatchEvent(CONTROLS_SNAP_RESOLUTION_CHANGE, resolution)
  }

  dispose() {
    this._removeListeners()

    super.dispose()
  }
}