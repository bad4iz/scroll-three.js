import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AxesHelper,
  DirectionalLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class SceneInit {
  constructor(id) {
    const canvas = document.getElementById(id);
    this._width = canvas?.width || window.innerWidth;
    this._height = canvas?.height || window.innerHeight;

    this._scene = new Scene();
    this._camera = new PerspectiveCamera(
      25,
      this._width / this._height,
      0.1,
      1000
    );
    this._animationFns = new Map();
    this._resizeFns = new Map();

    this._renderer = new WebGLRenderer({ canvas });
    // this._renderer = new WebGLRenderer();
    this._renderer.setSize(this._width, this._height);
    document.body.appendChild(this._renderer.domElement);
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);

    this._camera.position.z = 2;

    window.addEventListener("resize", () => this.onWindowResize(), false);
  }

  animate() {
    this._animationFns.forEach((fn) => fn());

    requestAnimationFrame(() => this.animate());
    this.render();
    this._controls.update();
  }

  add(object) {
    this._scene.add(object);
  }

  onWindowResize() {
    this._camera.aspect = this._width / this._height;
    this._renderer.setSize(this._width, this._height);
    this._resizeFns.forEach((fn) => fn());

    this._camera.updateProjectionMatrix();
    this.render();
  }
  render() {
    this._renderer.render(this._scene, this._camera);
  }

  addAxesHelper() {
    const axesHelper = new AxesHelper(50);
    axesHelper.setColors("red", "green", "blue");
    this.add(axesHelper);
  }
  setAnimation(key, fn) {
    this._animationFns.set(key, fn);
  }
  setResizeFns(key, fn) {
    this._resizeFns.set(key, fn);
  }
  deleteAnimation(key) {
    this._animationFns.delete(key);
  }
}
