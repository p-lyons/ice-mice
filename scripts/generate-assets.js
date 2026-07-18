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

// Cracking Ice - 48x48, ice tile with subtle crack lines
function createCrackingIce() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Base light blue (same as ice tile)
  ctx.fillStyle = '#b3e0ff';
  ctx.fillRect(0, 0, 48, 48);

  // White streaks for ice texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(15, 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(30, 45);
  ctx.lineTo(45, 38);
  ctx.stroke();

  // Subtle crack lines (darker blue, thin)
  ctx.strokeStyle = 'rgba(100, 160, 200, 0.6)';
  ctx.lineWidth = 1;

  // Central crack pattern
  ctx.beginPath();
  ctx.moveTo(24, 20);
  ctx.lineTo(20, 28);
  ctx.lineTo(26, 32);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, 20);
  ctx.lineTo(30, 24);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(20, 28);
  ctx.lineTo(14, 26);
  ctx.stroke();

  // Subtle border
  ctx.strokeStyle = '#99d6ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'cracking-ice.png');
}

// Cracked Ice - 48x48, ice tile with prominent cracks
function createCrackedIce() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Base light blue (slightly darker to show stress)
  ctx.fillStyle = '#a0d4f5';
  ctx.fillRect(0, 0, 48, 48);

  // White streaks (fewer, ice is damaged)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(5, 8);
  ctx.lineTo(12, 5);
  ctx.stroke();

  // Prominent crack lines (darker, thicker)
  ctx.strokeStyle = 'rgba(60, 120, 160, 0.9)';
  ctx.lineWidth = 2;

  // Main crack from center radiating out
  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.lineTo(18, 14);
  ctx.lineTo(10, 8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.lineTo(34, 16);
  ctx.lineTo(42, 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.lineTo(16, 32);
  ctx.lineTo(8, 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.lineTo(32, 30);
  ctx.lineTo(40, 38);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(24, 24);
  ctx.lineTo(24, 36);
  ctx.lineTo(22, 46);
  ctx.stroke();

  // Secondary cracks
  ctx.strokeStyle = 'rgba(60, 120, 160, 0.6)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(18, 14);
  ctx.lineTo(24, 10);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(16, 32);
  ctx.lineTo(10, 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(32, 30);
  ctx.lineTo(38, 26);
  ctx.stroke();

  // Danger border (subtle red tint)
  ctx.strokeStyle = '#8090a0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'cracked-ice.png');
}

// Water Hole - 48x48, dark water where ice broke
function createWaterHole() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Dark water background
  ctx.fillStyle = '#1a3a5c';
  ctx.fillRect(0, 0, 48, 48);

  // Darker center
  ctx.fillStyle = '#0f2840';
  ctx.beginPath();
  ctx.ellipse(24, 24, 18, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water ripple effects
  ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(24, 24, 12, 10, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(24, 24, 8, 6, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Broken ice edges around the hole
  ctx.fillStyle = '#80c0e0';

  // Top edge fragments
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(14, 0);
  ctx.lineTo(10, 6);
  ctx.lineTo(4, 4);
  ctx.lineTo(0, 8);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(34, 0);
  ctx.lineTo(48, 0);
  ctx.lineTo(48, 10);
  ctx.lineTo(42, 6);
  ctx.lineTo(38, 8);
  ctx.closePath();
  ctx.fill();

  // Bottom edge fragments
  ctx.beginPath();
  ctx.moveTo(0, 40);
  ctx.lineTo(6, 42);
  ctx.lineTo(12, 48);
  ctx.lineTo(0, 48);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(36, 48);
  ctx.lineTo(42, 44);
  ctx.lineTo(48, 42);
  ctx.lineTo(48, 48);
  ctx.closePath();
  ctx.fill();

  // Side fragments
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(4, 22);
  ctx.lineTo(2, 28);
  ctx.lineTo(0, 30);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(48, 20);
  ctx.lineTo(44, 24);
  ctx.lineTo(46, 30);
  ctx.lineTo(48, 32);
  ctx.closePath();
  ctx.fill();

  saveCanvas(canvas, 'water-hole.png');
}

// Melting Ice - 48x48, ice tile with faint blue-green tint
function createMeltingIce() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Base blue-green tinted ice
  ctx.fillStyle = '#a8e0e8';
  ctx.fillRect(0, 0, 48, 48);

  // White streaks for ice texture (slightly faded)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(5, 10);
  ctx.lineTo(15, 5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(30, 45);
  ctx.lineTo(45, 38);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(20, 25);
  ctx.lineTo(35, 18);
  ctx.stroke();

  // Subtle wet sheen effect
  ctx.fillStyle = 'rgba(150, 220, 230, 0.3)';
  ctx.beginPath();
  ctx.ellipse(24, 24, 18, 14, 0, 0, Math.PI * 2);
  ctx.fill();

  // Border with slight green tint
  ctx.strokeStyle = '#88c8d0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'melting-ice.png');
}

// Melting Ice Warning - 48x48, more blue, dripping/shimmering look
function createMeltingIceWarning() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Darker, more saturated blue base
  ctx.fillStyle = '#70c0e0';
  ctx.fillRect(0, 0, 48, 48);

  // Wet/glossy appearance
  ctx.fillStyle = 'rgba(100, 180, 220, 0.5)';
  ctx.fillRect(0, 0, 48, 48);

  // Water pooling effect
  ctx.fillStyle = 'rgba(60, 140, 180, 0.4)';
  ctx.beginPath();
  ctx.ellipse(24, 30, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Drip marks
  ctx.strokeStyle = 'rgba(50, 120, 160, 0.6)';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(12, 8);
  ctx.lineTo(14, 20);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(30, 5);
  ctx.lineTo(28, 16);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(40, 10);
  ctx.lineTo(38, 22);
  ctx.stroke();

  // Water droplet shapes
  ctx.fillStyle = 'rgba(40, 100, 140, 0.5)';
  ctx.beginPath();
  ctx.ellipse(14, 24, 3, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(28, 20, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(38, 26, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Shimmer highlights
  ctx.strokeStyle = 'rgba(200, 240, 255, 0.6)';
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(8, 36);
  ctx.lineTo(16, 34);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(32, 40);
  ctx.lineTo(42, 38);
  ctx.stroke();

  // Warning border
  ctx.strokeStyle = '#4090b0';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'melting-ice-warning.png');
}

// Mouse 2 - 24x24, brown mouse for player 2 in co-op
function createMouse2() {
  const canvas = createCanvas(24, 24);
  const ctx = canvas.getContext('2d');

  // Tail (thin curve on right side)
  ctx.strokeStyle = '#9c6b45';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(18, 12);
  ctx.quadraticCurveTo(22, 8, 23, 4);
  ctx.stroke();

  // Body (brown circle)
  ctx.fillStyle = '#9c6b45';
  ctx.beginPath();
  ctx.arc(12, 12, 7, 0, Math.PI * 2);
  ctx.fill();

  // Ears (outer brown)
  ctx.beginPath();
  ctx.arc(6, 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, 5, 4, 0, Math.PI * 2);
  ctx.fill();

  // Inner ears (peach)
  ctx.fillStyle = '#ffc8a0';
  ctx.beginPath();
  ctx.arc(6, 5, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(18, 5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
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

  saveCanvas(canvas, 'mouse2.png');
}

// Golden Cheese - 18x18, shiny gold wedge with sparkle
function createGoldenCheese() {
  const canvas = createCanvas(18, 18);
  const ctx = canvas.getContext('2d');

  // Soft glow
  ctx.fillStyle = 'rgba(255, 230, 100, 0.35)';
  ctx.beginPath();
  ctx.arc(9, 9, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Gold wedge
  const grad = ctx.createLinearGradient(2, 16, 16, 2);
  grad.addColorStop(0, '#e8a500');
  grad.addColorStop(0.5, '#ffd700');
  grad.addColorStop(1, '#fff0a0');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(2, 15);
  ctx.lineTo(16, 15);
  ctx.lineTo(16, 3);
  ctx.closePath();
  ctx.fill();

  // Holes (darker gold)
  ctx.fillStyle = '#c8900a';
  ctx.beginPath();
  ctx.arc(11, 9, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(7, 12, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Sparkle (white plus)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(13, 4);
  ctx.lineTo(13, 8);
  ctx.moveTo(11, 6);
  ctx.lineTo(15, 6);
  ctx.stroke();

  saveCanvas(canvas, 'golden-cheese.png');
}

// Walrus - 64x56, big brown sleeping blob with tusks
function drawWalrus(ctx, eyesOpen) {
  // Body (large brown ellipse)
  ctx.fillStyle = '#a0704d';
  ctx.strokeStyle = '#7a5236';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(32, 32, 28, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Belly highlight
  ctx.fillStyle = '#b5825c';
  ctx.beginPath();
  ctx.ellipse(32, 38, 20, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head bump
  ctx.fillStyle = '#a0704d';
  ctx.beginPath();
  ctx.ellipse(32, 18, 14, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Muzzle
  ctx.fillStyle = '#c89a70';
  ctx.beginPath();
  ctx.ellipse(32, 23, 10, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tusks
  ctx.fillStyle = '#fff8e8';
  ctx.strokeStyle = '#ddd0b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(27, 26);
  ctx.quadraticCurveTo(26, 34, 28, 38);
  ctx.quadraticCurveTo(30, 34, 29, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(35, 26);
  ctx.quadraticCurveTo(34, 34, 36, 38);
  ctx.quadraticCurveTo(38, 34, 37, 26);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Whisker dots
  ctx.fillStyle = '#7a5236';
  [26, 29, 35, 38].forEach(x => {
    ctx.beginPath();
    ctx.arc(x, 22, 0.8, 0, Math.PI * 2);
    ctx.fill();
  });

  // Nose
  ctx.fillStyle = '#4a3220';
  ctx.beginPath();
  ctx.ellipse(32, 17, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (eyesOpen) {
    // Wide surprised eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(26, 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(38, 13, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(26, 13, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(38, 13, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Closed sleeping eyes (curved lines)
    ctx.strokeStyle = '#4a3220';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(26, 12, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(38, 12, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
}

function createWalrus() {
  const canvas = createCanvas(64, 64);
  drawWalrus(canvas.getContext('2d'), false);
  saveCanvas(canvas, 'walrus.png');

  const canvas2 = createCanvas(64, 64);
  drawWalrus(canvas2.getContext('2d'), true);
  saveCanvas(canvas2, 'walrus-awake.png');
}

// Penguin - 28x28, top-down belly-slider facing right
function createPenguin() {
  const canvas = createCanvas(28, 28);
  const ctx = canvas.getContext('2d');

  // Flippers (out to the sides)
  ctx.fillStyle = '#222233';
  ctx.beginPath();
  ctx.ellipse(12, 5, 7, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(12, 23, 7, 3, 0.3, 0, Math.PI * 2);
  ctx.fill();

  // Body (dark oval, long axis = direction of travel)
  ctx.fillStyle = '#2b2b3d';
  ctx.beginPath();
  ctx.ellipse(13, 14, 11, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // White belly stripe
  ctx.fillStyle = '#f0f0f5';
  ctx.beginPath();
  ctx.ellipse(14, 14, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head (front = right side)
  ctx.fillStyle = '#2b2b3d';
  ctx.beginPath();
  ctx.arc(22, 14, 5, 0, Math.PI * 2);
  ctx.fill();

  // Beak (orange triangle pointing right)
  ctx.fillStyle = '#ff9922';
  ctx.beginPath();
  ctx.moveTo(26, 12);
  ctx.lineTo(28, 14);
  ctx.lineTo(26, 16);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(22, 11.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22, 16.5, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(22.5, 11.5, 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(22.5, 16.5, 0.8, 0, Math.PI * 2);
  ctx.fill();

  saveCanvas(canvas, 'penguin.png');
}

// Speed Streak - 48x48, ice tile with bold cyan chevrons pointing right
function createSpeedStreak() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Slightly brighter ice base
  ctx.fillStyle = '#c5ecff';
  ctx.fillRect(0, 0, 48, 48);

  // Motion streak lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(2, 10);
  ctx.lineTo(20, 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(2, 38);
  ctx.lineTo(20, 38);
  ctx.stroke();

  // Two bold chevrons pointing right
  ctx.strokeStyle = '#1e90d4';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(12, 12);
  ctx.lineTo(24, 24);
  ctx.lineTo(12, 36);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(26, 12);
  ctx.lineTo(38, 24);
  ctx.lineTo(26, 36);
  ctx.stroke();

  // Subtle border
  ctx.strokeStyle = '#99d6ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'speed-streak.png');
}

// Slush - 48x48, mushy gray-blue tile (high drag)
function createSlush() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Dull gray-blue base
  ctx.fillStyle = '#c8d4da';
  ctx.fillRect(0, 0, 48, 48);

  // Mushy blobs
  ctx.fillStyle = '#dde8ee';
  const blobs = [
    [8, 10, 6], [26, 8, 5], [40, 14, 4], [14, 26, 7],
    [34, 30, 6], [8, 40, 5], [24, 42, 4], [42, 40, 5]
  ];
  blobs.forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Darker speckles for grit
  ctx.fillStyle = '#a8b8c0';
  const specks = [
    [12, 16], [30, 20], [20, 34], [38, 8], [6, 30],
    [44, 26], [16, 6], [28, 30], [36, 44], [10, 44]
  ];
  specks.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Subtle border
  ctx.strokeStyle = '#b0c0c8';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'slush.png');
}

// Star - 20x20, yellow five-pointed star (level select + dizzy stars)
function createStar() {
  const canvas = createCanvas(20, 20);
  const ctx = canvas.getContext('2d');

  const cx = 10, cy = 10, outer = 9, inner = 3.8;
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#e0a800';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  saveCanvas(canvas, 'star.png');
}

// Snowflake - 8x8, soft white dot for ambient snowfall
function createSnowflake() {
  const canvas = createCanvas(8, 8);
  const ctx = canvas.getContext('2d');

  const grad = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 8, 8);

  saveCanvas(canvas, 'snowflake.png');
}

// Ice Block - 44x44, pushable pale cube with a shine
function createIceBlock() {
  const canvas = createCanvas(44, 44);
  const ctx = canvas.getContext('2d');

  // Cube face
  const grad = ctx.createLinearGradient(0, 0, 44, 44);
  grad.addColorStop(0, '#e8f8ff');
  grad.addColorStop(0.5, '#c8ecff');
  grad.addColorStop(1, '#a8d8f0');
  ctx.fillStyle = grad;
  ctx.fillRect(2, 2, 40, 40);

  // Beveled edges
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(3.5, 3.5, 37, 37);
  ctx.strokeStyle = '#78b8d8';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 40, 40);

  // Shine streaks
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(10, 16);
  ctx.lineTo(18, 8);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(14, 22);
  ctx.lineTo(24, 12);
  ctx.stroke();

  // Inner frost marks
  ctx.strokeStyle = 'rgba(120, 180, 216, 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, 30);
  ctx.lineTo(36, 34);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(24, 34);
  ctx.lineTo(30, 38);
  ctx.stroke();

  saveCanvas(canvas, 'ice-block.png');
}

// Burrow - 32x32, round tunnel hole with a snowy rim (tinted per pair in-game)
function createBurrow() {
  const canvas = createCanvas(32, 32);
  const ctx = canvas.getContext('2d');

  // Snowy rim
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, Math.PI * 2);
  ctx.fill();

  // Rim shading ring (this ring picks up the pair tint in-game)
  ctx.fillStyle = '#c8ddea';
  ctx.beginPath();
  ctx.arc(16, 16, 12, 0, Math.PI * 2);
  ctx.fill();

  // Dark tunnel
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath();
  ctx.arc(16, 16, 9, 0, Math.PI * 2);
  ctx.fill();

  // Deeper center
  ctx.fillStyle = '#120a05';
  ctx.beginPath();
  ctx.arc(16, 17, 6, 0, Math.PI * 2);
  ctx.fill();

  // Little swirl hint (things go around and through)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(16, 16, 10.5, -0.4, 1.2);
  ctx.stroke();

  saveCanvas(canvas, 'burrow.png');
}

// Wind tile - 48x48, ice with soft drifting streaks and a pale chevron (points right, rotated in-game)
function createWindTile() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Slightly frosted ice base
  ctx.fillStyle = '#bfe6fa';
  ctx.fillRect(0, 0, 48, 48);

  // Long horizontal wind streaks with curl tails
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(4, 12);
  ctx.lineTo(30, 12);
  ctx.quadraticCurveTo(38, 12, 36, 7);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(8, 24);
  ctx.lineTo(40, 24);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(4, 36);
  ctx.lineTo(28, 36);
  ctx.quadraticCurveTo(36, 36, 34, 41);
  ctx.stroke();

  // Single soft chevron showing push direction
  ctx.strokeStyle = 'rgba(120, 180, 220, 0.9)';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(34, 16);
  ctx.lineTo(42, 24);
  ctx.lineTo(34, 32);
  ctx.stroke();

  // Subtle border
  ctx.strokeStyle = '#99d6ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'wind-tile.png');
}

// Spinner - 48x48, blue swirl on polished ice
function createSpinner() {
  const canvas = createCanvas(48, 48);
  const ctx = canvas.getContext('2d');

  // Polished ice base
  ctx.fillStyle = '#cdeeff';
  ctx.fillRect(0, 0, 48, 48);

  // Swirl: three spiral arms
  ctx.strokeStyle = '#3aa0d8';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let arm = 0; arm < 3; arm++) {
    ctx.beginPath();
    const offset = (arm * Math.PI * 2) / 3;
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = offset + t * Math.PI * 1.6;
      const r = 4 + t * 16;
      const x = 24 + Math.cos(angle) * r;
      const y = 24 + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Center dot
  ctx.fillStyle = '#2080b8';
  ctx.beginPath();
  ctx.arc(24, 24, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Subtle border
  ctx.strokeStyle = '#99d6ff';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 0, 48, 48);

  saveCanvas(canvas, 'spinner.png');
}

// Fox - 36x36, top-down orange fox with pointy ears and a bushy tail
function drawFox(ctx, asleep) {
  // Tail (bushy, behind = up in local space)
  ctx.fillStyle = '#e07830';
  ctx.beginPath();
  ctx.ellipse(18, 7, 6, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(18, 4, 3.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body (orange oval, facing down like the mice)
  ctx.fillStyle = '#f08838';
  ctx.beginPath();
  ctx.ellipse(18, 19, 9, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.fillStyle = '#f08838';
  ctx.beginPath();
  ctx.arc(18, 27, 7, 0, Math.PI * 2);
  ctx.fill();

  // Pointy ears with dark tips
  ctx.fillStyle = '#f08838';
  ctx.beginPath();
  ctx.moveTo(11, 24);
  ctx.lineTo(9, 16);
  ctx.lineTo(16, 21);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(25, 24);
  ctx.lineTo(27, 16);
  ctx.lineTo(20, 21);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#503018';
  ctx.beginPath();
  ctx.moveTo(10.2, 20);
  ctx.lineTo(9, 16);
  ctx.lineTo(12.8, 18.5);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(25.8, 20);
  ctx.lineTo(27, 16);
  ctx.lineTo(23.2, 18.5);
  ctx.closePath();
  ctx.fill();

  // White snout
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(18, 30, 4, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = '#302018';
  ctx.beginPath();
  ctx.arc(18, 32, 1.5, 0, Math.PI * 2);
  ctx.fill();

  if (asleep) {
    // Closed eyes (curved lines)
    ctx.strokeStyle = '#503018';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(15, 26, 2, 0.3, Math.PI - 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(21, 26, 2, 0.3, Math.PI - 0.3);
    ctx.stroke();
  } else {
    // Alert amber eyes
    ctx.fillStyle = '#402808';
    ctx.beginPath();
    ctx.arc(15, 26, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(21, 26, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createFox() {
  const canvas = createCanvas(36, 36);
  drawFox(canvas.getContext('2d'), false);
  saveCanvas(canvas, 'fox.png');

  const canvas2 = createCanvas(36, 36);
  drawFox(canvas2.getContext('2d'), true);
  saveCanvas(canvas2, 'fox-sleep.png');
}

// Paw target - 28x28, faint paw print marking where the fox pounces
function createPawTarget() {
  const canvas = createCanvas(28, 28);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(224, 120, 48, 0.45)';

  // Main pad
  ctx.beginPath();
  ctx.ellipse(14, 17, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Toes
  const toes = [[6, 10], [11, 7], [17, 7], [22, 10]];
  toes.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.ellipse(x, y, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Dashed warning ring
  ctx.strokeStyle = 'rgba(224, 120, 48, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.arc(14, 14, 12.5, 0, Math.PI * 2);
  ctx.stroke();

  saveCanvas(canvas, 'paw-target.png');
}

// Otter - 34x34, friendly brown head poking out of the water
function createOtter() {
  const canvas = createCanvas(34, 34);
  const ctx = canvas.getContext('2d');

  // Head (round brown)
  ctx.fillStyle = '#8a5c38';
  ctx.beginPath();
  ctx.arc(17, 16, 12, 0, Math.PI * 2);
  ctx.fill();

  // Little round ears
  ctx.beginPath();
  ctx.arc(7, 8, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(27, 8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Light muzzle
  ctx.fillStyle = '#c89a70';
  ctx.beginPath();
  ctx.ellipse(17, 21, 7, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Happy closed eyes (upside-down arcs = smiling)
  ctx.strokeStyle = '#2a1a10';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(12, 14, 2.5, Math.PI + 0.3, -0.3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(22, 14, 2.5, Math.PI + 0.3, -0.3);
  ctx.stroke();

  // Nose
  ctx.fillStyle = '#2a1a10';
  ctx.beginPath();
  ctx.ellipse(17, 19, 2.5, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.strokeStyle = '#2a1a10';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(17, 22, 3.5, 0.4, Math.PI - 0.4);
  ctx.stroke();

  // Whiskers
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(10, 19); ctx.lineTo(3, 17);
  ctx.moveTo(10, 21); ctx.lineTo(3, 22);
  ctx.moveTo(24, 19); ctx.lineTo(31, 17);
  ctx.moveTo(24, 21); ctx.lineTo(31, 22);
  ctx.stroke();

  saveCanvas(canvas, 'otter.png');
}

// Frozen fish - 22x14, pale blue fish for penguin delivery
function createFish() {
  const canvas = createCanvas(22, 14);
  const ctx = canvas.getContext('2d');

  // Body
  ctx.fillStyle = '#9fd4e8';
  ctx.beginPath();
  ctx.ellipse(9, 7, 8, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tail
  ctx.beginPath();
  ctx.moveTo(15, 7);
  ctx.lineTo(21, 2);
  ctx.lineTo(21, 12);
  ctx.closePath();
  ctx.fill();

  // Frost shine
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(4, 5);
  ctx.lineTo(9, 3.5);
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#204050';
  ctx.beginPath();
  ctx.arc(4.5, 6, 1.2, 0, Math.PI * 2);
  ctx.fill();

  saveCanvas(canvas, 'fish.png');
}

// Fish shadow - 26x12, dark silhouette swimming under the ice
function createFishShadow() {
  const canvas = createCanvas(26, 12);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(40, 90, 130, 1)';
  ctx.beginPath();
  ctx.ellipse(10, 6, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(17, 6);
  ctx.lineTo(25, 1);
  ctx.lineTo(25, 11);
  ctx.closePath();
  ctx.fill();

  saveCanvas(canvas, 'fish-shadow.png');
}

// Hats - small top-down hats worn between the mouse's ears
function createHats() {
  // Scarf: cozy red band with a trailing end
  const scarf = createCanvas(24, 20);
  let ctx = scarf.getContext('2d');
  ctx.strokeStyle = '#d03838';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(12, 8, 7, 0.25, Math.PI - 0.25);
  ctx.stroke();
  // Trailing end flapping to the side
  ctx.beginPath();
  ctx.moveTo(18, 11);
  ctx.quadraticCurveTo(23, 13, 22, 18);
  ctx.stroke();
  // Stripes on the trailing end
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(20.2, 14);
  ctx.lineTo(23, 15);
  ctx.stroke();
  saveCanvas(scarf, 'hat-scarf.png');

  // Top hat: black circle with a gray brim ring (seen from above)
  const top = createCanvas(20, 20);
  ctx = top.getContext('2d');
  ctx.fillStyle = '#404048';
  ctx.beginPath();
  ctx.arc(10, 10, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#181820';
  ctx.beginPath();
  ctx.arc(10, 10, 6, 0, Math.PI * 2);
  ctx.fill();
  // Shine
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(10, 10, 4, Math.PI * 1.1, Math.PI * 1.6);
  ctx.stroke();
  saveCanvas(top, 'hat-top.png');

  // Viking helmet: gray dome with two horns
  const viking = createCanvas(26, 18);
  ctx = viking.getContext('2d');
  // Horns
  ctx.fillStyle = '#f8f0e0';
  ctx.strokeStyle = '#c8b898';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, 12);
  ctx.quadraticCurveTo(0, 8, 2, 2);
  ctx.quadraticCurveTo(6, 6, 9, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(20, 12);
  ctx.quadraticCurveTo(26, 8, 24, 2);
  ctx.quadraticCurveTo(20, 6, 17, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // Dome
  ctx.fillStyle = '#9098a8';
  ctx.beginPath();
  ctx.arc(13, 11, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#b8c0d0';
  ctx.beginPath();
  ctx.arc(13, 11, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // Rivet
  ctx.fillStyle = '#707888';
  ctx.beginPath();
  ctx.arc(13, 11, 1.5, 0, Math.PI * 2);
  ctx.fill();
  saveCanvas(viking, 'hat-viking.png');

  // Crown: gold ring with points (seen from above)
  const crown = createCanvas(22, 22);
  ctx = crown.getContext('2d');
  ctx.fillStyle = '#ffd700';
  ctx.strokeStyle = '#c8a000';
  ctx.lineWidth = 1;
  // Ring of triangular points
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const x1 = 11 + Math.cos(a - 0.18) * 7;
    const y1 = 11 + Math.sin(a - 0.18) * 7;
    const x2 = 11 + Math.cos(a + 0.18) * 7;
    const y2 = 11 + Math.sin(a + 0.18) * 7;
    const xt = 11 + Math.cos(a) * 10.5;
    const yt = 11 + Math.sin(a) * 10.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(xt, yt);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // Band
  ctx.fillStyle = '#ffd700';
  ctx.beginPath();
  ctx.arc(11, 11, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Jewel
  ctx.fillStyle = '#e04868';
  ctx.beginPath();
  ctx.arc(11, 11, 2.5, 0, Math.PI * 2);
  ctx.fill();

  saveCanvas(crown, 'hat-crown.png');
}

// Aurora - 320x80 soft translucent green-purple band for late levels
function createAurora() {
  const canvas = createCanvas(320, 80);
  const ctx = canvas.getContext('2d');

  // Wavy vertical curtain strips
  for (let x = 0; x < 320; x += 4) {
    const wave = Math.sin(x * 0.04) * 12 + Math.sin(x * 0.013) * 8;
    const height = 40 + Math.sin(x * 0.02) * 16;
    // Color drifts from green to purple across the band
    const r = Math.floor(80 + (150 - 80) * (x / 320));
    const g = Math.floor(240 + (120 - 240) * (x / 320));
    const b = Math.floor(160 + (220 - 160) * (x / 320));

    const grad = ctx.createLinearGradient(0, 10 + wave, 0, 10 + wave + height);
    grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
    grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.35)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(x, 10 + wave, 4, height);
  }

  saveCanvas(canvas, 'aurora.png');
}

// Generate all assets
console.log('Generating placeholder assets...');
createMouse();
createPolarBear();
createCheese();
createIceTile();
createMouseHole();
createSnowbank();
createCrackingIce();
createCrackedIce();
createWaterHole();
createMeltingIce();
createMeltingIceWarning();
createMouse2();
createGoldenCheese();
createWalrus();
createPenguin();
createSpeedStreak();
createSlush();
createStar();
createSnowflake();
createIceBlock();
createBurrow();
createWindTile();
createSpinner();
createFox();
createPawTarget();
createOtter();
createFish();
createFishShadow();
createHats();
createAurora();
console.log('Done!');
