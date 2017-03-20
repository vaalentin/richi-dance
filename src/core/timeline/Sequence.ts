import * as THREE from 'three'

import Timeline from './Timeline'
import KeyFrame from './KeyFrame'

import { mapValueToRange } from '../math'

export default class Sequence {
  private _element: THREE.Object3D

  private _keyFrames: KeyFrame[]

  private _timeline: Timeline

  constructor(element: THREE.Object3D) {
    this._element = element

    this._keyFrames = []

    this._timeline = null
  }

  public addKeyFrame(keyFrame:KeyFrame) {
    this._keyFrames.push(keyFrame)

    this._keyFrames.sort((a, b) => a.getTime() - b.getTime())

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
  }

  public setTimeline(timeline:Timeline) {
    this._timeline = timeline
  }

  public setTime(time:number) {
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
        
        const rotation = new THREE.Quaternion().setFromEuler(currentKeyFrame.getRotation())
          .slerp(new THREE.Quaternion().setFromEuler(nextKeyFrame.getRotation()), progress)
          .normalize()
        
        this._element.rotation.setFromQuaternion(rotation)
        
        const scale = new THREE.Vector3().lerpVectors(
          currentKeyFrame.getScale(),
          nextKeyFrame.getScale(),
          progress
        )
        
        this._element.scale.copy(scale)
      }
    }
  }

  public getKeyFrames():KeyFrame[] {
    return this._keyFrames
  }

  public dispose() {

  }
}
