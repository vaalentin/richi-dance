import Timeline from './Timeline'
import Sequence from './Sequence'
import * as Keys from '../Keys'
import Signal from '../Signal'

export default class Controls {
  private _timeline: Timeline

  private _$toggleButton: HTMLInputElement
  private _$clearButton: HTMLInputElement
  private _$playPauseButton: HTMLInputElement
  private _$speedInput: HTMLInputElement
  private _$boundariesFromInput: HTMLInputElement
  private _$boundariesToInput: HTMLInputElement
  private _$snapButton: HTMLInputElement
  private _$snapResolutionInput: HTMLInputElement
  private _$saveAnimationButton: HTMLInputElement
  private _$getAnimationButton: HTMLInputElement
  private _$setAnimationButton: HTMLInputElement
  private _$clearAnimationButton: HTMLInputElement

  private _$help: HTMLElement

  private _isHelpOpen: boolean

  public onSaveAnimation: Signal<void>
  public onGetAnimation: Signal<void>
  public onSetAnimation: Signal<{[name: string]: any}>
  public onClearAnimation: Signal<void>

  constructor(timeline: Timeline) {
    this._timeline = timeline

    const $controls = document.querySelector('.timeline__controls')

    this._$toggleButton = $controls.querySelector('.controls__toggle') as HTMLInputElement
    this._$clearButton = $controls.querySelector('.controls__clear') as HTMLInputElement
    this._$playPauseButton = $controls.querySelector('.controls__play-pause') as HTMLInputElement
    this._$speedInput = $controls.querySelector('.controls__speed') as HTMLInputElement
    this._$boundariesFromInput = $controls.querySelector('.controls__boundaries-from') as HTMLInputElement
    this._$boundariesToInput = $controls.querySelector('.controls__boundaries-to') as HTMLInputElement
    this._$snapButton = $controls.querySelector('.controls__snap') as HTMLInputElement
    this._$snapResolutionInput = $controls.querySelector('.controls__snap-resolution') as HTMLInputElement
    this._$saveAnimationButton = $controls.querySelector('.controls__save-animation') as HTMLInputElement
    this._$getAnimationButton = $controls.querySelector('.controls__get-animation') as HTMLInputElement
    this._$setAnimationButton = $controls.querySelector('.controls__set-animation') as HTMLInputElement
    this._$clearAnimationButton = $controls.querySelector('.controls__clear-animation') as HTMLInputElement

    this._$help = document.querySelector('.help') as HTMLElement

    this._isHelpOpen = false

    this.onSaveAnimation = new Signal<void>()
    this.onGetAnimation = new Signal<void>()
    this.onSetAnimation = new Signal()
    this.onClearAnimation = new Signal<void>()

    this._setInitialState()
    this._bindMethods()
    this._addListeners()
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
    this._handleSaveAnimation = this._handleSaveAnimation.bind(this)
    this._handleGetAnimation = this._handleGetAnimation.bind(this)
    this._handleSetAnimation = this._handleSetAnimation.bind(this)
    this._handleClearAnimation = this._handleClearAnimation.bind(this)

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
    this._$saveAnimationButton.addEventListener('click', this._handleSaveAnimation)
    this._$getAnimationButton.addEventListener('click', this._handleGetAnimation)
    this._$setAnimationButton.addEventListener('click', this._handleSetAnimation)
    this._$clearAnimationButton.addEventListener('click', this._handleClearAnimation)

    this._timeline.onPause.add(this._updatePlayPause)

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
    this._$saveAnimationButton.removeEventListener('click', this._handleSaveAnimation)
    this._$getAnimationButton.removeEventListener('click', this._handleGetAnimation)
    this._$setAnimationButton.removeEventListener('click', this._handleSetAnimation)
    this._$clearAnimationButton.removeEventListener('click', this._handleClearAnimation)

    this._timeline.onPause.remove(this._updatePlayPause)

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

  private _handleKeyDown({ keyCode, shiftKey }: KeyboardEvent) {
    switch (keyCode) {
      case Keys.SPACE:
        this._handlePlayPause()
        
        break

      case Keys.QUESTION_MARK:
        if (shiftKey && !this._isHelpOpen) {
          this._openHelp()
        }

        break

      case Keys.ESCAPE:
        if (this._isHelpOpen) {
          this._closeHelp()
        }
        
        break
    }
  }

  private _handleSaveAnimation() {
    this.onSaveAnimation.dispatch()
  }

  private _handleGetAnimation() {
    this.onGetAnimation.dispatch()
  }

  private _handleSetAnimation() {
    const animationString = window.prompt()
    
    let animation: {[name: string]: any}

    try {
      animation = JSON.parse(animationString)
    }
    catch (e) {}

    if (!animation) {
      animation = {}
    }

    this.onSetAnimation.dispatch(animation)
  }

  private _handleClearAnimation() {
    this.onClearAnimation.dispatch()
  }

  private _openHelp() {
    if (this._isHelpOpen) {
      return
    }

    this._isHelpOpen = true

    this._$help.style.display = 'block'
  }

  private _closeHelp() {
    if (!this._isHelpOpen) {
      return
    }

    this._isHelpOpen = false

    this._$help.style.display = 'none'
  }

  public dispose() {
    this._removeListeners()
  }
}
