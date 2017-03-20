import * as THREE from 'three'
import * as TransformControls from 'three-transformcontrols'

export default class Scene {
  private _$element: HTMLElement

  private _scene: THREE.Scene

  private _renderer: THREE.WebGLRenderer

  private _camera: THREE.PerspectiveCamera

  private _transformControls

  private _requestAnimationFrameId: number;

  constructor($element: HTMLElement) {
    this._$element = $element

    const { offsetWidth: width, offsetHeight: height } = this._$element

    this._scene = new THREE.Scene()

    this._renderer = new THREE.WebGLRenderer()
    this._renderer.setSize(width, height)
    this._$element.appendChild(this._renderer.domElement)

    this._camera = new THREE.PerspectiveCamera(45, width / height, 1, 100)

    this._transformControls = new TransformControls(this._camera, this._$element)
    this._scene.add(this._transformControls)

    this._requestAnimationFrameId = null

    this._bindMethods()
    this._addListeners()
  }

  private _bindMethods() {
    this._handleResize = this._handleResize.bind(this)
    this._handleKeyDown = this._handleKeyDown.bind(this)
    this._handleKeyUp = this._handleKeyUp.bind(this)
    this._update = this._update.bind(this)
    this._render = this._render.bind(this)
  }

  private _addListeners() {
    window.addEventListener('resize', this._handleResize)
    document.addEventListener('keydown', this._handleKeyDown)
    document.addEventListener('keyup', this._handleKeyUp)
    this._transformControls.addEventListener('change', this._render)
  }

  private _removeListeners() {
    window.removeEventListener('resize', this._handleResize)
    document.removeEventListener('keydown', this._handleKeyDown)
    document.removeEventListener('keyup', this._handleKeyUp)
    this._transformControls.removeEventListener('change', this._render)
  }

  private _handleResize() {
    const { offsetWidth: width, offsetHeight: height } = this._$element

    this._renderer.setSize(width, height)

    this._camera.aspect = width / height
    this._camera.updateProjectionMatrix()
  }

  private _handleKeyDown({ keyCode }: KeyboardEvent) {
    switch (keyCode) {
      case 81: // Q
        this._transformControls.setSpace(this._transformControls.space === 'local' ? 'world' : 'local')

        break

      case 16: // Shift
        this._transformControls.setTranslationSnap(0.5)
        this._transformControls.setRotationSnap(THREE.Math.degToRad(15))

        break

      case 87: // W
        this._transformControls.setMode('translate')

        break

      case 69: // E
        this._transformControls.setMode('rotate')

        break

      case 82: // R
        this._transformControls.setMode('scale')

        break

      case 187:
      case 107: // +, =, num+
        this._transformControls.setSize(this._transformControls.size + 0.1)

        break

      case 189:
      case 109: // -, _, num-
        this._transformControls.setSize(Math.max(this._transformControls.size - 0.1, 0.1))

        break
    }
  }

  private _handleKeyUp({ keyCode }: KeyboardEvent) {
    switch (keyCode) {
      case 16: // Ctrl
        this._transformControls.setTranslationSnap(null)
        this._transformControls.setRotationSnap(null)

        break
    }
  }

  private _update() {
    this._requestAnimationFrameId = window.requestAnimationFrame(this._update)

    this._transformControls.update()

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

  public attachToTransformControls(object: THREE.Object3D) {
    this._transformControls.attach(object)
  }

  public clearTransformControls() {
    this._transformControls.detach()
  }

  public dispose() {
    this.stop()
  }
}
