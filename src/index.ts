import * as THREE from 'three'

import KeyFrame from './core/timeline/KeyFrame'
import Sequence from './core/timeline/Sequence'
import Timeline from './core/timeline/Timeline'

const $app = document.querySelector('#app') as HTMLElement
const $viewport = document.querySelector('.viewport') as HTMLElement
const $timeline = $app.querySelector('.timeline') as HTMLElement

const { innerWidth: width, innerHeight: height } = window

const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer()
$viewport.appendChild(renderer.domElement)
renderer.setSize(width, height)
const camera = new THREE.PerspectiveCamera(45, width / height, 1, 100)
camera.position.z = 5

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    wireframe: true
  })
)

scene.add(cube)

function tick() {
  window.requestAnimationFrame(tick)
  
  renderer.render(scene, camera)
}

tick()

window.addEventListener('resize', () => {
  const { innerWidth: width, innerHeight: height } = window
  
  renderer.setSize(width, height)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
})

const timeline = new Timeline($timeline)
timeline.setBoundaries(0, 10)

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
