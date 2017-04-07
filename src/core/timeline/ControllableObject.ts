import * as THREE from 'three'

import Sequence, { Features } from './Sequence'

export default class ControllableObject {
  protected _object: THREE.Mesh
  protected _sequence: Sequence

  constructor(object: THREE.Mesh, features: number) {
    this._object = object

    this._sequence = new Sequence(this._object, features)

    this._bindMethods()
    this._addListeners()
  }

  private _bindMethods() {
    this._handleSequenceUpdate = this._handleSequenceUpdate.bind(this)
  }

  private _addListeners() {
    this._sequence.onUpdate.add(this._handleSequenceUpdate)
  }

  private _removeListeners() {
    this._sequence.onUpdate.remove(this._handleSequenceUpdate)
  }

  protected _handleSequenceUpdate({ position, rotation, scale }) {
    
  }

  public getSequence(): Sequence {
    return this._sequence
  }

  public getObject(): THREE.Mesh {
    return this._object
  }

  public dispose() {
    this._removeListeners()
  }
}