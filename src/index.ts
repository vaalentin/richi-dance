/// <reference path="./core/definitions.d.ts" />

import Scene from './core/webgl/Scene'

import Viewport from './components/viewport/Viewport'
import Loader from './components/loader/Loader'

const viewport = new Viewport()
viewport.mount(document.body)

const loader = new Loader()
loader.mount(document.body)

loader.enter(() => {
  loader.leave(() => {

  })
})

console.log(loader)

const scene = new Scene(viewport.getElement())
scene.start()
scene.getCamera().position.z = 5


// import * as THREE from 'three'
// import { GUI } from 'dat-gui'

// import 'normalize.css'
// import './index.css'

// import * as Keys from './core/Keys'

// import Scene from './core/webgl/Scene'
// import KeyFrame from './core/timeline/KeyFrame'
// import Sequence from './core/timeline/Sequence'
// import Timeline from './core/timeline/Timeline'
// import TimelineControls from './core/timeline/TimelineControls'
// import TimelineScrubber from './core/timeline/TimelineScrubber'
// import AnimatedElement from './core/timeline/AnimatedElement'

// const $app = document.querySelector('.app') as HTMLElement
// const $viewport = $app.querySelector('.viewport') as HTMLElement
// const $timelineControls = $app.querySelector('.timeline__controls') as HTMLElement
// const $timelineViewport = $app.querySelector('.timeline__viewport') as HTMLElement
// const $timelineScrubber = $app.querySelector('.timeline__scrubber') as HTMLElement

// const scene = new Scene($viewport)
// scene.start()
// scene.getCamera().position.z = 5

// const timeline = new Timeline($timelineViewport)
// timeline.setBoundaries(0, 10)

// const controls = new TimelineControls(timeline, $timelineControls)
// const scrubber = new TimelineScrubber(timeline, $timelineScrubber)


// let activeAnimatedElement: AnimatedElement = null
// const animatedElements: AnimatedElement[] = []

// // update current keyframe
// const keyFrame = new KeyFrame()

// scene.onRaycast.add(({ object }) => {
//   scene.attachToTransformControls(object)

//   for (let animatedElement of animatedElements) {
//     if (animatedElement.getElement() === object) {
//       activeAnimatedElement = animatedElement
//       break
//     }
//   }

//   if (activeAnimatedElement !== null) {
//     timeline.setActiveSequence(activeAnimatedElement.getSequence())
//   }
// })

// timeline.onTimeChange.add(time => {
//   keyFrame.setTime(time)
// })

// scene.onTransformControlsChange.add(({ position, rotation, scale }) => {
//   keyFrame.setPosition(position)
//   keyFrame.setRotation(rotation)
//   keyFrame.setScale(scale)

//   if (activeAnimatedElement) {
//     activeAnimatedElement.updateBone()
//   }
// })

// window.addEventListener('keydown', ({ keyCode }: KeyboardEvent) => {
//   switch (keyCode) {
//     case Keys.A:
//       const sequence = timeline.getActiveSequence()

//       if (sequence !== null) {
//         sequence.addKeyFrame(keyFrame.clone())
//       }
      
//       break

//     case Keys.D:
      
//       break

//     case Keys.ESCAPE:
//       scene.attachToTransformControls(null)
//       timeline.setActiveSequence(null)
//       activeAnimatedElement = null
//       break
//   }
// })

// new THREE.JSONLoader().load(require<string>('./models/threejs/dummy.json'), (geometry, materials) => {
//   const material = new THREE.MeshBasicMaterial({
//     color: 'red',
//     wireframe: true,
//     skinning: true,
//     transparent: true,
//     opacity: 1,
//     depthTest: false
//   })

//   const mesh = new THREE.SkinnedMesh(geometry, material, false)

//   scene.add(mesh)

//   const skeletonHelper = new THREE.SkeletonHelper( mesh );
//   scene.add( skeletonHelper );
//   console.log(skeletonHelper);
  
//   const helperGeometry = new THREE.SphereBufferGeometry(0.1, 12, 12)
//   const helperMaterial = new THREE.MeshBasicMaterial({
//     color: 0xffffff,
//     depthTest: false,
//   })

//   const helper = new THREE.Mesh(helperGeometry, helperMaterial)

//   const gui = new GUI()

//   for (let bone of mesh.skeleton.bones) {
//     const folder = gui.addFolder(bone.name)
//     folder.close()

//     folder.add(bone.rotation, 'x').min(-Math.PI).max(Math.PI)
//     folder.add(bone.rotation, 'y').min(-Math.PI).max(Math.PI)
//     folder.add(bone.rotation, 'z').min(-Math.PI).max(Math.PI)

//     // const boneHelper = helper.clone()

//     // // boneHelper.position.copy(bone.localToWorld(bone.position.clone()))

//     // boneHelper.position.copy(bone.getWorldPosition())
//     // boneHelper.rotation.copy(bone.rotation)
//     // boneHelper.scale.copy(bone.getWorldScale())

//     // const animatedElement = new AnimatedElement(boneHelper, bone)
//     // animatedElements.push(animatedElement)

//     // scene.add(animatedElement.getElement())
//     // scene.addToRaycast(animatedElement.getElement())
//     // timeline.addSequence(animatedElement.getSequence())
//   }

//   // console.log(JSON.stringify(mesh.skeleton.bones.map(s => s.position), null, 2))

//   let time = 0

//   ;(function tick() {
//     time += 0.05

//     window.requestAnimationFrame(tick)

//     skeletonHelper.update()

//     // let j = 0

//     // mesh.skeleton.bones.forEach(bone => {
//     //   bone.position.x = Math.sin(time * j++)
//     // })

//     // const bone = mesh.skeleton.bones[0]

//     // const x = Math.sin(time)
//     // bone.position.x = x
//     // bone.rotation.x = 1 + x / 2
//     // bone.matrixAutoUpdate = true
//     // bone.matrixWorldNeedsUpdate = true
//   })()

//   console.log(mesh);
// })