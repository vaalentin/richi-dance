import * as THREE from 'three'

import Timeline from './Timeline'
import KeyFrame from './KeyFrame'
import Signal from '../Signal'
import { mapValueToRange } from '../math'

export default class Sequence {
  private _element: THREE.Object3D

  private _keyFrames: KeyFrame[]

  private _timeline: Timeline

  public onUpdate: Signal<{ position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3 }>

  constructor(object: THREE.Object3D) {
    this._element = object

    this._keyFrames = []

    this._timeline = null

    this.onUpdate = new Signal()
  }

  public update(time:number) {
    for (let i = 0; i < this._keyFrames.length - 1; ++i) {
      const currentKeyFrame = this._keyFrames[i]
      const nextKeyFrame = this._keyFrames[i + 1]

      if (time >= currentKeyFrame.getTime() && time <= nextKeyFrame.getTime()) {
        // that's where we're at, in between those 2 keyframes
        
        // get progress, value from 0 to 1 between the 2 frames
        const progress = mapValueToRange(time, currentKeyFrame.getTime(), nextKeyFrame.getTime(), 0, 1)
        
        const position = new THREE.Vector3().lerpVectors(
          currentKeyFrame.getPosition(),
          nextKeyFrame.getPosition(),
          progress
        )
        
        this._element.position.copy(position)
        
        const quaternion = new THREE.Quaternion().setFromEuler(currentKeyFrame.getRotation())
          .slerp(new THREE.Quaternion().setFromEuler(nextKeyFrame.getRotation()), progress)
          .normalize()

        const rotation = new THREE.Euler().setFromQuaternion(quaternion)
        
        this._element.rotation.copy(rotation)
        
        const scale = new THREE.Vector3().lerpVectors(
          currentKeyFrame.getScale(),
          nextKeyFrame.getScale(),
          progress
        )
        
        this._element.scale.copy(scale)

        this.onUpdate.dispatch({ position, rotation, scale })
      }
    }
  }

  public addKeyFrame(keyFrame: KeyFrame) {
    // look for a potential keyFrame at that time
    // if one is found, remove it
    let i = -1

    for (let j = 0; j < this._keyFrames.length; ++j) {
      if (this._keyFrames[j].getTime() === keyFrame.getTime()) {
        i = j
        break
      }
    }

    if (i !== -1) {
      this._keyFrames[i].dispose()
      this._keyFrames.splice(i, 1)
    }
    
    // add the new keyFrame
    this._keyFrames.push(keyFrame)

    // sort the keyFrames based on their time (from lower to higher)
    this._keyFrames.sort((a, b) => a.getTime() - b.getTime())

    // update hasPosition, hasRotation and hasScale for every keyFrames.
    for (let i = 0; i < this._keyFrames.length; ++i) {
      const currentKeyFrame = this._keyFrames[i]
      const nextKeyFrame = this._keyFrames[(i + 1) % this._keyFrames.length]

      const hasPosition = !currentKeyFrame.getPosition().equals(nextKeyFrame.getPosition())
      const hasRotation = !currentKeyFrame.getRotation().equals(nextKeyFrame.getRotation())
      const hasScale = !currentKeyFrame.getScale().equals(nextKeyFrame.getScale())

      currentKeyFrame.hasPosition(hasPosition)
      currentKeyFrame.hasRotation(hasRotation)
      currentKeyFrame.hasScale(hasScale)
    }

    if (this._timeline) {
      this._timeline.forceRender()
    }
  }

  public removeKeyFrame(keyFrame:KeyFrame) {
    const i = this._keyFrames.indexOf(keyFrame)
    
    if (i === -1) {
      return
    }

    this._keyFrames.splice(i, 1)

    if (this._timeline) {
      this._timeline.forceRender()
    }
  }

  public getKeyFrames(): KeyFrame[] {
    return this._keyFrames
  }

  public clear() {
    this._keyFrames.length = 0

    if (this._timeline) {
      this._timeline.forceRender()
    }
  }

  public getTimeline(): Timeline {
    return this._timeline
  }

  public setTimeline(timeline: Timeline|null) {
    this._timeline = timeline
  }

  public getElement(): THREE.Object3D {
    return this._element
  }

  public setElement(element: THREE.Object3D) {
    this._element = element
  }

  public dispose() {

  }
}
