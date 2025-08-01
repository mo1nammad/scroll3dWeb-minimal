import * as THREE from "three";
import { GUI } from "lil-gui";
import gsap from "gsap";
const gui = new GUI();
// scene
const scene = new THREE.Scene();

const Sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  75,
  Sizes.width / Sizes.height,
  0.05,
  100
);
const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
cameraGroup.position.set(0, 0, 3);

scene.add(cameraGroup);

// renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(Sizes.width, Sizes.height);
document.body.appendChild(renderer.domElement);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * textures
 */
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

/**
 * objects
 */

const parameters = {
  color: "#fb4dfe",
};
const ObjectsGap = 4;

const toonMaterial = new THREE.MeshToonMaterial({
  color: parameters.color,
  gradientMap: gradientTexture,
});

const mesh1 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  toonMaterial
);

const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), toonMaterial);

const mesh3 = new THREE.Mesh(
  new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
  toonMaterial
);

mesh1.position.y = ObjectsGap * 0;
mesh2.position.y = -ObjectsGap * 1;
mesh3.position.y = -ObjectsGap * 2;

mesh1.position.x = 1.5;
mesh2.position.x = -1.5;
mesh3.position.x = 1.5;

const meshs = [mesh1, mesh2, mesh3];

scene.add(...meshs);

// particles
const particleCounts = 400;
const particlePositions = new Float32Array(particleCounts * 3);
const particleGeometry = new THREE.BufferGeometry();

for (let i = 0; i < particleCounts; i++) {
  // loop each vertice
  const i3 = i * 3;

  particlePositions[i3] = (Math.random() - 0.5) * 15;
  particlePositions[i3 + 1] =
    ObjectsGap - Math.random() * ObjectsGap * (meshs.length + 1);
  particlePositions[i3 + 2] = (Math.random() - 0.5) * 15;
}

particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);

// points
const particle = new THREE.Points(
  particleGeometry,
  new THREE.PointsMaterial({
    size: 0.02,
    sizeAttenuation: true,
    color: parameters.color,
  })
);
particle.position.z = -2;
scene.add(particle);
// scroll
let scrollY = window.scrollY;
let maxScrollY =
  document.documentElement.scrollHeight - document.documentElement.clientHeight;

let currentSection = 0;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  maxScrollY =
    document.documentElement.scrollHeight -
    document.documentElement.clientHeight;

  const scrollSection = Math.round(scrollY / Sizes.height);

  if (scrollSection !== currentSection) {
    currentSection = scrollSection;
    gsap.to(meshs[currentSection].rotation, {
      duration: 1.5,
      x: "+=6",
      y: "+=3",
      z: "+=1.5",
    });
  }
});

// cursor
const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (ev) => {
  cursor.x = ev.clientX / Sizes.width - 0.5;
  cursor.y = ev.clientY / Sizes.height - 0.5;
});

// animations

function animateMeshes(delta) {
  for (const mesh of meshs) {
    mesh.rotation.x += delta * 0.2;
    mesh.rotation.y += delta * 0.12;
  }
}

gui.addColor(parameters, "color").onChange((color) => {
  toonMaterial.color.set(color);
  particle.material.color.set(color);
});

window.addEventListener("resize", () => {
  Sizes.width = window.innerWidth;
  Sizes.height = window.innerHeight;

  camera.aspect = Sizes.width / Sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(Sizes.width, Sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

const clock = new THREE.Clock();
const targetCameraPos = { x: 0, y: 0 };
function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();
  animateMeshes(delta);

  // scroll
  const scrollCount = (scrollY / maxScrollY) * mesh3.position.y;
  cameraGroup.position.y = scrollCount;

  targetCameraPos.x += (cursor.x - targetCameraPos.x) * delta * 2;
  targetCameraPos.y += (-cursor.y - targetCameraPos.y) * delta * 2;

  camera.position.x = targetCameraPos.x;
  camera.position.y = targetCameraPos.y;

  // particle
  particle.rotation.y = elapsed * Math.PI * 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
