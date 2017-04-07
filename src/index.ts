/// <reference path="./core/definitions.d.ts" />

import * as THREE from 'three'
import ShadowMesh from './core/webgl/ShadowMesh'

import 'normalize.css'
import './index.css'

import * as Keys from './core/Keys'

import Scene, { ControlsMode } from './core/webgl/Scene'
import KeyFrame from './core/timeline/KeyFrame'
import Sequence, { Features } from './core/timeline/Sequence'
import Timeline from './core/timeline/Timeline'
import TimelineControls from './core/timeline/TimelineControls'
import ControllableBone from './core/timeline/ControllableBone'

const $app = document.querySelector('.app') as HTMLElement
const $viewport = $app.querySelector('.viewport') as HTMLElement
const $timelineScrubber = $app.querySelector('.timeline__scrubber') as HTMLElement

const scene = new Scene($viewport)
scene.start()

const camera = scene.getCamera()
camera.position.z = 20
camera.position.y = 5
camera.lookAt(new THREE.Vector3(0, 0, 0))

const timeline = new Timeline()
timeline.setBoundaries(0, 10)

const controls = new TimelineControls(timeline)

// handle keyframe and sequences
const keyFrame = new KeyFrame()

const controllableBones: ControllableBone[] = []
let activeControllableBone: ControllableBone = null

scene.onRaycast.add(({ object }) => {
  scene.attachToTransformControls(object)

  let raycastedBone: ControllableBone

  for (let bone of controllableBones) {
    if (object !== bone.getObject()) {
      continue
    }

    raycastedBone = bone
  }

  if (raycastedBone) {
    activeControllableBone = raycastedBone
    timeline.setActiveSequence(activeControllableBone.getSequence())
    keyFrame.getRotation().copy(activeControllableBone.getBone().rotation)
    scene.setControlMode(ControlsMode.ROTATION)
  }
  else {
    activeControllableBone = null
    scene.setControlMode(ControlsMode.POSITION)
  }
})

timeline.onTimeChange.add(time => {
  keyFrame.setTime(time)
  
  for (let bone of controllableBones) {
    bone.updateHelperFromBone()
  }
})

scene.onTransformControlsChange.add(({ position, rotation, scale }) => {
  keyFrame.setPosition(position)
  keyFrame.setRotation(rotation)
  keyFrame.setScale(scale)

  for (let bone of controllableBones) {
    if (bone === activeControllableBone) {
      bone.updateBoneFromHelper()
    }
    else {
      bone.updateHelperFromBone()
    }
  }
})

// handle animation
let defaultAnimation: {[name: string]: any}

function getAnimation(): string {
  return JSON.stringify({
    bones: controllableBones.map(bone => bone.serialize())
  })
}

function getAnimationFromCookies(): {[name: string]: any} {
  let animation: {[name: string]: any}

  try {
    animation = JSON.parse(document.cookie)
  }
  catch (e) {
    animation = {}
  }

  return animation
}

function saveAnimationToCookies() {
  document.cookie = getAnimation()
}

function hydrate(animation?: {[name: string]: any}) {
  if (!animation || !animation.bones) {
    return
  }

  for (let boneData of animation.bones) {
    const bone = controllableBones.filter(bone => bone.getBone().name === boneData.name)[0]
    
    if (!bone) {
      continue
    }

    const { sequence: sequenceData } = boneData
    
    const sequence = bone.getSequence()

    sequence.setFeatures(sequenceData.features)

    sequence.clear()

    for (let { time, position, rotation, scale } of sequenceData.keyFrames) {  
      sequence.addKeyFrame(
        new KeyFrame(
          time,
          new THREE.Vector3(position.x, position.y, position.z),
          new THREE.Euler(rotation.x, rotation.y, rotation.z),
          new THREE.Vector3(scale.x, scale.y, scale.z)
        )
      )

      sequence.update(timeline.getTime())
    }

    bone.updateHelperFromBone()
  }
}

controls.onSaveAnimation.add(() => {
  saveAnimationToCookies()
})

controls.onGetAnimation.add(() => {
  window.open().document.write(getAnimation())
})

controls.onSetAnimation.add(animation => {
  hydrate(animation)
})

controls.onClearAnimation.add(() => {
  hydrate(defaultAnimation)
})

let helpersVisible = true

controls.onToggleHelpers.add(() => {
  for (let bone of controllableBones) {
    const helper = bone.getObject()

    if (helpersVisible) {
      scene.remove(helper)
    }
    else {
      scene.add(helper)
    }
  }

  helpersVisible = !helpersVisible
})

window.addEventListener('keydown', ({ keyCode }: KeyboardEvent) => {
  switch (keyCode) {
    case Keys.A:
      if (activeControllableBone) {
        activeControllableBone.getSequence().addKeyFrame(keyFrame.clone())
      }
      
      break

    case Keys.D:
      for (let bone of controllableBones) {
        console.log(JSON.stringify(bone.serialize()))
      }
      break

    case Keys.ESCAPE:
      scene.attachToTransformControls(null)
      timeline.setActiveSequence(null)
      activeControllableBone = null
      break
  }
})

// load models
const loader = new THREE.JSONLoader()

const material = new THREE.MeshBasicMaterial({
  vertexColors: THREE.VertexColors
})

const group = new THREE.Object3D()
scene.add(group)

let character: THREE.Mesh
let skeletonHelper: THREE.SkeletonHelper

function loadCharacter() {
  loader.load(require<string>('./models/richi.json'), geometry => {
    const material = new THREE.MeshBasicMaterial({
      vertexColors: THREE.VertexColors,
      skinning: true
    })

    character = new THREE.SkinnedMesh(geometry, material, false)
    scene.add(character)

    skeletonHelper = new THREE.SkeletonHelper(character)
    skeletonHelper.updateMatrix()

    for (let bone of skeletonHelper.bones) {
      bone.updateMatrix()
      const controllableBone = new ControllableBone(bone)
      scene.add(controllableBone.getObject())
      scene.addToRaycast(controllableBone.getObject())
      timeline.addSequence(controllableBone.getSequence())
      controllableBones.push(controllableBone)
    }

    defaultAnimation = {
      bones: controllableBones.map(bone => bone.serialize())
    }

    hydrate(getAnimationFromCookies())
  })
}

loadCharacter()

scene.onUpdate.add(() => {
  if (skeletonHelper) {
    skeletonHelper.update()
  }
})
