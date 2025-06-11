import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
const molecules = []; // масив молекул
const moleculeCount = 30;

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

  // AR кнопка
  const arButton = ARButton.createButton(renderer);
  document.body.appendChild(arButton);

  renderer.xr.addEventListener('sessionstart', () => {
    console.log('AR session started');
    addMolecules();
  });

  renderer.xr.addEventListener('sessionend', () => {
    console.log('AR session ended');
    removeMolecules();
  });

  window.addEventListener('resize', onWindowResize);
}

function createMolecule() {
  // Різні кольори — різні типи молекул
  const colors = [0x00ff00, 0xff0000, 0x0000ff, 0xffff00];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const geometry = new THREE.SphereGeometry(0.03, 16, 16);
  const material = new THREE.MeshStandardMaterial({ color: color });
  const molecule = new THREE.Mesh(geometry, material);

  // Початкова позиція в межах куба 1м x 1м x 1м навколо користувача
  molecule.position.set(
    (Math.random() - 0.5),
    (Math.random() - 0.5),
    (Math.random() - 0.5) - 0.5 // трохи попереду камери
  );

  // Додамо випадовий напрямок руху (вектор швидкості)
  molecule.userData.velocity = new THREE.Vector3(
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002,
    (Math.random() - 0.5) * 0.002
  );

  return molecule;
}

function addMolecules() {
  for (let i = 0; i < moleculeCount; i++) {
    const m = createMolecule();
    molecules.push(m);
    scene.add(m);
  }
}

function removeMolecules() {
  molecules.forEach(m => {
    scene.remove(m);
    m.geometry.dispose();
    m.material.dispose();
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
  // Простий рух молекул
  molecules.forEach(molecule => {
    molecule.position.add(molecule.userData.velocity);

    // Обмеження руху в кубі [-0.5..0.5] у кожній координаті (щоб молекули не розбігалися дуже далеко)
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

  checkCollisions();
}

function checkCollisions() {
  // Перевірка зіткнень між молекулами (наївна O(n^2))
  for (let i = 0; i < molecules.length; i++) {
    for (let j = i + 1; j < molecules.length; j++) {
      const m1 = molecules[i];
      const m2 = molecules[j];
      const dist = m1.position.distanceTo(m2.position);
      if (dist < 0.06) { // якщо сфери близько (радіус ~0.03)
        react(m1, m2);
      }
    }
  }
}

function react(m1, m2) {
  // Реакція: при зіткненні молекули міняють колір на білий (проста імітація реакції)
  m1.material.color.set(0xffffff);
  m2.material.color.set(0xffffff);

  // Можна додати логіку каталітичного ефекту чи іншу зміну
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}
