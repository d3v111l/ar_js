export class ReactionsManager {
  constructor(moleculesManager) {
    this.moleculesManager = moleculesManager;
    this.reactionDistance = 0.1; // Відстань для реакції
  }

  update() {
    const mols = this.moleculesManager.molecules;

    // Простий перебір пар
    for (let i = 0; i < mols.length; i++) {
      for (let j = i + 1; j < mols.length; j++) {
        const m1 = mols[i];
        const m2 = mols[j];

        const dist = m1.position.distanceTo(m2.position);

        if (dist < this.reactionDistance) {
          this.tryReact(m1, m2, i, j);
        }
      }
    }
  }

  tryReact(m1, m2, i, j) {
    // Приклад реакції: 2H2 + O2 -> 2H2O (спрощено)
    // Реалізуємо просту реакцію при зіткненні H2 і O2: обидві видаляються, додаються H2O

    if (
      (m1.type === 'H2' && m2.type === 'O2') ||
      (m2.type === 'H2' && m1.type === 'O2')
    ) {
      // Видаляємо обидві молекули
      this.moleculesManager.molecules.splice(j, 1);
      this.moleculesManager.molecules.splice(i, 1);

      this.moleculesManager.scene.remove(m1.mesh);
      this.moleculesManager.scene.remove(m2.mesh);

      // Додаємо дві молекули води поруч з позицією реакції
      for(let n=0; n<2; n++) {
        this.moleculesManager.spawnMolecule('H2O');
      }
    }
  }
}
