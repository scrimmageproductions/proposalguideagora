export function initPepperoniRain() {
  const canvas = document.getElementById('pepperoni-canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const pepperonis = [];
  const pepperoniCount = 30;

  class Pepperoni {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = Math.random() * 15 + 10;
      this.speed = Math.random() * 2 + 1;
      this.swing = Math.random() * 2;
      this.swingSpeed = Math.random() * 0.03 + 0.01;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.05;
    }

    update() {
      this.y += this.speed;
      this.x += Math.sin(this.y * this.swingSpeed) * this.swing;
      this.rotation += this.rotationSpeed;

      if (this.y > canvas.height + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      ctx.fillStyle = '#C8102E';
      ctx.beginPath();
      ctx.arc(0, 0, this.size, 0, Math.PI * 2);
      ctx.fill();

      const spots = 5;
      ctx.fillStyle = '#8B0000';
      for (let i = 0; i < spots; i++) {
        const angle = (Math.PI * 2 * i) / spots;
        const spotX = Math.cos(angle) * (this.size * 0.4);
        const spotY = Math.sin(angle) * (this.size * 0.4);
        const spotSize = this.size * 0.2;

        ctx.beginPath();
        ctx.arc(spotX, spotY, spotSize, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < pepperoniCount; i++) {
    pepperonis.push(new Pepperoni());
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pepperonis.forEach(pepperoni => {
      pepperoni.update();
      pepperoni.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}
