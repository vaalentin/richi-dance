import * as THREE from 'three'

import Sequence from './Sequence'
import { mapValueToRange } from '../math'
import * as Keys from '../Keys'

export const Render = {
  TICKS: 1 << 0,
  CURSOR: 1 << 1,
  KEYFRAMES: 1 << 2
}

export default class Timeline {
  private _$element: HTMLElement

  private _$canvas: HTMLCanvasElement
  private _context: CanvasRenderingContext2D

  private _boundaries: [number, number]
  private _progress: number
  private _speed: number
  private _snapResolution: number

  private _isPlaying: boolean
  private _isMouseDown: boolean
  private _isHidden: boolean
  private _isSnapEnabled: boolean

  private _renderMask: number

  private _sequence: Sequence

  private _clock: THREE.Clock
  private _requestAnimationFrameId: number

  constructor($element: HTMLElement) {
    this._$element = $element

    this._$canvas = document.createElement('canvas')
    this._$canvas.width = this._$element.offsetWidth
    this._$canvas.height = this._$element.offsetHeight
    this._context = this._$canvas.getContext('2d')

    this._$element.appendChild(this._$canvas)

    this._boundaries = [0, 0]
    this._progress = 0
    this._speed = 1
    this._snapResolution = 1

    this._isPlaying = false
    this._isMouseDown = false
    this._isHidden = false
    this._isSnapEnabled = false

    this._renderMask = Render.TICKS | Render.KEYFRAMES | Render.CURSOR

    this._sequence = null

    this._clock = new THREE.Clock()
    this._requestAnimationFrameId = null

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
    this._handleKeyDown = this._handleKeyDown.bind(this)
  }

  private _addListeners() {
    window.addEventListener('resize', this._handleResize)
    this._$element.addEventListener('mousemove', this._handleMouseMove)
    this._$element.addEventListener('mouseleave', this._handleMouseLeave)
    this._$element.addEventListener('mousedown', this._handleMouseDown)
    this._$element.addEventListener('mouseup', this._handleMouseUp)
    document.addEventListener('keydown', this._handleKeyDown)
  }

  private _removeListeners() {
    window.removeEventListener('resize', this._handleResize)
    this._$element.removeEventListener('mousemove', this._handleMouseMove)
    this._$element.removeEventListener('mouseleave', this._handleMouseLeave)
    this._$element.removeEventListener('mousedown', this._handleMouseDown)
    this._$element.removeEventListener('mouseup', this._handleMouseUp)
    document.removeEventListener('keydown', this._handleKeyDown)
  }

  private _handleResize() {
    this._$canvas.width = this._$element.offsetWidth
    this._$canvas.height = this._$element.offsetHeight
    
    this._render()
  }

  private _handleMouseDown({ offsetX }: MouseEvent) {
    this._isMouseDown = true
    
    if (this._isPlaying) {
      this.pause()
    }
    
    this._updateProgress(offsetX)
    
    this._render()
    this._updateSequence()
  }
  
  private _handleMouseUp() {
    this._isMouseDown = false
  }

  private _handleMouseLeave() {
    this._isMouseDown = false
  }

  private _handleMouseMove({ offsetX }: MouseEvent) {
    if (!this._isMouseDown) {
      return
    }
    
    this._updateProgress(offsetX)

    this._render()
    this._updateSequence()
  }

  private _handleKeyDown({ keyCode }: KeyboardEvent) {
    switch (keyCode) {
      case Keys.SPACE: // space
        if (this._isPlaying) {
          this.pause()	
        }
        else {
          this.play()
        }
        
        break
    }
  }

  private _updateProgress(x: number) {
    this._progress = x / this._$canvas.width

    if (this._isSnapEnabled) {
      this._snapProgress() 
    }
  }

  private _snapProgress() {
    const snapSteps = (this._boundaries[1] - this._boundaries[0]) * this._snapResolution

    this._progress = Math.round(this._progress * snapSteps) / snapSteps
  }

  private _update() {
    this._requestAnimationFrameId = window.requestAnimationFrame(this._update)
    
    const delta = this._clock.getDelta()
    
    const progressDelta = (delta / (this._boundaries[1] - this._boundaries[0])) * this._speed
    
    this._progress += progressDelta
    
    if (this._progress >= 1) {
      this._progress -= 1
    }
    
    this._render()
    this._updateSequence()
  }
  
  private _updateSequence() {
    if (!this._sequence) {
      return
    }
    
    const time = (this._progress * (this._boundaries[1] - this._boundaries[0])) + this._boundaries[0]
    
    this._sequence.setTime(time)
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

    if (this._renderMask & Render.KEYFRAMES && this._sequence) {
      this._context.strokeStyle = 'green'
      this._context.lineWidth = 2
      
      const keyFrames = this._sequence.getKeyFrames()
      
      for (let i = 0; i < keyFrames.length; ++i) {
        const keyFrame = keyFrames[i]
        
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

  public setBoundaries(from: number, to: number) {
    this._boundaries[0] = from
    this._boundaries[1] = to
    
    this._render()
  }

  public setSpeed(speed: number) {
    this._speed = speed
  }

  public setSequence(sequence: Sequence) {
    sequence.setTimeline(this)
    
    this._sequence = sequence
  }

  public play() {
    this._isPlaying = true
    
    this._clock.start()
    this._requestAnimationFrameId = window.requestAnimationFrame(this._update)
  }
  
  public pause() {
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
    if (this._isHidden) {
      return
    }

    this._isHidden = true

    this._$element.style.display = 'none'
  }

  public show() {
    if (!this._isHidden) {
      return
    }

    this._isHidden = false

    this._$element.style.display = 'block'
  }

  public toggleSnap() {
    this._isSnapEnabled = !this._isSnapEnabled

    if (this._isSnapEnabled) {
      this._snapProgress()
    }

    this._render()
  }

  public setResolution(resolution: number) {
    this._snapResolution = resolution

    if (this._isSnapEnabled) {
      this._snapProgress()
    }

    this._render()
  }

  public setRenderMask(mask: number) {
    this._renderMask = mask
  }

  public dispose() {
    this._removeListeners()

    this._$element = null
    this._$canvas = null
    this._context = null
  }
}
