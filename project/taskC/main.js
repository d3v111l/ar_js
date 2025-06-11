import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';

let camera, scene, renderer;
const molecules = [];
const moleculeCountH2 = 10;
const moleculeCountO = 10;

init();
animate();

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 0.01, 20);

  renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  const arButton = ARButton.createButton(renderer);
  document.body.appendChild(arButton);

  renderer.xr.addEventListener('sessionstart', () => {
    addMolecules();
  });

  renderer.xr.addEventListener('sessionend', () => {
    removeMolecules();
  });

  window.addEventListener('resize', onWindowResize);
}

function createH2() {
  // Група з двох білих сфер, зв’язок - лінія
  const group = new THREE.Group();
  group.userData.type = 'H2';

  const geometry = new THREE.SphereGeometry(0.02, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

  const atom1 = new THREE.Mesh(geometry, material);
  const atom2 = new THREE.Mesh(geometry, material);

  atom1.position.set(-0.03, 0, 0);
  atom2.position.set(0.03, 0, 0);

  group.add(atom1);
  group.add(atom2);

  // Лінія між атомами
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const points = [];
  points.push(atom1.position);
  points.push(atom2.position);
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  group.add(line);

  group.position.set(
    (Math.random() - 0.5),
    (Math.random() - 0.5),
    (Math.random() - 0.5) - 0.5
  );

  group.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

  return group;
}

function createO() {
  const geometry = new THREE.SphereGeometry(0.03, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // червоний кисень
  const oxygen = new THREE.Mesh(geometry, material);
  oxygen.userData.type = 'O';

  oxygen.position.set(
    (Math.random() - 0.5),
    (Math.random() - 0.5),
    (Math.random() - 0.5) - 0.5
  );

  oxygen.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

  return oxygen;
}

function createH2O() {
  const group = new THREE.Group();
  group.userData.type = 'H2O';

  // Кисень (червоний, більший)
  const oxygenGeometry = new THREE.SphereGeometry(0.035, 16, 16);
  const oxygenMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const oxygen = new THREE.Mesh(oxygenGeometry, oxygenMaterial);
  oxygen.position.set(0, 0, 0);
  group.add(oxygen);

  // Водні атоми (білі, менші)
  const hydrogenGeometry = new THREE.SphereGeometry(0.015, 16, 16);
  const hydrogenMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });

  // Кут між H-O-H ~104.5° (приблизно 1.82 радіан)
  const angle = 104.5 * Math.PI / 180; 

  // Водень 1
  const h1 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
  h1.position.set(Math.sin(angle / 2) * 0.06, Math.cos(angle / 2) * 0.06, 0);
  group.add(h1);

  // Водень 2
  const h2 = new THREE.Mesh(hydrogenGeometry, hydrogenMaterial);
  h2.position.set(-Math.sin(angle / 2) * 0.06, Math.cos(angle / 2) * 0.06, 0);
  group.add(h2);

  // Зв’язки — циліндри (тонкі)
  const bondMaterial = new THREE.MeshStandardMaterial({ color: 0xcccccc });
  const bondRadius = 0.005;
  const bondLength = 0.06;

  // Функція для створення циліндра між двома точками
  function createBond(start, end) {
    const dir = new THREE.Vector3().subVectors(end, start);
    const length = dir.length();
    const bondGeometry = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 8);
    
    const bond = new THREE.Mesh(bondGeometry, bondMaterial);

    // Позиція - середина між start і end
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    bond.position.copy(midPoint);

    // Орієнтація циліндра по напрямку вектора dir
    bond.lookAt(end);
    bond.rotateX(Math.PI / 2);

    return bond;
  }

  // Зв’язок O-H1
  group.add(createBond(oxygen.position, h1.position));
  // Зв’язок O-H2
  group.add(createBond(oxygen.position, h2.position));

  return group;
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
      // якщо група, очищаємо кожен дочірній елемент
      m.children.forEach(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) c.material.dispose();
      });
    }
  });
  molecules.length = 0;
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

    ['x','y','z'].forEach(axis => {
      if (molecule.position[axis] > 0.5) {
        molecule.position[axis] = 0.5;
        molecule.userData.velocity[axis] *= -1;
      }
      if (molecule.position[axis] < -0.5) {
        molecule.position[axis] = -0.5;
        molecule.userData.velocity[axis] *= -1;
      }
    });
  });

  checkReactions();
}

function checkReactions() {
  // Перевіряємо чи H2 + O зустрілись і створюємо H2O
  for (let i = 0; i < molecules.length; i++) {
    for (let j = i + 1; j < molecules.length; j++) {
      const m1 = molecules[i];
      const m2 = molecules[j];
      const dist = m1.position.distanceTo(m2.position);

      if (dist < 0.07) {
        const types = [m1.userData.type, m2.userData.type];
        if (types.includes('H2') && types.includes('O')) {
          // Реакція!
          reactH2O(m1, m2);
          return; // зробимо одну реакцію за кадр для плавності
        }
      }
    }
  }
}

function reactH2O(m1, m2) {
  // Видаляємо молекули H2 та O зі сцени і масиву
  removeMolecule(m1);
  removeMolecule(m2);

  // Створюємо нову H2O молекулу в позиції приблизно між двома реактивами
  const pos = new THREE.Vector3().addVectors(m1.position, m2.position).multiplyScalar(0.5);
  const h2o = createH2O();
  h2o.position.copy(pos);
  h2o.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

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
