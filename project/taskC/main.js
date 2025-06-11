import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
let molecules = [];

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  controller = renderer.xr.getController(0);
  scene.add(controller);

  // Створюємо молекули
  for (let i = 0; i < 5; i++) {
    const h2 = createMolecule('H2', 0x00ff00); // зелена
    const o = createMolecule('O', 0xff0000); // червона
    scene.add(h2, o);
    molecules.push(h2, o);
  }

  // Додаємо каталізатор
  const catalyst = createCatalyst();
  scene.add(catalyst);
  molecules.push(catalyst);
}

function createMolecule(type, color) {
  const geometry = new THREE.SphereGeometry(0.03, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.set(
    (Math.random() - 0.5) * 0.6,
    (Math.random() - 0.5) * 0.4 + 0.2,
    -Math.random() * 0.8 - 0.2
  );
  sphere.userData.type = type;
  return sphere;
}

function createCatalyst() {
  const geometry = new THREE.SphereGeometry(0.04, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 1, roughness: 0.3 });
  const catalyst = new THREE.Mesh(geometry, material);
  catalyst.position.set(0, 0.2, -0.5); // трохи перед камерою
  catalyst.userData.type = 'Catalyst';
  return catalyst;
}

function createH2O() {
  const group = new THREE.Group();

  const oxygen = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x3399ff }) // блакитний
  );
  group.add(oxygen);

  const h1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  h1.position.set(0.05, 0.03, 0);
  group.add(h1);

  const h2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.015, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  h2.position.set(-0.05, 0.03, 0);
  group.add(h2);

  group.userData.type = 'H2O';
  return group;
}

function checkReactions() {
  for (let i = 0; i < molecules.length; i++) {
    for (let j = i + 1; j < molecules.length; j++) {
      const mol1 = molecules[i];
      const mol2 = molecules[j];

      if (
        (mol1.userData.type === 'H2' && mol2.userData.type === 'O') ||
        (mol1.userData.type === 'O' && mol2.userData.type === 'H2')
      ) {
        const dist = mol1.position.distanceTo(mol2.position);
        if (dist < 0.1) {
          const catalystNearby = molecules.some(mol =>
            mol.userData.type === 'Catalyst' &&
            mol.position.distanceTo(mol1.position) < 0.3 &&
            mol.position.distanceTo(mol2.position) < 0.3
          );

          if (!catalystNearby) {
            document.getElementById('info').innerText = 'Реакція потребує каталізатора (Pt)';
            continue;
          }

          const h2o = createH2O();
          h2o.position.copy(mol1.position).add(mol2.position).multiplyScalar(0.5);
          scene.add(h2o);
          molecules.push(h2o);

          scene.remove(mol1, mol2);
          molecules.splice(j, 1);
          molecules.splice(i, 1);
          document.getElementById('info').innerText = 'H₂ + O → H₂O (з кат.)';
          return;
        }
      }
    }
  }
}

function animate() {
  renderer.setAnimationLoop(() => {
    molecules.forEach(mol => {
      mol.position.x += (Math.random() - 0.5) * 0.001;
      mol.position.y += (Math.random() - 0.5) * 0.001;
      mol.position.z += (Math.random() - 0.5) * 0.001;
    });

    checkReactions();
    renderer.render(scene, camera);
  });
}
