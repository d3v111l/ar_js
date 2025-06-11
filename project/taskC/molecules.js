import * as THREE from 'three';

export class Molecule {
  constructor(type, position) {
    this.type = type;
    this.position = position.clone();

    // Властивості за типом (колір, радіус)
    const typeSettings = {
      'H2': { color: 0xffffff, radius: 0.04 },
      'O2': { color: 0xff0000, radius: 0.06 },
      'H2O': { color: 0x0000ff, radius: 0.05 },
      'CO2': { color: 0x00ff00, radius: 0.06 },
    };
    const settings = typeSettings[type] || { color: 0x888888, radius: 0.05 };

    const geometry = new THREE.SphereGeometry(settings.radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color: settings.color, roughness: 0.7, metalness: 0.0 });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);

    // Випадкова швидкість руху
    this.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
      (Math.random() - 0.5) * 0.02,
    );
  }

  update(areaSize = 2) {
    this.position.add(this.velocity);

    // Відбиття від меж куба
    ['x', 'y', 'z'].forEach(axis => {
      if (this.position[axis] > areaSize / 2) {
        this.position[axis] = areaSize / 2;
        this.velocity[axis] *= -1;
      } else if (this.position[axis] < -areaSize / 2) {
        this.position[axis] = -areaSize / 2;
        this.velocity[axis] *= -1;
      }
    });

    this.mesh.position.copy(this.position);
  }
}

export class MoleculesManager {
  constructor(scene) {
    this.scene = scene;
    this.molecules = [];

    // Початковий набір молекул
    this.spawnMolecule('H2');
    this.spawnMolecule('H2');
    this.spawnMolecule('O2');
    this.spawnMolecule('CO2');
    this.spawnMolecule('H2O');

    // Додаємо їх у сцену
    this.molecules.forEach(mol => this.scene.add(mol.mesh));
  }

  spawnMolecule(type) {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2
    );
    const molecule = new Molecule(type, pos);
    this.molecules.push(molecule);
  }

  update() {
    this.molecules.forEach(mol => mol.update());
  }
}
