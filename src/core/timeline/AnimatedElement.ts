import * as THREE from 'three'

import Sequence from './Sequence'

export default class AnimatedElement {
  private _element: THREE.Object3D
  private _bone: THREE.Bone

  private _originElementPosition: THREE.Vector3
  private _originBonePosition: THREE.Vector3

  private _sequence: Sequence

  constructor(element: THREE.Object3D, bone: THREE.Bone) {
    this._element = element
    this._bone = bone

    this._originElementPosition = this._element.position.clone()
    this._originBonePosition = this._bone.position.clone()

    this._sequence = new Sequence(this._element)
  }

  public getElement(): THREE.Object3D {
    return this._element
  }

  public getBone(): THREE.Bone {
    return this._bone
  }

  public getSequence(): Sequence {
    return this._sequence
  }

  public updateBone() {
    // const delta = new THREE.Vector3().subVectors(this._originElementPosition, this._element.position)

    // this._bone.position.copy(new THREE.Vector3().addVectors(this._originBonePosition, delta))

    this._bone.rotation.copy(this._element.rotation)

    this._bone.matrixAutoUpdate = true
    this._bone.matrixWorldNeedsUpdate = true

    // this._bone.position.copy(this._element.position)




    // this._bone.parent.updateMatrixWorld(true)
    // const localPosition = this._bone.worldToLocal(this._element.position.clone())
    // this._bone.position.copy(localPosition)

    // new THREE.Matrix4().getInverse(this._bone.parent.matrixWorld)

    // console.log(this._bone.uuid, localPosition, this._bone.position)

    // this._bone.position.copy(localPosition)

    // this._bone.matrixAutoUpdate = true
    // this._bone.matrixWorldNeedsUpdate = true

    // this._bone.rotation.copy(this._element.rotation)
  }

  public dispose() {
    this._sequence.dispose()
  }
}
