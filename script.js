// Particles
particlesJS("particles-js", {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: "#ff003c" },
    shape: { type: "circle" },
    opacity: { value: 0.5 },
    size: { value: 3, random: true },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ff003c",
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 3,
      out_mode: "out",
    },
  },
  interactivity: {
    events: {
      onhover: { enable: true, mode: "grab" },
      onclick: { enable: true, mode: "push" },
    },
    modes: {
      grab: { distance: 200, line_linked: { opacity: 1 } },
      push: { particles_nb: 4 },
    },
  },
  retina_detect: true,
});

// Typewriter
const text = "Welcome to the official website of Tenseroid";
let index = 0;
function typeEffect() {
  if (index < text.length) {
    document.getElementById("typewriter-text").textContent += text.charAt(index);
    index++;
    setTimeout(typeEffect, 50);
  }
}
typeEffect();

// Anime Quotes
const quotes = [
  '"A lesson without pain is meaningless." – Edward Elric',
  '"Power comes in response to a need, not a desire." – Goku',
  '"I am justice! I protect the innocent!" – Light Yagami (lol)',
  '"Fear is not evil. It tells you what your weakness is." – Gildarts',
  '"Give up on your dreams and just die" – Levi Ackerman (bauna)'
];
setInterval(() => {
  const quoteBox = document.getElementById("quote-box");
  quoteBox.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}, 10000);

// Easter Egg
let typed = '';
window.addEventListener('keypress', e => {
  typed += e.key.toLowerCase();
  if (typed.includes("aizen")) {
    alert("🎴 Bankai Activated: Kyōka Suigetsu 🌙");
    typed = '';
  }
});
