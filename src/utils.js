import { aabbIntersect, clamp, randInt, getBest, setBest } from './utils.js';

export const GAME_STATE = {
  READY: 'ready',
  RUNNING: 'running',
  PAUSED: 'paused',
  OVER: 'over',
};

export class Bird {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 42;
    this.h = 30;
    this.vy = 0;
    this.gravity = 1100;
    this.flapVel = -360;
    this.rotation = 0;
    this.alive = true;
  }
  rect() { return { x: this.x - this.w/2, y: this.y - this.h/2, w: this.w, h: this.h }; }
  flap() { if (this.alive) this.vy = this.flapVel; }
  update(dt, groundY) {
    this.vy += this.gravity * dt;
    this.y += this.vy * dt;
    if (this.y + this.h/2 >= groundY) {
      this.y = groundY - this.h/2;
      this.vy = 0;
      this.alive = false;
    }
    this.rotation = clamp((this.vy / 600), -0.35, 0.6);
  }
  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = '#fde047';
    ctx.fillRect(-this.w/2, -this.h/2, this.w, this.h);
    ctx.restore();
  }
}

export class PipePair {
  constructor(x, gapY, gapH, speed, world) {
    this.x = x;
    this.gapY = gapY;
    this.gapH = gapH;
    this.speed = speed;
    this.passed = false;
    this.w = 70;
    this.world = world;
  }
  get topRect() {
    return { x: this.x, y: 0, w: this.w, h: this.gapY - this.gapH/2 };
  }
  get botRect() {
    return { x: this.x, y: this.gapY + this.gapH/2, w: this.w, h: this.world.groundY - (this.gapY + this.gapH/2) };
  }
  update(dt) { this.x -= this.speed * dt; }
  offscreen() { return this.x + this.w < -10; }
  draw(ctx) {
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(this.topRect.x, this.topRect.y, this.topRect.w, this.topRect.h);
    ctx.fillRect(this.botRect.x, this.botRect.y, this.botRect.w, this.botRect.h);
  }
}

export class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = GAME_STATE.READY;
    this.width = canvas.width;
    this.height = canvas.height;
    this.groundY = this.height - 110;
    this.bird = new Bird(this.width*0.28, this.height*0.42);
    this.pipes = [];
    this.pipeTimer = 0;
    this.pipeInterval = 1.5;
    this.pipeSpeed = 180;
    this.gapH = 160;
    this.score = 0;
    this.best = getBest();
  }
  reset() {
    this.state = GAME_STATE.READY;
    this.bird = new Bird(this.width*0.28, this.height*0.42);
    this.pipes = [];
    this.pipeTimer = 0;
    this.score = 0;
  }
  start() { this.state = GAME_STATE.RUNNING; }
  pause() { this.state = GAME_STATE.PAUSED; }
  resume() { this.state = GAME_STATE.RUNNING; }
  gameOver() {
    this.state = GAME_STATE.OVER;
    if (this.score > this.best) { this.best = this.score; setBest(this.best); }
  }
  spawnPipe() {
    const margin = 60;
    const minY = margin + this.gapH/2;
    const maxY = this.groundY - margin - this.gapH/2;
    const gapY = randInt(minY, maxY);
    const x = this.width + 40;
    this.pipes.push(new PipePair(x, gapY, this.gapH, this.pipeSpeed, this));
  }
  update(dt) {
    if (this.state !== GAME_STATE.RUNNING) return;
    this.bird.update(dt, this.groundY);
    this.pipeTimer += dt;
    if (this.pipeTimer >= this.pipeInterval) {
      this.pipeTimer = 0;
      this.spawnPipe();
    }
    for (const p of this.pipes) p.update(dt);
    this.pipes = this.pipes.filter(p => !p.offscreen());
    for (const p of this.pipes) {
      if (!p.passed && p.x + p.w < this.bird.x) { p.passed = true; this.score++; }
      if (aabbIntersect(this.bird.rect(), p.topRect) || aabbIntersect(this.bird.rect(), p.botRect)) {
        this.bird.alive = false;
      }
    }
    if (!this.bird.alive) this.gameOver();
  }
  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    for (const p of this.pipes) p.draw(ctx);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
    this.bird.draw(ctx);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Xal: ${this.score}`, this.width/2, 40);
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`Rekord: ${this.best}`, this.width/2, 65);
    if (this.state === GAME_STATE.READY) ctx.fillText("Başlamaq üçün SPACE/klik", this.width/2, this.height/2);
    if (this.state === GAME_STATE.OVER) ctx.fillText("Game Over — R ilə yenidən başla", this.width/2, this.height/2);
  }
}
