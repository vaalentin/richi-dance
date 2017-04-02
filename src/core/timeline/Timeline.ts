import * as THREE from 'three'

import Sequence from './Sequence'
import KeyFrame from './KeyFrame'
import { mapValueToRange } from '../math'
import * as Keys from '../Keys'
import Signal from '../Signal'

export const Render = {
  TICKS: 1 << 0,
  CURSOR: 1 << 1,
  KEYFRAMES: 1 << 2
}

enum State {
  NONE,
  CURSOR,
  KEYFRAME,
  PLAYING
}

export class TimelineOptions {
  public boundaries: [number, number] = [0, 10]
  public speed = 1
  public snap = false
  public snapResolution = 4
  public renderMask = Render.TICKS | Render.CURSOR | Render.KEYFRAMES
  public keyFrameSelectionDistance = 0.05
}

export default class Timeline {
  private _$element: HTMLElement

  private _$canvas: HTMLCanvasElement
  private _context: CanvasRenderingContext2D

  private _boundaries: [number, number]
  private _progress: number
  private _time: number
  private _speed: number
  private _snapResolution: number

  private _isHidden: boolean
  private _isPlaying: boolean
  private _isMouseDown: boolean
  private _isSnapEnabled: boolean

  private _renderMask: number

  private _sequences: Sequence[]
  private _activeSequence: Sequence

  private _isMovingSelectedKeyFrame: boolean
  private _selectedKeyFrame: KeyFrame
  private _selectionDistance: number
  private _state: State

  private _clock: THREE.Clock
  private _requestAnimationFrameId: number

  public onTimeChange: Signal<number>
  public onPause: Signal<void>

  constructor(options: TimelineOptions = new TimelineOptions()) {
    this._$element = document.querySelector('.timeline__viewport') as HTMLElement

    this._$canvas = document.createElement('canvas')
    this._$canvas.width = this._$element.offsetWidth
    this._$canvas.height = this._$element.offsetHeight
    this._context = this._$canvas.getContext('2d')

    this._$element.appendChild(this._$canvas)

    this._boundaries = options.boundaries
    this._progress = 0
    this._speed = options.speed
    this._snapResolution = options.snapResolution

    this._isHidden = false
    this._isPlaying = false
    this._isMouseDown = false
    this._isSnapEnabled = options.snap

    this._renderMask = options.renderMask

    this._sequences = []
    this._activeSequence = null

    this._isMovingSelectedKeyFrame = false
    this._selectedKeyFrame = null
    this._selectionDistance = options.keyFrameSelectionDistance
    this._state = State.NONE

    this._clock = new THREE.Clock()
    this._requestAnimationFrameId = null

    this.onTimeChange = new Signal()
    this.onPause = new Signal<void>()

    this._bindMethods()
    this._addListeners()
  }

  private _bindMethods() {
    this._update = this._update.bind(this)
    this._handleResize = this._handleResize.bind(this)
    this._handleMouseUp = this._handleMouseUp.bind(this)
    this._handleMouseDown = this._handleMouseDown.bind(this)
    this._handleMouseLeave = this._handleMouseLeave.bind(this)
    this._handleMouseMove = this._handleMouseMove.bind(this)
  }

  private _addListeners() {
    window.addEventListener('resize', this._handleResize)
    this._$element.addEventListener('mousemove', this._handleMouseMove)
    this._$element.addEventListener('mouseleave', this._handleMouseLeave)
    this._$element.addEventListener('mousedown', this._handleMouseDown)
    this._$element.addEventListener('mouseup', this._handleMouseUp)
  }

  private _removeListeners() {
    window.removeEventListener('resize', this._handleResize)
    this._$element.removeEventListener('mousemove', this._handleMouseMove)
    this._$element.removeEventListener('mouseleave', this._handleMouseLeave)
    this._$element.removeEventListener('mousedown', this._handleMouseDown)
    this._$element.removeEventListener('mouseup', this._handleMouseUp)
  }

  private _handleResize() {
    this._$canvas.width = this._$element.offsetWidth
    this._$canvas.height = this._$element.offsetHeight
    
    this._render()
  }

  private _handleMouseDown({ offsetX }: MouseEvent) {
    this._isMouseDown = true

    switch (this._state) {
      case State.NONE: {
        if (this._selectedKeyFrame) {
          this._state = State.KEYFRAME

          this._render()
        }
        else {
          this._state = State.CURSOR

          this._updateProgress(offsetX)
          this._render()
          this._updateSequences()
        }

        break
      }

      case State.PLAYING: {
        this.onPause.dispatch()
        this.pause()

        this._updateProgress(offsetX)
        this._render()
        this._updateSequences()

        break
      }
    }
  }
  
  private _handleMouseUp() {
    this._isMouseDown = false

    switch (this._state) {
      case State.KEYFRAME:
      case State.CURSOR: {
        this._state = State.NONE

        break
      }
    }
  }

  private _handleMouseLeave() {
    this._isMouseDown = false

    switch (this._state) {
      case State.KEYFRAME:
      case State.CURSOR: {
        this._state = State.NONE

        break
      }
    }
  }

  private _handleMouseMove({ offsetX }: MouseEvent) {
    switch (this._state) {
      case State.NONE: {
        const progress = this._getProgress(offsetX)
        const time = this._getTime(progress)

        // select keyFrame
        if (this._activeSequence) {
          const keyFrames = this._activeSequence.getKeyFrames()

          let selectedKeyFrameFound = false

          for (let keyFrame of keyFrames) {
            const delta = Math.abs(time - keyFrame.getTime())
            
            if (delta < this._selectionDistance) {
              selectedKeyFrameFound = true
              this._selectedKeyFrame = keyFrame
              break
            }
          }

          if (!selectedKeyFrameFound) {
            this._selectedKeyFrame = null
          }

          this._render()
        }

        break
      }

      case State.KEYFRAME: {
        const progress = this._getProgress(offsetX)
        const time = this._getTime(progress)

        this._selectedKeyFrame.setTime(time)

        this._activeSequence.updateKeyFrames()
        this._render()

        break
      }

      case State.CURSOR: {
        this._updateProgress(offsetX)
        this._updateTime(this._progress)
    
        this._render()
        this._updateSequences()

        break
      }
    }
  }

  private _getProgress(x: number) {
    let progress = x / this._$canvas.width

    if (this._isSnapEnabled) {
      progress = this._snapProgress(progress)
    }

    return progress
  }

  private _snapProgress(progress: number):number {
    const snapSteps = (this._boundaries[1] - this._boundaries[0]) * this._snapResolution

    return Math.round(progress * snapSteps) / snapSteps
  }

  private _getTime(progress: number): number {
    return (progress * (this._boundaries[1] - this._boundaries[0])) + this._boundaries[0]
  }

  private _updateProgress(x: number) {
    this._progress = this._getProgress(x)
  }

  private _updateTime(progress: number) {
    this._time = this._getTime(progress)

    this.onTimeChange.dispatch(this._time)
  }

  private _update() {
    this._requestAnimationFrameId = window.requestAnimationFrame(this._update)
    
    const delta = this._clock.getDelta()
    
    const progressDelta = (delta / (this._boundaries[1] - this._boundaries[0])) * this._speed
    
    this._progress += progressDelta
    
    if (this._progress < 0) {
      this._progress += 1 - this._progress
    }
    else if (this._progress > 1) {
      this._progress -= this._progress
    }
    
    this._updateTime(this._progress)
    this._render()
    this._updateSequences()
  }
  
  private _updateSequences() {
    for (let sequence of this._sequences) {
      sequence.update(this._time)
    }
  }

  private _render() {
    this._context.clearRect(0, 0, this._$canvas.width, this._$canvas.height)
  
    if (this._renderMask & Render.TICKS) {
      this._context.strokeStyle = 'grey'

      const steps = (this._boundaries[1] - this._boundaries[0]) * this._snapResolution
      
      for (let i = 0, j = 0; i < steps; ++i, ++j) {
        let x = (i / steps) * this._$canvas.width

        if (j === this._snapResolution) {
          j = 0
          this._context.lineWidth = 2
        }
        else {
          this._context.lineWidth = 1
        }
        
        this._context.beginPath()
        this._context.moveTo(x, 0)
        this._context.lineTo(x, this._$canvas.height)
        this._context.stroke()
      }
    }

    if (this._renderMask & Render.KEYFRAMES && this._activeSequence) {
      const keyFrames = this._activeSequence.getKeyFrames()
      
      for (let i = 0; i < keyFrames.length; ++i) {
        const keyFrame = keyFrames[i]

        if (keyFrame === this._selectedKeyFrame) {
          this._context.strokeStyle = 'blue'
          this._context.lineWidth = 4
        }
        else {
          this._context.strokeStyle = 'green'
          this._context.lineWidth = 2
        }
        
        const time = keyFrame.getTime()
        
        if (time < this._boundaries[0] || time > this._boundaries[1]) {
          continue
        }
        
        const x = mapValueToRange(time, this._boundaries[0], this._boundaries[1], 0, this._$canvas.width)
        
        this._context.beginPath()
        this._context.moveTo(x, 0)
        this._context.lineTo(x, this._$canvas.height)
        this._context.stroke()
      }
    }

    if (this._renderMask & Render.CURSOR) {
      this._context.strokeStyle = 'red'
      this._context.lineWidth = 2
      
      const x = this._progress * this._$canvas.width
      
      this._context.beginPath()
      this._context.moveTo(x, 0)
      this._context.lineTo(x, this._$canvas.height)
      this._context.stroke()
    }
  }

  public addSequence(sequence: Sequence) {
    const i = this._sequences.indexOf(sequence)

    if (i !== -1) {
      return
    }

    this._sequences.push(sequence)
  }

  public removeSequence(sequence: Sequence) {
    const i = this._sequences.indexOf(sequence)

    if (i === -1) {
      return
    }

    this._sequences.splice(i, 1)
  }

  public getActiveSequence(): Sequence|null {
    return this._activeSequence
  }

  public setActiveSequence(sequence: Sequence|null) {
    if (this._activeSequence) {
      this._activeSequence.setTimeline(null)
      this._activeSequence = null
    }

    if (sequence) {
      const i = this._sequences.indexOf(sequence)

      if (i === -1) {
        return
      }
      
      sequence.setTimeline(this)
      this._activeSequence = sequence
    }

    this._render()
  }

  public isPlaying() {
    return this._isPlaying
  }

  public play() {
    if (this._isPlaying) {
      return
    }

    this._isPlaying = true
    
    this._clock.start()
    this._requestAnimationFrameId = window.requestAnimationFrame(this._update)
  }
  
  public pause() {
    if (!this._isPlaying) {
      return
    }
    
    this._isPlaying = false
    
    this._clock.stop()
    window.cancelAnimationFrame(this._requestAnimationFrameId)
  }

  public forceRender() {
    this._render()
  }

  public isHidden() {
    return this._isHidden
  }

  public hide() {
    this._isHidden = true

    this._$element.style.display = 'none'
  }

  public show() {
    this._isHidden = false

    this._$element.style.display = 'block'
  }

  public getSpeed(): number {
    return this._speed
  }

  public setSpeed(speed: number) {
    this._speed = speed
  }

  public getBoundaries(): [number, number] {
    return this._boundaries
  }

  public setBoundaries(from: number, to: number) {
    this._boundaries[0] = from
    this._boundaries[1] = to
    
    if (this._isSnapEnabled) {
      this._progress = this._snapProgress(this._progress)
    }
    
    this._render()
  }

  public isSnapEnabled(): boolean {
    return this._isSnapEnabled
  }

  public setSnap(snap: boolean) {
    this._isSnapEnabled = snap

    if (this._isSnapEnabled) {
      this._progress = this._snapProgress(this._progress)
      this._render()
    }
  }

  public getSnapResolution(): number {
    return this._snapResolution
  }

  public setSnapResolution(resolution: number) {
    this._snapResolution = resolution

    if (this._isSnapEnabled) {
      this._progress = this._snapProgress(this._progress)
      this._render()
    }
  }

  public getRenderMask(): number {
    return this._renderMask
  }

  public setRenderMask(mask: number) {
    this._renderMask = mask

    this._render()
  }

  public dispose() {
    this._removeListeners()

    this._$element = null
    this._$canvas = null
    this._context = null
  }
}
