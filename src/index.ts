import * as THREE from 'three'

import 'normalize.css'
import './index.css'

import Scene, {
  SCENE_RAYCAST
} from './core/webgl/Scene'
import KeyFrame from './core/timeline/KeyFrame'
import Sequence from './core/timeline/Sequence'
import Timeline from './core/timeline/Timeline'
import TimelineControls from './core/timeline/TimelineControls'

const $app = document.querySelector('.app') as HTMLElement
const $viewport = $app.querySelector('.viewport') as HTMLElement
const $timelineControls = $app.querySelector('.timeline__controls') as HTMLElement
const $timelineViewport = $app.querySelector('.timeline__viewport') as HTMLElement

const scene = new Scene($viewport)
scene.start()
scene.getCamera().position.z = 5

scene.addEventListener(SCENE_RAYCAST, ({ object }: THREE.Intersection) => {
  scene.attachToTransformControls(object)
})

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    wireframe: true
  })
)

scene.addToRaycast(cube)
scene.add(cube)

const timeline = new Timeline($timelineViewport)
timeline.setBoundaries(0, 10)

const controls = new TimelineControls(timeline, $timelineControls)

const sequence = new Sequence(cube)
timeline.addSequence(sequence)
timeline.setActiveSequence(sequence)

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