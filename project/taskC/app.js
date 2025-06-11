// app.js

window.addEventListener('DOMContentLoaded', () => {
  const scene = document.querySelector('a-scene');

  const molecules = [];
  const count = 5;

  // Створення початкових молекул
  for (let i = 0; i < count; i++) {
    const pos = {
      x: Math.random() * 1 - 0.5,
      y: Math.random() * 1 + 0.5,
      z: Math.random() * -1.5 - 0.5
    };

    const molecule = MoleculeFactory.createH2OMolecule(pos);
    scene.appendChild(molecule);

    molecules.push({
      el: molecule,
      velocity: {
        x: (Math.random() - 0.5) * 0.002,
        y: (Math.random() - 0.5) * 0.002,
        z: (Math.random() - 0.5) * 0.002
      }
    });
  }

  // Додавання нової молекули (використовується в реакції)
  function addH2OMolecule(position) {
    const el = MoleculeFactory.createH2OMolecule(position);
    const velocity = {
      x: (Math.random() - 0.5) * 0.002,
      y: (Math.random() - 0.5) * 0.002,
      z: (Math.random() - 0.5) * 0.002
    };
    scene.appendChild(el);
    return { el, velocity };
  }

  // Рух молекул
  scene.addEventListener('renderstart', () => {
    scene.addEventListener('tick', () => {
      molecules.forEach(obj => {
        const el = obj.el;
        const vel = obj.velocity;
        const pos = el.getAttribute('position');

        pos.x += vel.x;
        pos.y += vel.y;
        pos.z += vel.z;

        // Відбиття від меж
        if (pos.x > 1 || pos.x < -1) vel.x *= -1;
        if (pos.y > 2 || pos.y < 0.3) vel.y *= -1;
        if (pos.z > -0.2 || pos.z < -2.5) vel.z *= -1;

        el.setAttribute('position', pos);
      });
    });
  });

  // Запуск реакційного рушія
  initReactionEngine(molecules, addH2OMolecule);
});
