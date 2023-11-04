
import { random } from './utils';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import vertexSource from "./shader/vertexShader.glsl";
import fragmentSource from "./shader/fragmentShader.glsl";
import Stats from "three/examples/jsm/libs/stats.module.js"
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

function ImagePixel(path, w, h, ratio) {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	const width = w;
	const height = h;
	canvas.width = width;
	canvas.height = height;

	ctx.drawImage(path, 0, 0);
	const data = ctx.getImageData(0, 0, width, height).data;
	const position = [];
	const color = [];
	const alpha = [];

	for (let y = 0; y < height; y += ratio) {
		for (let x = 0; x < width; x += ratio) {
			const index = (y * width + x) * 4;
			const r = data[index] / 255;
			const g = data[index + 1] / 255;
			const b = data[index + 2] / 255;
			const a = data[index + 3] / 255;

			const pX = x - width / 2;
			const pY = -(y - height / 2);
			const pZ = 0;

			position.push(pX, pY, pZ), color.push(r, g, b), alpha.push(a);
		}
	}

	return { position, color, alpha };
}

class Particle {
  constructor(scene) {
    this.scene = scene;
    this.promiseList = []
    this.pathList = [
      'images/eagle.jpg',
      'images/lion.jpg',
    ]
    this.imageList = [];

    this.particlesMesh = null;

    // this.countParticle = 0;
    
    this.randomMesh = null;
    
    this.targetPositions = {};
    this.targetCountParticles = {};

    this.clock = new THREE.Clock();
    this.uniforms = {
      uTime: {
        value: 0.0,
      },
    }
  }

  init() {
    this.promiseList = this.pathList.map((imagePath, index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = imagePath;
        img.crossOrigin = "anonymous";
  
        img.addEventListener('load', () => {
          const imagePixels = ImagePixel(img, img.width, img.height, 5.0);
          this.imageList[index] = imagePixels;
          this._setImageTargetPositions(imagePixels, index);
          resolve();
        });
      });
    });

    Promise.all(this.promiseList).then(() => {
      // this._setMesh();
      this._setRandomMesh();
      this._initParticlesMesh();
      this._setAnimation();
    })
  }

  _setImageTargetPositions(imagePixels, index) {
    const filteredPositions = [];
    const filteredColors = [];

    const positions = imagePixels.position;
    const colors = imagePixels.color;

    for (let i = 0; i < colors.length; i += 3) {
      // R成分を元にデータをフィルタリング
      if (colors[i] >= 0.3) {
        filteredPositions.push(positions[i] + random(-0.5, 0.5), positions[i + 1] + random(-0.5, 0.5), positions[i + 2]);
        filteredColors.push(colors[i], colors[i + 1], colors[i + 2]);
        // filteredAlphas.push(alphas[i / 3]);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(filteredPositions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(filteredColors, 3));

    // // ランダム要素
    const randomArray = [];
    const vertices = filteredPositions.length / 3;
    for (let i = 0; i < vertices; i++) {
      randomArray.push(random(-2.0, 2.0), random(-2.0, 2.0), random(-2.0, 2.0));
    }
    geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randomArray, 3));

    
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
      transparent: true
    });
    this.mesh = new THREE.Points(geometry, material);
    
    this.targetPositions[`image${index}`] = [...geometry.attributes.position.array];
    // パーティクル数を設定
    this.targetCountParticles[`image${index}`] = filteredPositions.length / 3;
  }

  _setRandomMesh() {
    // console.log(this.countParticle);
    const vertices = [];
    for (let i = 0; i < this.countParticle; i++) {
      const x = (Math.random() - 0.5) * (window.innerWidth * 1.5);
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * (window.innerWidth * 1.0) - 500;
      vertices.push(x, y, z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({
      // vertexColors: true,
      color: "red",
      size: 2.0
    });

    // ランダム要素
    const randomArray = [];
    for (let i = 0; i < this.countParticle; i++) {
      randomArray.push(random(-2.0, 2.0), random(-2.0, 2.0), random(-2.0, 2.0));
    }
    geometry.setAttribute('aRandom', new THREE.Float32BufferAttribute(randomArray, 3));


    this.randomMesh = new THREE.Points(geometry, material);

    this.targetPositions.random = [...geometry.attributes.position.array];

  }

  _initParticlesMesh() {
    this.particleGeometry = this.mesh.geometry;
    // this.particleGeometry = this.randomMesh.geometry;
    this.particleMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexSource,
      fragmentShader: fragmentSource,
      transparent: true,
      uniforms: this.uniforms,
    });
    this.particlesMesh = new THREE.Points(
      this.particleGeometry,
      this.particleMaterial
    );
    this.scene.add(this.particlesMesh);
  }

  _animateParticles(target) {
    const positions = this.particlesMesh.geometry.attributes.position.array;
    const targetPosition = this.targetPositions[target];
    console.log(targetPosition)

    for (let i = 0; i < targetPosition.length; i+=3) {
      // アニメーション用中間オブジェクト
      const intermediateObject = {
        x: positions[i],
        y: positions[i+1],
        z: positions[i+2]
      };

      gsap.to(intermediateObject, {
        // duration: 1.6,
        duration: 1.6 + Math.random() * 0.5, // 0.5秒のランダムな遅延
        delay: 0.0 + Math.random() * 0.5,
        // ease: "power2.inOut",
        ease: "expo.inOut",
        x: targetPosition[i],
        y: targetPosition[i+1],
        z: targetPosition[i+2],
        onUpdate: () => {
          positions[i] = intermediateObject.x;
          positions[i+1] = intermediateObject.y;
          positions[i+2] = intermediateObject.z;
          this.particlesMesh.geometry.attributes.position.needsUpdate = true;
        }
      });

    }
  }

  _setAnimation() {
    const tl1 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section02',
        start: 'top bottom',
        toggleActions: 'play none none reverse',
        // markers: true,
        onEnter: ()=> {
          // console.log('on enter');
          // this._animateParticles(this.targetPositions.image0, 'image0');
          this._animateParticles('image0');
        },
        onLeaveBack: ()=> {
          // console.log('on leaveback');
          // this._animateParticles(this.targetPositions.image1, 'image1');
          this._animateParticles('image1');
        }
      }
    });

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: '#section03',
        start: 'top bottom',
        toggleActions: 'play none none reverse',
        // markers: true,
        onEnter: ()=> {
          // console.log('on enter');
          // this._animateParticles(this.targetPositions.image1, 'image1');
          this._animateParticles('image1');
        },
        onLeaveBack: ()=> {
          // console.log('on leaveback');
          // this._animateParticles(this.targetPositions.image0, 'image0');
          this._animateParticles('image0');
        }
      }
    });

  }

  _render() {
    //
  }

  onResize() {
    //
  }

  onUpdate() {
    // this.uniforms.uTime.value += 0.02;
    const elapsedTime = this.clock.getElapsedTime();
    this.uniforms.uTime.value = elapsedTime * 0.5;

    this._render();
  }
}


class Main {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.canvas = document.querySelector(".canvas");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.viewport.width, this.viewport.height);

    this.scene = new THREE.Scene();
    this.camera = null;


    this.loader = new GLTFLoader();

    // this.randomMesh = null;

    this.surfaceMesh = null;

    this.targetPositions = {};

    this.partcle = new Particle(this.scene);
    this.partcle.init();

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this._init();
    this._update();
    this._addEvent();
  }

  _setCamera() {
    //ウインドウとWebGL座標を一致させる
    const fov = 45;
    const fovRadian = (fov / 2) * (Math.PI / 180); //視野角をラジアンに変換
    const distance = this.viewport.height / 2 / Math.tan(fovRadian); //ウインドウぴったりのカメラ距離
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.viewport.width / this.viewport.height,
      1,
      distance * 2
    );
    this.camera.position.z = distance;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    this.scene.add(this.camera);
  }


  _init() {
    this._setCamera();
  }

  _update() {
    // this.particlesMesh.rotation.y += 0.0005;
    // this.particlesMesh.rotation.x += 0.005;

    this.stats.update();

    this.partcle.onUpdate();

    //レンダリング
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._update.bind(this));
  }

  _onResize() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    // レンダラーのサイズを修正
    this.renderer.setSize(this.viewport.width, this.viewport.height);
    // カメラのアスペクト比を修正
    this.camera.aspect = this.viewport.width / this.viewport.height;
    this.camera.updateProjectionMatrix();
  }

  _addEvent() {
    window.addEventListener("resize", this._onResize.bind(this));
  }
}

new Main();



