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
    const { _keyFrames: keyFrames } = this

    for (let i = 0; i < keyFrames.length - 1; ++i) {
      const currentKeyFrame = keyFrames[i]
      const nextKeyFrame = keyFrames[i + 1]

      if (time >= currentKeyFrame.getTime() && time < nextKeyFrame.getTime()) {
        let from: KeyFrame = null
        let to: KeyFrame = null

        // position
        if (currentKeyFrame.hasPosition()) {
          from = currentKeyFrame
        }
        else {
          for (let j = i - 1; j >= 0; --j) {
            const keyFrame = keyFrames[j]

            if (keyFrame.hasPosition()) {
              from = keyFrame
              break
            }
          }
        }

        if (nextKeyFrame.hasPosition()) {
          to = nextKeyFrame
        }
        else {
          for (let j = i + 1; j < keyFrames.length; ++j) {
            const keyFrame = keyFrames[j]

            if (keyFrame.hasPosition()) {
              to = keyFrame
              break
            }
          }
        }

        if (from && to) {
          const progress = mapValueToRange(time, from.getTime(), to.getTime(), 0, 1)
          
          const position = new THREE.Vector3().lerpVectors(
            from.getPosition(),
            to.getPosition(),
            progress
          )

          this._element.position.copy(position)
        }

        // rotation
        if (currentKeyFrame.hasRotation()) {
          from = currentKeyFrame
        }
        else {
          for (let j = i - 1; j >= 0; --j) {
            const keyFrame = keyFrames[j]

            if (keyFrame.hasRotation()) {
              from = keyFrame
              break
            }
          }
        }

        if (nextKeyFrame.hasRotation()) {
          to = nextKeyFrame
        }
        else {
          for (let j = i + 1; j < keyFrames.length; ++j) {
            const keyFrame = keyFrames[j]

            if (keyFrame.hasRotation()) {
              to = keyFrame
              break
            }
          }
        }

        if (from && to) {
          const progress = mapValueToRange(time, from.getTime(), to.getTime(), 0, 1)

           const quaternion = new THREE.Quaternion().setFromEuler(from.getRotation())
            .slerp(new THREE.Quaternion().setFromEuler(to.getRotation()), progress)
            .normalize()

          this._element.rotation.setFromQuaternion(quaternion)
        }

        // scale
        if (currentKeyFrame.hasScale()) {
          from = currentKeyFrame
        }
        else {
          for (let j = i - 1; j >= 0; --j) {
            const keyFrame = keyFrames[j]

            if (keyFrame.hasScale()) {
              from = keyFrame
              break
            }
          }
        }

        if (nextKeyFrame.hasScale()) {
          to = nextKeyFrame
        }
        else {
          for (let j = i + 1; j < keyFrames.length; ++j) {
            const keyFrame = keyFrames[j]

            if (keyFrame.hasScale()) {
              to = keyFrame
              break
            }
          }
        }

        if (from && to) {
          const progress = mapValueToRange(time, from.getTime(), to.getTime(), 0, 1)
          
          const scale = new THREE.Vector3().lerpVectors(
            from.getScale(),
            to.getScale(),
            progress
          )

          this._element.scale.copy(scale)
        }

        // this.onUpdate.dispatch({ position, rotation, scale })
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
      if (this._keyFrames[i] !== keyFrame) {
        this._keyFrames[i].dispose()
        this._keyFrames.splice(i, 1)  
      }
    }
    
    // add the new keyFrame
    this._keyFrames.push(keyFrame)

    // sort the keyFrames based on their time (from lower to higher)
    this._keyFrames.sort((a, b) => a.getTime() - b.getTime())

    // update hasPosition, hasRotation and hasScale for every keyFrames.
    for (let i = this._keyFrames.length - 2; i >= 0; --i) {
      const currentKeyFrame = this._keyFrames[i]
      const nextKeyFrame = this._keyFrames[i + 1]

      // set to true
      // next iteration might set them to false when looking at the previous key frame
      currentKeyFrame.hasPosition(true)
      currentKeyFrame.hasRotation(true)
      currentKeyFrame.hasScale(true)

      // update the next key frame
      if (currentKeyFrame.getPosition().equals(nextKeyFrame.getPosition())) {
        nextKeyFrame.hasPosition(false)
      }

      if (currentKeyFrame.getRotation().equals(nextKeyFrame.getRotation())) {
        nextKeyFrame.hasRotation(false)
      }      

      if (currentKeyFrame.getScale().equals(nextKeyFrame.getScale())) {
        nextKeyFrame.hasScale(false)
      }
    }

    // TODO look for first and last keyFrames, don't update them in the loop
    this._keyFrames[this._keyFrames.length - 1].hasPosition(true)
    this._keyFrames[this._keyFrames.length - 1].hasRotation(true)
    this._keyFrames[this._keyFrames.length - 1].hasScale(true)

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
