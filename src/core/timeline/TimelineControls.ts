import { createElement, appendChild } from '../../core/dom'
import Timeline from './Timeline'
import * as Keys from '../Keys'

export interface Presets {
  toggled?: boolean
  autoplay?: boolean
  speed?: number
  fromTime?: number
  toTime?: number
  enableSnap?: boolean
  resolution?: number
}

export default class TimelineControls {
  private _timeline: Timeline

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
  private _$resolution: HTMLInputElement

  private _isHidden: boolean
  private _isPlaying: boolean

  constructor(timeline: Timeline, $element: HTMLElement, presets?: Presets) {
    this._timeline = timeline

    this._$element = $element

    this._isHidden = false
    this._isPlaying = false

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
      value: '2'
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

    this._$resolution = createElement('input', null, {
      name: 'to',
      type: 'number',
      min: '1',
      max: '10',
      value: '1'
    }) as HTMLInputElement

    this._$element.appendChild(this._$resolution)
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
    this._handleResolutionChange = this._handleResolutionChange.bind(this)
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
    this._$resolution.addEventListener('input', this._handleResolutionChange)
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
    this._$resolution.removeEventListener('input', this._handleResolutionChange)
  }

  private _handleToggle() {
    this._timeline.toggle()
  }

  private _handleClear() {
    const sequence = this._timeline.getActiveSequence()

    if (sequence) {
      sequence.clear()
    }
  }

  private _handlePlay() {
    this._timeline.play()
  }

  private _handlePause() {
    this._timeline.pause()
  }

  private _handleToggleCurves() {
    
  }

  private _handleSpeedChange() {
    const speed = parseFloat(this._$speedInput.value)
    
    this._timeline.setSpeed(speed)
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

    this._timeline.setBoundaries(from, to)
  }

  private _handleToggleSnap() {
    this._timeline.toggleSnap()
  }

  private _handleResolutionChange() {
    const resolution = Math.round(parseFloat(this._$resolution.value))

    this._$resolution.value = resolution.toString()

    this._timeline.setResolution(resolution)
  }

  private _handleKeyDown({ keyCode }: KeyboardEvent) {
    switch (keyCode) {
      case Keys.SPACE: // space
        if (this._timeline.isPlaying()) {
          this._timeline.pause()
        }
        else {
          this._timeline.play()
        }
        
        break
    }
  }

  public dispose() {
    this._removeListeners()
  }
}