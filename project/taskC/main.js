import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { MoleculesManager } from './molecules.js';
import { ReactionsManager } from './reactions.js';
import { CatalystManager } from './catalyst.js';

let camera, scene, renderer;
let moleculesManager, reactionsManager, catalystManager;

const infoElem = document.getElementById('info');
const startBtn = document.getElementById('start-ar');

init();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', onWindowResize);

  startBtn.addEventListener('click', () => {
    startBtn.style.display = 'none';
    document.body.appendChild(ARButton.createButton(renderer));
    renderer.xr.setSession(null);
    renderer.xr.setSession(renderer.xr.getSession() || renderer.xr.getSession());
    animate();
  });

  // Ініціалізуємо менеджери
  moleculesManager = new MoleculesManager(scene);
  reactionsManager = new ReactionsManager(moleculesManager);
  catalystManager = new CatalystManager(scene);

  infoElem.textContent = 'Натисніть "Запустити AR" для початку';
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  moleculesManager.update();
  reactionsManager.update();
  catalystManager.update();

  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
