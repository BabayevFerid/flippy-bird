import { World, GAME_STATE } from './game.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const world = new World(canvas);

function flap() {
  if (world.state === GAME_STATE.READY) world.start();
  world.bird.flap();
}

document.getElementById('startBtn').addEventListener('click', () => {
  if (world.state === GAME_STATE.READY || world.state === GAME_STATE.OVER) {
    world.reset();
    world.start();
  } else if (world.state === GAME_STATE.PAUSED) {
    world.resume();
  }
});
document.getElementById('pauseBtn').addEventListener('click', () => {
  if (world.state === GAME_STATE.RUNNING) world.pause();
  else if (world.state === GAME_STATE.PAUSED) world.resume();
});
document.getElementById('resetBtn').addEventListener('click', () => world.reset());

addEventListener('keydown', (e) => {
  if (e.code === 'Space') { e.preventDefault(); flap(); }
  if (e.key === 'p' || e.key === 'P') {
    if (world.state === GAME_STATE.RUNNING) world.pause();
    else if (world.state === GAME_STATE.PAUSED) world.resume();
  }
  if (e.key === 'r' || e.key === 'R') world.reset();
});
canvas.addEventListener('pointerdown', flap);

let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 1/20);
  last = now;
  world.update(dt);
  world.draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
