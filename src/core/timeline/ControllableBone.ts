import * as THREE from 'three'

import ControllableObject from './ControllableObject'
import Sequence, { Features } from './Sequence'

const helper = new THREE.Mesh(
  new THREE.BoxBufferGeometry(0.2, 0.2, 0.2),
  new THREE.MeshBasicMaterial({
    depthTest: false,
    depthWrite: false
  })
)

helper.renderOrder = 1000

export default class ControllableBone extends ControllableObject {
  private _bone: THREE.Bone

  constructor(bone: THREE.Bone) {
    super(helper.clone(), Features.ROTATION)

    this._bone = bone

    this._object.position.copy(this._bone.getWorldPosition())
    this._object.rotation.copy(this._bone.rotation)
  }

  protected _handleSequenceUpdate() {
    this.updateBoneFromHelper()
    this.updateHelperFromBone()
  }

  public updateBoneFromHelper() {
    this._bone.rotation.copy(this._object.rotation)
    this._bone.matrixAutoUpdate = true
    this._bone.matrixWorldNeedsUpdate = true
  }

  public updateHelperFromBone() {
    this._object.position.copy(this._bone.getWorldPosition())
  }

  public getBone(): THREE.Bone {
    return this._bone
  }

  public getSequence(): Sequence {
    return this._sequence
  }

  public serialize(): {[name: string]: any} {
    return {
      name: this._bone.name,
      sequence: this._sequence.serialize()
    }
  }
}
