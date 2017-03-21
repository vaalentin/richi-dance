import * as THREE from 'three'

import 'normalize.css'
import './index.css'

import Scene from './core/webgl/Scene'
import KeyFrame from './core/timeline/KeyFrame'
import Sequence from './core/timeline/Sequence'
import Timeline from './core/timeline/Timeline'
import Controls, {
  CONTROLS_TOGGLE,
  CONTROLS_CLEAR,
  CONTROLS_PLAY,
  CONTROLS_PAUSE,
  CONTROLS_TOGGLE_CURVES,
  CONTROLS_SPEED_CHANGE,
  CONTROLS_BOUNDARIES_CHANGE,
  CONTROLS_TOGGLE_SNAP,
  CONTROLS_SNAP_RESOLUTION_CHANGE
} from './core/timeline/Controls'

const $app = document.querySelector('.app') as HTMLElement
const $viewport = $app.querySelector('.viewport') as HTMLElement
const $timelineControls = $app.querySelector('.timeline__controls') as HTMLElement
const $timelineViewport = $app.querySelector('.timeline__viewport') as HTMLElement

const scene = new Scene($viewport)
scene.start()
scene.getCamera().position.z = 5

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    wireframe: true
  })
)

scene.add(cube)
scene.attachToTransformControls(cube)

const timeline = new Timeline($timelineViewport)
timeline.setBoundaries(0, 10)

const controls = new Controls($timelineControls)

controls.addEventListener(CONTROLS_TOGGLE, () => {
  console.log('toggle')

  if (timeline.isHidden()) {
    timeline.show()
  }
  else {
    timeline.hide()
  }
})

controls.addEventListener(CONTROLS_CLEAR, () => {
  sequence.clear()
})

controls.addEventListener(CONTROLS_PLAY, () => {
  console.log('play')

  timeline.play()
})

controls.addEventListener(CONTROLS_PAUSE, () => {
  console.log('pause')

  timeline.pause()
})

controls.addEventListener(CONTROLS_TOGGLE_CURVES, () => {
  console.log('toggle curves')
})

controls.addEventListener(CONTROLS_SPEED_CHANGE, (speed: number) => {
  console.log(`change speed: ${speed}`)

  timeline.setSpeed(speed)
})

controls.addEventListener(CONTROLS_BOUNDARIES_CHANGE, ([from, to]: [number, number]) => {
  console.log(`change boundaries: [${from}, ${to}]`)

  timeline.setBoundaries(from, to)
})

controls.addEventListener(CONTROLS_TOGGLE_SNAP, () => {
  timeline.toggleSnap()
})

controls.addEventListener(CONTROLS_SNAP_RESOLUTION_CHANGE, (resolution: number) => {
  timeline.setSnapResolution(resolution)
})

const sequence = new Sequence(cube)
timeline.setSequence(sequence)

for (let i = 0; i < 11; ++i) {
  const time = i
  
  const position = new THREE.Vector3(
    (Math.random() * 2 - 1) * 2,
    (Math.random() * 2 - 1) * 2,
    (Math.random() * 2 - 1) * 2
  )
  
  const rotation = new THREE.Euler(
    (Math.random() * 2 - 1) * 2 * Math.PI,
    (Math.random() * 2 - 1) * 2 * Math.PI,
    (Math.random() * 2 - 1) * 2 * Math.PI
  )
  
  const scale = new THREE.Vector3(
    (Math.random()) + 0.5,
    (Math.random()) + 0.5,
    (Math.random()) + 0.5
  )
  
  const keyFrame = new KeyFrame(time, position, rotation, scale)
  sequence.addKeyFrame(keyFrame)
}

(window as any).timeline = timeline