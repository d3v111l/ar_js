import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let molecule;  // змінна для сфери

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Світло (завжди додаємо, навіть поза AR)
  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  // Додаємо кнопку AR
  const arButton = ARButton.createButton(renderer);
  document.body.appendChild(arButton);

  // Слухаємо старт XR сесії
  renderer.xr.addEventListener('sessionstart', () => {
    console.log('AR session started');
    addMolecules();
  });

  // Слухаємо кінець XR сесії
  renderer.xr.addEventListener('sessionend', () => {
    console.log('AR session ended');
    removeMolecules();
  });

  window.addEventListener('resize', onWindowResize);
}

function addMolecules() {
  if (molecule) return; // якщо вже створена — не створюємо знову

  const geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  molecule = new THREE.Mesh(geometry, material);
  molecule.position.set(0, 0, -0.5); // 0.5 метра вперед
  scene.add(molecule);
}

function removeMolecules() {
  if (molecule) {
    scene.remove(molecule);
    molecule.geometry.dispose();
    molecule.material.dispose();
    molecule = null;
  }
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
