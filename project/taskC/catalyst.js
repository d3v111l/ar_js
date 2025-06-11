import * as THREE from 'three';

export class CatalystManager {
  constructor(scene) {
    this.scene = scene;
    this.catalysts = [];

    // Додаємо каталізатор - сфера в центрі
    const geometry = new THREE.SphereGeometry(0.1, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      roughness: 0.3,
      metalness: 1.0,
      emissive: 0x888800,
      emissiveIntensity: 0.6,
    });
    this.catalystMesh = new THREE.Mesh(geometry, material);
    this.catalystMesh.position.set(0, 0, 0);
    this.scene.add(this.catalystMesh);

    this.catalysts.push(this.catalystMesh);
  }

  update() {
    // Можна додати анімацію каталізатора, якщо хочеш
    this.catalystMesh.rotation.y += 0.01;
  }
}
