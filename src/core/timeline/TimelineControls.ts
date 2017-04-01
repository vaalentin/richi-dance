import Timeline from './Timeline'
import Sequence from './Sequence'
import * as Keys from '../Keys'

export default class Controls {
  private _timeline: Timeline

  private _$element: HTMLElement

  private _$toggleButton: HTMLInputElement
  private _$clearButton: HTMLInputElement
  private _$playPauseButton: HTMLInputElement
  private _$speedInput: HTMLInputElement
  private _$boundariesFromInput: HTMLInputElement
  private _$boundariesToInput: HTMLInputElement
  private _$snapButton: HTMLInputElement
  private _$snapResolutionInput: HTMLInputElement

  constructor(timeline: Timeline, $element: HTMLElement) {
    this._timeline = timeline

    this._$element = $element

    this._getElements()
    this._setInitialState()
    this._bindMethods()
    this._addListeners()
  }

  private _getElements() {
    this._$toggleButton = this._$element.querySelector('.controls__toggle') as HTMLInputElement
    this._$clearButton = this._$element.querySelector('.controls__clear') as HTMLInputElement
    this._$playPauseButton = this._$element.querySelector('.controls__play-pause') as HTMLInputElement
    this._$speedInput = this._$element.querySelector('.controls__speed') as HTMLInputElement
    this._$boundariesFromInput = this._$element.querySelector('.controls__boundaries-from') as HTMLInputElement
    this._$boundariesToInput = this._$element.querySelector('.controls__boundaries-to') as HTMLInputElement
    this._$snapButton = this._$element.querySelector('.controls__snap') as HTMLInputElement
    this._$snapResolutionInput = this._$element.querySelector('.controls__snap-resolution') as HTMLInputElement
  }

  private _setInitialState() {
    this._updateToggle()
    this._updatePlayPause()
    
    this._$speedInput.value = this._timeline.getSpeed().toString()
    
    const boundaries = this._timeline.getBoundaries()

    this._$boundariesFromInput.value = boundaries[0].toString()
    this._$boundariesToInput.value = boundaries[1].toString()

    this._updateSnap()

    this._$snapResolutionInput.value = this._timeline.getSnapResolution().toString()
  }

  private _bindMethods() {
    this._handleToggle = this._handleToggle.bind(this)
    this._handleClear = this._handleClear.bind(this)
    this._handlePlayPause = this._handlePlayPause.bind(this)
    this._handleSpeed = this._handleSpeed.bind(this)
    this._handleBoundaries = this._handleBoundaries.bind(this)
    this._handleSnap = this._handleSnap.bind(this)
    this._handleSnapResolution = this._handleSnapResolution.bind(this)

    this._updatePlayPause = this._updatePlayPause.bind(this)

    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  private _addListeners() {
    this._$toggleButton.addEventListener('click', this._handleToggle)
    this._$clearButton.addEventListener('click', this._handleClear)
    this._$playPauseButton.addEventListener('click', this._handlePlayPause)
    this._$speedInput.addEventListener('input', this._handleSpeed)
    this._$boundariesFromInput.addEventListener('input', this._handleBoundaries)
    this._$boundariesToInput.addEventListener('input', this._handleBoundaries)
    this._$snapButton.addEventListener('click', this._handleSnap)
    this._$snapResolutionInput.addEventListener('input', this._handleSnapResolution)

    this._timeline.onPlayPauseChange.add(this._updatePlayPause)

    document.addEventListener('keydown', this._handleKeyDown)
  }

  private _removeListeners() {
    this._$toggleButton.removeEventListener('click', this._handleToggle)
    this._$clearButton.removeEventListener('click', this._handleClear)
    this._$playPauseButton.removeEventListener('click', this._handlePlayPause)
    this._$speedInput.removeEventListener('input', this._handleSpeed)
    this._$boundariesFromInput.removeEventListener('input', this._handleBoundaries)
    this._$boundariesToInput.removeEventListener('input', this._handleBoundaries)
    this._$snapButton.removeEventListener('click', this._handleSnap)
    this._$snapResolutionInput.removeEventListener('input', this._handleSnapResolution)

    this._timeline.onPlayPauseChange.remove(this._updatePlayPause)

    document.removeEventListener('keydown', this._handleKeyDown)
  }

  private _updateToggle() {
    this._$toggleButton.value = this._timeline.isHidden() ? 'Show' : 'Hide'
  }

  private _handleToggle() {
    if (this._timeline.isHidden()) {
      this._timeline.show()
    }
    else {
      this._timeline.hide()
    }

    this._updateToggle()
  }

  private _handleClear() {
    const sequence = this._timeline.getActiveSequence()

    if (sequence) {
      sequence.clear()
    }
  }

  private _updatePlayPause() {
    this._$playPauseButton.value = this._timeline.isPlaying() ? 'Pause' : 'Play'
  }

  private _handlePlayPause() {
    alert('here')
    if (this._timeline.isPlaying()) {
      this._timeline.pause()
    }
    else {
      this._timeline.play()
    }

    this._updatePlayPause()
  }

  private _handleSpeed() {
    this._timeline.setSpeed(parseFloat(this._$speedInput.value))
  }

  private _handleBoundaries() {
    let from = parseFloat(this._$boundariesFromInput.value)
    let to = parseFloat(this._$boundariesToInput.value)

    if (from < 0) {
      from = 0
      this._$boundariesFromInput.value = from.toString()
    }

    if (to <= from) {
      to = from + 1
      this._$boundariesToInput.value = to.toString()
    }

    this._timeline.setBoundaries(from, to)
  }

  private _updateSnap() {
    this._$snapButton.value = this._timeline.isSnapEnabled() ? 'Disable snap' : 'Enable snap'
  }

  private _handleSnap() {
    if (this._timeline.isSnapEnabled()) {
      this._timeline.setSnap(false)
    }
    else {
      this._timeline.setSnap(true)
    }

    this._updateSnap()
  }

  private _handleSnapResolution() {
    this._timeline.setSnapResolution(parseInt(this._$snapResolutionInput.value))
  }

  private _handleKeyDown({ keyCode }: KeyboardEvent) {
    switch (keyCode) {
      case Keys.SPACE:
        this._handlePlayPause()
        
        break
    }
  }

  public dispose() {
    this._removeListeners()
  }
}
