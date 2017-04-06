/// <reference path="./core/definitions.d.ts" />

import * as THREE from 'three'
import ShadowMesh from './core/webgl/ShadowMesh'

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


const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({
    wireframe: true
  })
)

scene.addToRaycast(cube)
scene.add(cube)
const camera = scene.getCamera()
camera.position.z = 20
camera.position.y = 5
camera.lookAt(new THREE.Vector3(0, 0, 0))

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

const loader = new THREE.JSONLoader()

const material = new THREE.MeshLambertMaterial({
  vertexColors: THREE.VertexColors
})

let character: THREE.Mesh
let floor: THREE.Mesh

let lightPosition = new THREE.Vector4(5, 7, - 1, 0.01)
let floorPlane: THREE.Plane
let characterShadow

var sunLight = new THREE.DirectionalLight( 'rgb(255,255,255)', 1 );
sunLight.position.set( 5, 7, - 1 );
sunLight.lookAt( new THREE.Vector3(0, 0, 0));
scene.add( sunLight );

loader.load(require<string>('./models/dummy-floor.json'), geometry => {
  floor = new THREE.Mesh(geometry, material)
  scene.add(floor)

  floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.01)
})

loader.load(require<string>('./models/dummy-character.json'), geometry => {
  character = new THREE.Mesh(geometry, material)
  scene.add(character)

  characterShadow = new ShadowMesh(character)
  scene.add(characterShadow)
})

scene.onUpdate.add(() => {
  if (characterShadow) {
    characterShadow.update(floorPlane, lightPosition)
  }
})