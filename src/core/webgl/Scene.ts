import * as THREE from 'three'
import * as TransformControls from 'three-transformcontrols'
import * as OrbitControls from 'three-orbitcontrols'

import Signal from '../Signal'
import * as Keys from '../Keys'

type TransformControls = {
  target: { object: THREE.Mesh }
  type: string
}

export default class Scene {
  private _$element: HTMLElement

  private _scene: THREE.Scene

  private _renderer: THREE.WebGLRenderer

  private _camera: THREE.PerspectiveCamera

  private _transformControls
  private _orbitControls

  private _objectsToRaycast: THREE.Object3D[]
  private _raycaster: THREE.Raycaster
  private _mouse: THREE.Vector2

  private _requestAnimationFrameId: number;

  public onUpdate: Signal<void>
  public onRaycast: Signal<THREE.Intersection>
  public onTransformControlsChange: Signal<{ position: THREE.Vector3, rotation: THREE.Euler, scale: THREE.Vector3}>

  constructor($element: HTMLElement) {
    this._$element = $element

    const { offsetWidth: width, offsetHeight: height } = this._$element

    this._scene = new THREE.Scene()

    this._renderer = new THREE.WebGLRenderer({
      antialias: true
    })

    this._renderer.setClearColor(0xa19fa5, 1)
    
    this._renderer.setSize(width, height)
    this._$element.appendChild(this._renderer.domElement)

    this._camera = new THREE.PerspectiveCamera(45, width / height, 1, 100)

    this._transformControls = new TransformControls(this._camera, this._$element)
    this._scene.add(this._transformControls)
    this._orbitControls = new OrbitControls(this._camera, this._$element)

    this._orbitControls.enablePan = false
    this._orbitControls.minDistance = 10
    this._orbitControls.maxDistance = 40
    this._orbitControls.maxZoom = 1

    this._requestAnimationFrameId = null

    this._objectsToRaycast = []
    this._raycaster = new THREE.Raycaster()
    this._mouse = new THREE.Vector2(-1, -1)

    this.onUpdate = new Signal<void>()
    this.onRaycast = new Signal()
    this.onTransformControlsChange = new Signal()

    this._bindMethods()
    this._addListeners()
  }

  private _bindMethods() {
    this._handleResize = this._handleResize.bind(this)
    this._handleMouseMove = this._handleMouseMove.bind(this)
    this._handleMouseDown = this._handleMouseDown.bind(this)
    this._handleKeyDown = this._handleKeyDown.bind(this)
    this._handleKeyUp = this._handleKeyUp.bind(this)
    this._handleTransformControlsChange = this._handleTransformControlsChange.bind(this)
    this._update = this._update.bind(this)
  }

  private _addListeners() {
    window.addEventListener('resize', this._handleResize)
    this._$element.addEventListener('mousemove', this._handleMouseMove)
    this._$element.addEventListener('mousedown', this._handleMouseDown)
    document.addEventListener('keydown', this._handleKeyDown)
    document.addEventListener('keyup', this._handleKeyUp)
    this._transformControls.addEventListener('objectChange', this._handleTransformControlsChange)
  }

  private _removeListeners() {
    window.removeEventListener('resize', this._handleResize)
    this._$element.removeEventListener('mousemove', this._handleMouseMove)
    this._$element.removeEventListener('mousedown', this._handleMouseDown)
    document.removeEventListener('keydown', this._handleKeyDown)
    document.removeEventListener('keyup', this._handleKeyUp)
    this._transformControls.removeEventListener('objectChange', this._handleTransformControlsChange)
  }

  private _handleResize() {
    const { offsetWidth: width, offsetHeight: height } = this._$element

    this._renderer.setSize(width, height)

    this._camera.aspect = width / height
    this._camera.updateProjectionMatrix()
  }

  private _handleMouseMove({ clientX, clientY }: MouseEvent) {
    const x = (clientX / window.innerWidth) * 2 - 1
	  const y = -(clientY / window.innerHeight) * 2 + 1

    this._mouse.set(x, y)
  }

  private _handleMouseDown() {
    this._raycast()
  }

  private _handleKeyDown({ keyCode }: KeyboardEvent) {
    switch (keyCode) {
      case Keys.Q:
        this._transformControls.setSpace(this._transformControls.space === 'local' ? 'world' : 'local')

        break

      case Keys.SHIFT:
        this._transformControls.setTranslationSnap(0.5)
        this._transformControls.setRotationSnap(THREE.Math.degToRad(15))

        break

      case Keys.W:
        this._transformControls.setMode('translate')

        break

      case Keys.E:
        this._transformControls.setMode('rotate')

        break

      case Keys.R:
        this._transformControls.setMode('scale')

        break

      case Keys.ADD:
        this._transformControls.setSize(this._transformControls.size + 0.1)

        break

      case Keys.SUBSTRACT:
        this._transformControls.setSize(Math.max(this._transformControls.size - 0.1, 0.1))

        break
    }
  }

  private _handleKeyUp({ keyCode }: KeyboardEvent) {
    switch (keyCode) {
      case Keys.SHIFT:
        this._transformControls.setTranslationSnap(null)
        this._transformControls.setRotationSnap(null)

        break
    }
  }

  private _handleTransformControlsChange({ target: { object }}: TransformControls) {
    const { position, rotation, scale } = object

    this.onTransformControlsChange.dispatch({ position, rotation, scale })
  }

  private _raycast() {
    if (!this._objectsToRaycast.length) {
      return
    }

    this._raycaster.setFromCamera(this._mouse, this._camera)

    const intersections = this._raycaster.intersectObjects(this._objectsToRaycast)

    for (let intersection of intersections) {
      this.onRaycast.dispatch(intersection)
    }
  }

  private _update() {
    this._requestAnimationFrameId = window.requestAnimationFrame(this._update)

    this._transformControls.update()

    this.onUpdate.dispatch()

    this._render()
  }

  private _render() {
    this._renderer.render(this._scene, this._camera)
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this._camera
  }

  public start() {
    this._update()
  }

  public stop() {
    window.cancelAnimationFrame(this._requestAnimationFrameId)
  }

  public add(...objects: THREE.Object3D[]) {
    for (let object of objects) {
      this._scene.add(object)
    }
  }

  public remove(...objects: THREE.Object3D[]) {
    for (let object of objects) {
      this._scene.remove(object)
    }
  }

  public addToRaycast(...objects: THREE.Object3D[]) {
    for (let object of objects) {
      this._objectsToRaycast.push(object)
    }
  }

  public removeFromRaycast(...objects: THREE.Object3D[]) {
    for (let object of objects) {
      const i = this._objectsToRaycast.indexOf(object)

      if (i !== -1) {
        this._objectsToRaycast.splice(i, 1)
      }
    }
  }

  public attachToTransformControls(object: THREE.Object3D|null) {
    if (object === null) {
      return this._transformControls.detach()
    }
    
    this._transformControls.attach(object)
  }

  public dispose() {
    this.stop()
    this._removeListeners()
  }
}
