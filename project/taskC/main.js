import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

let camera, scene, renderer;
const molecules = [];
const catalysts = [];
const moleculeCountH2 = 10;
const moleculeCountO = 10;
const catalystCount = 3;

init();
animate();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const arButton = ARButton.createButton(renderer);
  document.body.appendChild(arButton);

  renderer.xr.addEventListener('sessionstart', () => {
    addMolecules();
    addCatalysts();
  });

  renderer.xr.addEventListener('sessionend', () => {
    removeMolecules();
    removeCatalysts();
  });

  window.addEventListener('resize', onWindowResize);
}

function createH2() {
  const group = new THREE.Group();
  group.userData.type = 'H2';

  const geometry = new THREE.SphereGeometry(0.02, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const atom1 = new THREE.Mesh(geometry, material);
  const atom2 = new THREE.Mesh(geometry, material);

  atom1.position.set(-0.03, 0, 0);
  atom2.position.set(0.03, 0, 0);

  group.add(atom1, atom2);

  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const points = [atom1.position.clone(), atom2.position.clone()];
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  group.add(line);

  group.position.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5) - 0.5);
  group.userData.velocity = randomVelocity();
  return group;
}

function createO() {
  const geometry = new THREE.SphereGeometry(0.03, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const oxygen = new THREE.Mesh(geometry, material);
  oxygen.userData.type = 'O';

  oxygen.position.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5) - 0.5);
  oxygen.userData.velocity = randomVelocity();
  return oxygen;
}

function createH2O() {
  const group = new THREE.Group();
  group.userData.type = 'H2O';

  const oxygenGeometry = new THREE.SphereGeometry(0.035, 16, 16);
  const oxygenMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const oxygen = new THREE.Mesh(oxygenGeometry, oxygenMaterial);
  oxygen.position.set(0, 0, 0);
  group.add(oxygen);

  const hydrogenGeometry = new THREE.SphereGeometry(0.015, 16, 16);
  const hydrogenMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const angle = 104.5 * Math.PI / 180;

  const h1 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
  h1.position.set(Math.sin(angle / 2) * 0.06, Math.cos(angle / 2) * 0.06, 0);
  const h2 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
  h2.position.set(-Math.sin(angle / 2) * 0.06, Math.cos(angle / 2) * 0.06, 0);
  group.add(h1, h2);

  const bondMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  group.add(createBond(oxygen.position, h1.position, bondMaterial));
  group.add(createBond(oxygen.position, h2.position, bondMaterial));

  return group;
}

function createBond(start, end, material) {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();
  const geometry = new THREE.CylinderGeometry(0.005, 0.005, length, 8);
  const bond = new THREE.Mesh(geometry, material);
  bond.position.copy(new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5));
  bond.lookAt(end);
  bond.rotateX(Math.PI / 2);
  return bond;
}

function createCatalyst() {
  const geometry = new THREE.TorusGeometry(0.05, 0.01, 8, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  const ring = new THREE.Mesh(geometry, material);
  ring.userData.type = 'catalyst';
  ring.rotation.x = Math.PI / 2;
  ring.position.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5) - 0.5);
  return ring;
}

function randomVelocity() {
  return new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );
}

function addMolecules() {
  for (let i = 0; i < moleculeCountH2; i++) {
    const h2 = createH2();
    molecules.push(h2);
    scene.add(h2);
  }
  for (let i = 0; i < moleculeCountO; i++) {
    const o = createO();
    molecules.push(o);
    scene.add(o);
  }
}

function removeMolecules() {
  molecules.forEach(m => {
    scene.remove(m);
    if (m.geometry) {
      m.geometry.dispose();
    } else {
      m.children.forEach(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
  });
  molecules.length = 0;
}

function addCatalysts() {
  for (let i = 0; i < catalystCount; i++) {
    const catalyst = createCatalyst();
    catalysts.push(catalyst);
    scene.add(catalyst);
  }
}

function removeCatalysts() {
  catalysts.forEach(c => {
    scene.remove(c);
    c.geometry.dispose();
    c.material.dispose();
  });
  catalysts.length = 0;
}

function animate() {
  renderer.setAnimationLoop(render);
}

function render() {
  updateMolecules();
  renderer.render(scene, camera);
}

function updateMolecules() {
  molecules.forEach(molecule => {
    molecule.position.add(molecule.userData.velocity);

    ['x', 'y', 'z'].forEach(axis => {
      if (molecule.position[axis] > 0.5 || molecule.position[axis] < -0.5) {
        molecule.position[axis] = THREE.MathUtils.clamp(molecule.position[axis], -0.5, 0.5);
        molecule.userData.velocity[axis] *= -1;
      }
    });
  });

  checkReactions();
}

function checkReactions() {
  for (let i = 0; i < molecules.length; i++) {
    for (let j = i + 1; j < molecules.length; j++) {
      const m1 = molecules[i];
      const m2 = molecules[j];
      const dist = m1.position.distanceTo(m2.position);

      const types = [m1.userData.type, m2.userData.type];

      const isCatalyzed = catalysts.some(cat =>
        m1.position.distanceTo(cat.position) < 0.1 ||
        m2.position.distanceTo(cat.position) < 0.1
      );

      if (dist < 0.07 && types.includes('H2') && types.includes('O') && isCatalyzed) {
        reactH2O(m1, m2);
        return;
      }
    }
  }
}

function reactH2O(m1, m2) {
  removeMolecule(m1);
  removeMolecule(m2);

  const pos = new THREE.Vector3().addVectors(m1.position, m2.position).multiplyScalar(0.5);
  const h2o = createH2O();
  h2o.position.copy(pos);
  h2o.userData.velocity = randomVelocity();
  molecules.push(h2o);
  scene.add(h2o);
}

function removeMolecule(molecule) {
  scene.remove(molecule);
  const index = molecules.indexOf(molecule);
  if (index !== -1) molecules.splice(index, 1);

  if (molecule.geometry) {
    molecule.geometry.dispose();
  } else {
    molecule.children.forEach(c => {
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    });
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
