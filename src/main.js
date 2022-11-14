import { SceneInit } from "./SceneInit.js";
import * as THREE from "three";
import gsap from "gsap";
const scene = new SceneInit("myThreeJsCanvas");
scene.animate();
scene.addAxesHelper();

const planeGeometry = new THREE.PlaneGeometry(1.56, 1, 1, 1);

const loader = new THREE.TextureLoader();
const gallery = [
  "/assets/i_1.jpg",
  "/assets/i_2.png",
  "/assets/i_3.jpg",
  "/assets/i_4.jpg",
  "/assets/i_5.jpg",
];

const uniforms = {
  time: { type: "f", value: 0 },
  progress: { type: "f", value: 0 },
  accel: { type: "v2", value: new THREE.Vector2(0.5, 3) },
  texture1: {
    value: loader.load(gallery[0]),
  },
  texture2: {
    value: loader.load(gallery[1]),
  },
  pixels: { type: "v2", value: new THREE.Vector2(scene._width, scene._height) },
  uvRate1: {
    value: new THREE.Vector2(1, 1),
  },
};

const planeMaterialShader = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms,
  vertexShader: /* glsl */ `
       uniform float time;
       varying vec2 vUv;
       varying vec2 vUv1;
       varying vec4 vPosition;
       uniform float progress;
       uniform sampler2D texture1;
       uniform sampler2D texture2;
       uniform vec2 pixels;
       uniform vec2 uvRate1;
       
      void main() {
        vUv = uv;
        vec2 _uv = uv - 0.5;
        vUv1 = _uv;
        vUv1 *= uvRate1.xy;
      
        vUv1 += 0.5;
         
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
  `,
  fragmentShader: /* glsl */ `
    uniform float time;
    uniform float progress;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform vec2 pixels;
    uniform vec2 uvRate1;
    uniform vec2 accel;
    
    varying vec2 vUv;
    varying vec2 vUv1;
    varying vec4 vPosition;
    
    vec2 mirrored(vec2 v) {
      vec2 m = mod(v,2.);
      return mix(m,2.0 - m, step(1.0 ,m));
    }

    float tri(float p) {
      return mix(p,1.0 - p, step(0.5 ,p))*2.;
    }

    
    void main(void) {
        vec2 uv = gl_FragCoord.xy/pixels.xy;
        float p = fract(progress);
       float delayValue = p*7. - uv.y*2. + uv.x - 2.;
        delayValue = clamp(delayValue,0.0,1.0);
        
        vec2 translateValue = p + delayValue*accel;
        vec2 translateValue1 = vec2(-0.5,1.)* translateValue;
        vec2 translateValue2 = vec2(-0.5,1.)* (translateValue - 1. - accel);

        vec2 w = sin( sin(time)*vec2(0,0.3) + vUv.yx*vec2(0,4.))*vec2(0,0.5);
        vec2 xy = w*(tri(p)*0.5 + tri(delayValue)*0.5);

        vec2 uv1 = vUv1 + translateValue1 + xy;
        vec2 uv2 = vUv1 + translateValue2 + xy;

        vec4 rgba1 = texture2D(texture1,mirrored(uv1));
        vec4 rgba2 = texture2D(texture2,mirrored(uv2));

        vec4 rgba = mix(rgba1,rgba2,delayValue);
        gl_FragColor = rgba;
    }
    `,
  // wireframe: true,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterialShader);
scene.add(planeMesh);
scene.setResizeFns("planeCamera", () => {
  const dist = scene._camera.position.z - planeMesh.position.z;
  const height = 1;
  scene._camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));
});

scene.setAnimation("plane", () => {
  const dist = scene._camera.position.z - planeMesh.position.z;
  const height = 1;
  scene._camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * dist));
  scene._camera.updateProjectionMatrix();

  // uniforms.pixels: {type: 'v2',value: new THREE.Vector2(scene._width, scene._height)}
});

// let tl = gsap.timeline({ defaults: { duration: 2 } });
// document.body.addEventListener("click", () => {
//   if (document.body.classList.contains("done")) {
//     tl.to(planeMaterialShader.uniforms.progress, {
//       value: 0.0,
//     });
//     document.body.classList.remove("done");
//   } else {
//     tl.to(planeMaterialShader.uniforms.progress, {
//       value: 1.0,
//     });
//     document.body.classList.add("done");
//   }
// });

/// SCROLL MAGIC
let speed = 0;
let position = 0;
document.addEventListener("wheel", function (event) {
  speed += event.deltaY * 0.0003;
});

function raf() {
  position += speed;
  speed *= 0.7;

  let i = Math.round(position);
  let dif = i - position;

  // dif = dif < 0 ? Math.max(dif, -0.02) : Math.max(dif, +0.03);

  position += dif * 0.035;
  if (Math.abs(i - position) < 0.001) {
    position = i;
  }

  // tl1.set(".dot", { y: position * 200 });
  uniforms.progress.value = position;

  const curslide = Math.abs(
    (Math.floor(position) - 1 + gallery.length) % gallery.length
  );
  let nextslide = Math.abs(
    (((Math.floor(position) + 1) % gallery.length) - 1 + gallery.length) %
      gallery.length
  );

  if (nextslide === curslide) {
    nextslide--;
  }

  uniforms.texture1.value = loader.load(gallery[curslide]);
  uniforms.texture2.value = loader.load(gallery[nextslide]);

  window.requestAnimationFrame(raf);
}
raf();
