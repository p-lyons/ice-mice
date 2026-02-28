import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

function saveCanvas(canvas, filename) {
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(ASSETS_DIR, filename), buffer);
  console.log(`Created ${filename}`);
}

// Mouse - 24x24, gray circle with ears, pink inner ears, tail
function createMouse() {
  const canvas = createCanvas(24, 24);
  const ctx = canvas.getContext('2d');

  // Tail (thin curve on right side)
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(18, 12);
  ctx.quadraticCurveTo(22, 8, 23, 4);
  ctx.stroke();

  // Body (gray circle)
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.arc(12, 12, 7, 0, Math.PI * 2);
  ctx.fill();

  // Left ear (outer gray)
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.arc(6, 5, 4, 0, Math.PI * 2);
  ctx.fill();

  // Right ear (outer gray)
  ctx.beginPath();
  ctx.arc(18, 5, 4, 0, Math.PI * 2);
  ctx.fill();

  // Left ear (inner pink)
  ctx.fillStyle = '#ffaaaa';
  ctx.beginPath();
  ctx.arc(6, 5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Right ear (inner pink)
  ctx.beginPath();
  ctx.arc(18, 5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (small black dots)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(9, 11, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(15, 11, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Nose (pink)
  ctx.fillStyle = '#ff9999';
  ctx.beginPath();
  ctx.arc(12, 14, 1.5, 0, Math.PI * 2);
  ctx.fill();

  saveCanvas(canvas, 'mouse.png');
}

// Polar Bear - 40x40, white circle with ears and black eyes
function createPolarBear() {
  const canvas = createCanvas(40, 40);
  const ctx = canvas.getContext('2d');

  // Body (large white circle)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#dddddd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(20, 22, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Left ear
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(8, 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right ear
  ctx.beginPath();
  ctx.arc(32, 10, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes (black dots - menacing)
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(14, 20, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(26, 20, 3, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#333333';
  ctx.beginPath();
  ctx.arc(20, 27, 3, 0, Math.PI * 2);
  ctx.fill();

  saveCanvas(canvas, 'polar-bear.png');
}

// Cheese - 16x16, yellow triangle with holes
function createCheese() {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext('2d');

  // Yellow wedge/triangle
  ctx.fillStyle = '#ffdd00';
  ctx.beginPath();
  ctx.moveTo(1, 14);
  ctx.lineTo(15, 14);
  ctx.lineTo(15, 2);
  ctx.closePath();
  ctx.fill();

  // Orange edge for depth
  ctx.fillStyle = '#ffaa00';
  ctx.beginPath();
  ctx.moveTo(1, 14);
  ctx.lineTo(15, 14);
  ctx.lineTo(15, 12);
  ctx.lineTo(1, 12);
  ctx.closePath();
  ctx.fill();

  // Holes (darker circles)
  ctx.fillStyle = '#cc9900';
  ctx.beginPath();
  ctx.arc(10, 8, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, 10, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(12, 11, 1, 0, Math.PI * 2);
  ctx.fill();

  saveCanvas(canvas, 'cheese.png');
}

// Ice Tile - 48x48, light blue with white streaks
function createIceTile() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Base light blue
  ctx.fillStyle = '#b3e0ff';
  ctx.fillRect(0, 0, 48, 48);

  // White streaks for ice texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;

  // Diagonal streaks
  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(15, 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(20, 25);
  ctx.lineTo(35, 18);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(8, 40);
  ctx.lineTo(20, 35);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(30, 45);
  ctx.lineTo(45, 38);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(38, 12);
  ctx.lineTo(46, 8);
  ctx.stroke();

  // Subtle border
  ctx.strokeStyle = '#99d6ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'ice-tile.png');
}

// Mouse Hole - 32x32, dark brown half-circle
function createMouseHole() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  // Dark brown half-circle (bottom half)
  ctx.fillStyle = '#3d2817';
  ctx.beginPath();
  ctx.arc(16, 32, 14, Math.PI, 0, false);
  ctx.closePath();
  ctx.fill();

  // Inner darker area for depth
  ctx.fillStyle = '#1a0f08';
  ctx.beginPath();
  ctx.arc(16, 32, 10, Math.PI, 0, false);
  ctx.closePath();
  ctx.fill();

  // Highlight arc at top
  ctx.strokeStyle = '#5c3d2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(16, 32, 13, Math.PI, 0, false);
  ctx.stroke();

  saveCanvas(canvas, 'mouse-hole.png');
}

// Snowbank - 48x48, white mound on transparent background
function createSnowbank() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // White mound shape
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, 48);
  ctx.quadraticCurveTo(8, 20, 24, 12);
  ctx.quadraticCurveTo(40, 20, 48, 48);
  ctx.closePath();
  ctx.fill();

  // Subtle shadow/depth
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.moveTo(5, 48);
  ctx.quadraticCurveTo(15, 35, 30, 30);
  ctx.quadraticCurveTo(42, 38, 48, 48);
  ctx.closePath();
  ctx.fill();

  // Light highlight on top
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(12, 22);
  ctx.quadraticCurveTo(24, 10, 36, 22);
  ctx.stroke();

  saveCanvas(canvas, 'snowbank.png');
}

// Generate all assets
console.log('Generating placeholder assets...');
createMouse();
createPolarBear();
createCheese();
createIceTile();
createMouseHole();
createSnowbank();
console.log('Done!');
