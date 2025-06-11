// Файл: components/molecule.js

/**
 * Створює сферичний атом
 * @param {string} type - Назва елемента (наприклад, "H", "O")
 * @param {object} position - {x, y, z}
 * @returns {A-Entity}
 */
function createAtom(type, position) {
  const atom = document.createElement('a-sphere');
  atom.setAttribute('radius', type === 'H' ? 0.07 : 0.1);
  atom.setAttribute('color', getColor(type));
  atom.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
  return atom;
}

/**
 * Створює зв’язок (циліндр) між двома точками
 * @param {object} start - {x, y, z}
 * @param {object} end - {x, y, z}
 * @returns {A-Entity}
 */
function createBond(start, end) {
  const bond = document.createElement('a-cylinder');

  // Обчислюємо середину
  const mid = {
    x: (start.x + end.x) / 2,
    y: (start.y + end.y) / 2,
    z: (start.z + end.z) / 2,
  };

  // Довжина зв'язку
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const length = Math.sqrt(dx*dx + dy*dy + dz*dz);

  // Вектор напрямку
  const direction = new THREE.Vector3(dx, dy, dz).normalize();
  const axis = new THREE.Vector3(0, 1, 0);
  const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, direction);
  const rotation = new THREE.Euler().setFromQuaternion(quaternion, 'XYZ');

  bond.setAttribute('position', `${mid.x} ${mid.y} ${mid.z}`);
  bond.setAttribute('height', length);
  bond.setAttribute('radius', 0.01);
  bond.setAttribute('color', 'gray');
  bond.setAttribute('rotation', `${THREE.MathUtils.radToDeg(rotation.x)} ${THREE.MathUtils.radToDeg(rotation.y)} ${THREE.MathUtils.radToDeg(rotation.z)}`);
  
  return bond;
}

/**
 * Створює молекулу води (H2O)
 * @param {object} position - {x, y, z}
 * @returns {A-Entity}
 */
function createH2OMolecule(position) {
  const group = document.createElement('a-entity');

  // Відносні координати
  const oPos = { x: 0, y: 0, z: 0 };
  const h1Pos = { x: 0.2, y: 0.1, z: 0 };
  const h2Pos = { x: -0.2, y: 0.1, z: 0 };

  const offset = position || { x: 0, y: 0, z: -1 };

  function addOffset(p) {
    return {
      x: p.x + offset.x,
      y: p.y + offset.y,
      z: p.z + offset.z
    };
  }

  group.appendChild(createAtom("O", addOffset(oPos)));
  group.appendChild(createAtom("H", addOffset(h1Pos)));
  group.appendChild(createAtom("H", addOffset(h2Pos)));
  group.appendChild(createBond(addOffset(oPos), addOffset(h1Pos)));
  group.appendChild(createBond(addOffset(oPos), addOffset(h2Pos)));

  return group;
}

/**
 * Визначає колір атома за типом
 */
function getColor(type) {
  switch (type) {
    case 'H': return 'white';
    case 'O': return 'red';
    case 'C': return 'black';
    case 'N': return 'blue';
    default: return 'gray';
  }
}

// === Експорт ===
window.MoleculeFactory = {
  createH2OMolecule
};
