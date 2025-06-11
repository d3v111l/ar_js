import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Світло
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Тестова молекула (зелена сфера)
  const geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const molecule = new THREE.Mesh(geometry, material);
  molecule.position.set(0, 0, -0.5); // 0.5м перед камерою
  scene.add(molecule);

  // Додаємо кнопку запуску AR
  document.body.appendChild(ARButton.createButton(renderer));

  window.addEventListener('resize', onWindowResize);
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
