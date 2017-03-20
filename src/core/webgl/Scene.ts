import * as THREE from 'three'

export default class Scene {
  private _$element: HTMLElement

  private _scene: THREE.Scene

  private _renderer: THREE.WebGLRenderer

  private _camera: THREE.PerspectiveCamera

  private _requestAnimationFrameId: number;

  constructor($element: HTMLElement) {
    this._$element = $element

    const { offsetWidth: width, offsetHeight: height } = this._$element

    this._scene = new THREE.Scene()

    this._renderer = new THREE.WebGLRenderer()
    this._renderer.setSize(width, height)
    this._$element.appendChild(this._renderer.domElement)

    this._camera = new THREE.PerspectiveCamera(45, width / height, 1, 100)

    this._requestAnimationFrameId = null

    this._bindMethods()
    this._addListeners()
  }

  private _bindMethods() {
    this._handleResize = this._handleResize.bind(this)
    this._update = this._update.bind(this)
  }

  private _addListeners() {
    window.addEventListener('resize', this._handleResize)
  }

  private _removeListeners() {
    window.removeEventListener('resize', this._handleResize)
  }

  private _handleResize() {
    const { offsetWidth: width, offsetHeight: height } = this._$element

    this._renderer.setSize(width, height)

    this._camera.aspect = width / height
    this._camera.updateProjectionMatrix()
  }

  private _update() {
    this._requestAnimationFrameId = window.requestAnimationFrame(this._update)

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

  public dispose() {
    this.stop()
  }
}
