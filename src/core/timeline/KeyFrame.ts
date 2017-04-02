import * as THREE from 'three'

export default class KeyFrame {
  private _time: number

  private _position: THREE.Vector3
  private _rotation: THREE.Euler
  private _scale: THREE.Vector3

  private _hasPosition: boolean
  private _hasRotation: boolean
  private _hasScale: boolean

  constructor(time?: number, position?: THREE.Vector3, rotation?: THREE.Euler, scale?: THREE.Vector3) {
    this._time = time === void 0
      ? -1
      : time
    
    this._position = position !== void 0
      ? position.clone()
      : new THREE.Vector3(0, 0, 0)
    
    this._rotation = position !== void 0
      ? rotation.clone()
      : new THREE.Euler(0, 0, 0)
    
    this._scale = scale !== void 0
      ? scale.clone()
      : new THREE.Vector3(1, 1, 1)

    this._hasPosition = false
    this._hasRotation = false
    this._hasScale = false
  }

  public getTime(): number {
    return this._time
  }

  public setTime(time: number) {
    this._time = time
  }

  public getPosition(): THREE.Vector3 {
    return this._position
  }

  public setPosition(position: THREE.Vector3) {
    this._position.copy(position)
  }

  public getRotation(): THREE.Euler {
    return this._rotation
  }

  public setRotation(rotation: THREE.Euler) {
    this._rotation.copy(rotation)
  }

  public getScale(): THREE.Vector3 {
    return this._scale
  }

  public setScale(scale: THREE.Vector3) {
    this._scale.copy(scale)
  }

  public clone(): KeyFrame {
    return new KeyFrame(this._time, this._position, this._rotation, this._scale)
  }

  public hasPosition(value?: boolean) {
    if (value === void 0) {
      return this._hasPosition
    }

    this._hasPosition = value
  }

  public hasRotation(value?: boolean) {
    if (value === void 0) {
      return this._hasRotation
    }

    this._hasRotation = value
  }

  public hasScale(value?: boolean) {
    if (value === void 0) {
      return this._hasScale
    }

    this._hasScale = value
  }

  public dispose() {
    this._position = null
    this._rotation = null
    this._scale = null
  }
}
