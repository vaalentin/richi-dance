import * as THREE from 'three'

export default class KeyFrame {
  private _time: number

  private _position: THREE.Vector3
  private _rotation: THREE.Euler
  private _scale: THREE.Vector3

  constructor(time: number, position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3) {
    this._time = time
    
    this._position = position !== void 0
			? position.clone()
			: new THREE.Vector3(0, 0, 0)
		
		this._rotation = position !== void 0
			? rotation.clone()
			: new THREE.Euler(0, 0, 0)
		
		this._scale = scale !== void 0
			? scale.clone()
			: new THREE.Vector3(0, 0, 0)
  }

  public getTime(): number {
    return this._time
  }

  public getPosition(): THREE.Vector3 {
    return this._position
  }

  public getRotation(): THREE.Euler {
    return this._rotation
  }

  public getScale(): THREE.Vector3 {
    return this._scale
  }

  public dispose() {
    this._position = null
    this._rotation = null
    this._scale = null
  }
}
