* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 0;
  font-family: 'Orbitron', sans-serif;
  background: radial-gradient(circle, #0d0d0d 0%, #000000 100%);
  overflow: hidden;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #ff003c;
}
.glitch-text {
  font-size: 3em;
  margin-bottom: 10px;
  text-shadow: 0 0 20px #ff003c, 0 0 40px #ff003c;
  animation: glitch 1s infinite;
}
@keyframes glitch {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}
.typewriter {
  font-size: 1.2em;
  color: #fff;
  margin-bottom: 25px;
  white-space: pre-wrap;
  text-align: center;
}
.btn-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15px;
  z-index: 10;
}
.btn {
  padding: 12px 25px;
  background-color: transparent;
  border: 2px solid #ff003c;
  border-radius: 50px;
  color: #ff003c;
  font-size: 1em;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  text-align: center;
  position: relative;
}
.btn:hover {
  background-color: #ff003c;
  color: #000;
  transform: scale(1.1);
  box-shadow: 0 0 20px #ff003c, 0 0 40px #ff003c;
}
.footer {
  position: absolute;
  bottom: 15px;
  font-size: 0.9em;
  opacity: 0.7;
  color: #ff003c;
  z-index: 10;
}
#particles-js {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 0;
  top: 0;
  left: 0;
}
.quote {
  margin-top: 30px;
  font-size: 1em;
  color: #aaa;
  opacity: 0.8;
  text-align: center;
  max-width: 80%;
}
