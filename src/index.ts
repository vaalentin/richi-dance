import * as THREE from 'three'

import 'normalize.css'
import './index.css'

import * as Keys from './core/Keys'

import Scene from './core/webgl/Scene'
import KeyFrame from './core/timeline/KeyFrame'
import Sequence from './core/timeline/Sequence'
import Timeline from './core/timeline/Timeline'
import TimelineControls from './core/timeline/TimelineControls'

const $app = document.querySelector('.app') as HTMLElement
const $viewport = $app.querySelector('.viewport') as HTMLElement
const $timelineScrubber = $app.querySelector('.timeline__scrubber') as HTMLElement

const scene = new Scene($viewport)
scene.start()
scene.getCamera().position.z = 5


const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    wireframe: true
  })
)

scene.addToRaycast(cube)
scene.add(cube)

const timeline = new Timeline()
timeline.setBoundaries(0, 10)

const controls = new TimelineControls(timeline)

const sequence = new Sequence(cube)
timeline.addSequence(sequence)

scene.onRaycast.add(({ object }) => {
  scene.attachToTransformControls(object)
  timeline.setActiveSequence(sequence)
})

// update current keyframe
const keyFrame = new KeyFrame()

timeline.onTimeChange.add(time => {
  keyFrame.setTime(time)
})

timeline.onKeyFrameSelected.add(keyFrame => {
  console.log(JSON.stringify(keyFrame, null, 2))
})

scene.onTransformControlsChange.add(({ position, rotation, scale }) => {
  keyFrame.setPosition(position)
  keyFrame.setRotation(rotation)
  keyFrame.setScale(scale)
})

window.addEventListener('keydown', ({ keyCode }: KeyboardEvent) => {
  switch (keyCode) {
    case Keys.A:
      sequence.addKeyFrame(keyFrame.clone())
      break

    case Keys.D:
      console.log(JSON.stringify(keyFrame, null, 2))
      break

    case Keys.ESCAPE:
      scene.attachToTransformControls(null)
      timeline.setActiveSequence(null)
      break
  }
})