function initReactionEngine(molecules, addH2OMolecule) {
  const catalystZone = document.getElementById('catalyst');

  function isInCatalystZone(pos) {
    if (!catalystZone) return false;
    const catalystPos = catalystZone.getAttribute('position');
    const size = 0.4; // половина розміру коробки
    return (
      Math.abs(pos.x - catalystPos.x) <= size &&
      Math.abs(pos.y - catalystPos.y) <= size &&
      Math.abs(pos.z - catalystPos.z) <= size
    );
  }

  setInterval(() => {
    for (let i = 0; i < molecules.length; i++) {
      for (let j = i + 1; j < molecules.length; j++) {
        const el1 = molecules[i].el;
        const el2 = molecules[j].el;

        const pos1 = el1.getAttribute('position');
        const pos2 = el2.getAttribute('position');

        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        const inCatalyst = isInCatalystZone(pos1) || isInCatalystZone(pos2);
        const reactionDistance = inCatalyst ? 0.3 : 0.1; // в каталізаторі — більша зона

        if (dist < reactionDistance) {
          // Реакція: видалення старих, додавання нової
          el1.parentNode.removeChild(el1);
          el2.parentNode.removeChild(el2);

          const newPos = {
            x: (pos1.x + pos2.x) / 2,
            y: (pos1.y + pos2.y) / 2,
            z: (pos1.z + pos2.z) / 2
          };

          const newMolecule = addH2OMolecule(newPos);

          // Заміна у масиві
          molecules.splice(j, 1);
          molecules.splice(i, 1);
          molecules.push(newMolecule);

          return; // одну реакцію за раз
        }
      }
    }
  }, 200); // Перевірка реакцій кожні 200 мс
}
