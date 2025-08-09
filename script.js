// Glitch effect
const glitchText = document.querySelector('.glitch');
setInterval(() => {
  glitchText.style.textShadow =
    Math.random() > 0.5
      ? '2px 0 red, -2px 0 blue'
      : '-2px 0 red, 2px 0 blue';
}, 150);
