// Floating bubbles background
const colors = ["#CA8DBD", "#2AA7FF", "#1B1B1B", "#8fd8ecff", "#7c6b9aff"];

const numBalls = 50;
const balls = [];

for (let i = 0; i < numBalls; i++) {
  const ball = document.createElement("div");
  ball.classList.add("ball");

  // Random style
  ball.style.background = colors[Math.floor(Math.random() * colors.length)];
  ball.style.left = `${Math.floor(Math.random() * 100)}vw`;
  ball.style.top = `${Math.floor(Math.random() * 100)}vh`;
  ball.style.transform = `scale(${Math.random()})`;

  // Random size
  const size = `${Math.random() * 1.5 + 0.5}em`;
  ball.style.width = size;
  ball.style.height = size;

  balls.push(ball);
  document.body.appendChild(ball);
}

// Animate each bubble
balls.forEach((el, i) => {
  const to = {
    x: Math.random() * (i % 2 === 0 ? -11 : 11),
    y: Math.random() * 12,
  };

  el.animate(
    [
      { transform: "translate(0, 0)" },
      { transform: `translate(${to.x}rem, ${to.y}rem)` },
    ],
    {
      duration: (Math.random() + 1) * 2000,
      direction: "alternate",
      fill: "both",
      iterations: Infinity,
      easing: "ease-in-out",
    }
  );
});
