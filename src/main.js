import "./style.css";
import { SceneInit } from "./SceneInit.js";
import * as THREE from "three";
import gsap from "gsap";
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from "html-to-image";
import html2canvas from "html2canvas";

const scene = new SceneInit("myThreeJsCanvas", {
  // height: 1216,
  // width: 728,
  // aspect: 1216 / 728,
});
scene.animate();
// scene.addAxesHelper();
const planeGeometry = new THREE.PlaneGeometry(1.6, 1, 100, 100);

const loader = new THREE.TextureLoader();
const content = document.querySelector("#three-js-carousel");
const gallery = [...content.querySelectorAll(".carousel-three-js__img")].map(
  (item) => {
    return item.src;
  }
);
const textArr = [];

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
  pixels: { type: "v2", value: new THREE.Vector2(1136, 728) },
  uvRate1: {
    value: new THREE.Vector2(1, 1),
  },
};

const planeText = new THREE.PlaneGeometry(0.55 * 1.3, 0.424 * 1.18, 1, 1);

const materialText = new THREE.MeshBasicMaterial({
  map: loader.load(textArr[0]),
});

const planeMeshText = new THREE.Mesh(planeText, materialText);
planeMeshText.position.x = -0.47;
planeMeshText.position.z = 0.01;
scene.add(planeMeshText);

[...content.querySelectorAll(".carousel-three-js-text")].map((item, idx) => {
  toPng(item)
    .then(function (dataUrl) {
      const img = new Image();
      img.src = dataUrl;
      img.addEventListener("load", function (event) {
        textArr[idx] = img.src;
        planeMeshText.material.map = loader.load(textArr[0]);
      });
    })
    .catch(function (error) {
      console.error("oops, something went wrong!", error);
    });
});

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
        // gl_FragColor = vec4(0.0, 1.0, 0.0,1.0);
    }
    `,
  // wireframe: true,
});

const planeMesh = new THREE.Mesh(planeGeometry, planeMaterialShader);
scene.add(planeMesh);
planeMesh.position.x = 0.07;

let tl = gsap.timeline({ defaults: { duration: 1 } });
let tl2 = gsap.timeline({
  defaults: { duration: 1, ease: "elastic.out(1, 0.3)" },
});

const itemsCarousel = [
  ...document.querySelectorAll(".carousel-three-js__item"),
];

let position = 2;
document.body.addEventListener("click", () => {
  const curSlide = Math.abs((position - 1 + gallery.length) % gallery.length);
  let nextSlide = Math.abs(
    (((position + 1) % gallery.length) - 1 + gallery.length) % gallery.length
  );

  if (nextSlide === curSlide) {
    nextSlide--;
  }

  const curItemCarousel = itemsCarousel[curSlide - 1];
  const nextItemCarousel = itemsCarousel[curSlide];
  tl
    //     .to("#three-js-carousel", {
    //   opacity: 0,
    //   duration: 0.3,
    // })
    .to(planeMaterialShader.uniforms.progress, {
      value: 1.0,
    })
    // .to(curItemCarousel, {
    //   opacity: 0,
    //   duration: 0,
    // })
    // .to(nextItemCarousel, {
    //   opacity: 1,
    //   duration: 0,
    // })
    .to(planeMaterialShader.uniforms.texture1, 0.0, {
      value: loader.load(gallery[curSlide]),
    })
    .to(planeMaterialShader.uniforms.texture2, 0, {
      value: loader.load(gallery[nextSlide]),
    })
    .to(planeMaterialShader.uniforms.progress, 0.0, {
      value: 0.0,
    });

  tl2
    .to(planeMeshText.position, {
      y: 1,
    })
    .to(planeMeshText.material, {
      map: loader.load(textArr[curSlide]),
      duration: 0.1,
    })
    .to(planeMeshText.material, {
      needsUpdate: true,
      duration: 0.1,
    })
    .to(planeMeshText.position, {
      y: 0,
    });
  // .to(nextItemCarousel, {
  //   opacity: 1,
  //   duration: 0,
  // })
  // .to("#three-js-carousel", {
  //   opacity: 1,
  //   duration: 0.3,
  //   ease: "power1.out",
  // });

  position++;
});
