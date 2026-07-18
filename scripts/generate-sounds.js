import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');

// Generate a simple WAV file
function createWav(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = samples.length * 2;
  const fileSize = 36 + dataSize;

  const buffer = Buffer.alloc(44 + dataSize);
  let offset = 0;

  // RIFF header
  buffer.write('RIFF', offset); offset += 4;
  buffer.writeUInt32LE(fileSize, offset); offset += 4;
  buffer.write('WAVE', offset); offset += 4;

  // fmt chunk
  buffer.write('fmt ', offset); offset += 4;
  buffer.writeUInt32LE(16, offset); offset += 4;
  buffer.writeUInt16LE(1, offset); offset += 2;
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(sample * 32767), offset);
    offset += 2;
  }

  return buffer;
}

// "Caught" sound - comedic bonk/crash
function createCaughtSound() {
  const sampleRate = 44100;
  const duration = 0.25;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Quick descending frequency for comedic bonk
    const freq = 300 - (200 * progress);

    // Sharp attack, quick decay
    let envelope = Math.exp(-progress * 8);

    // Add some noise for impact feel
    const noise = (Math.random() - 0.5) * 0.3 * Math.exp(-progress * 15);
    const tone = Math.sin(2 * Math.PI * freq * t);
    const sample = (tone * 0.7 + noise) * envelope * 0.6;

    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'caught.wav'), buffer);
  console.log('Created caught.wav');
}

// Cheese collect - bright happy ding/pop
function createCheeseSound() {
  const sampleRate = 44100;
  const duration = 0.15;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // High pitched ding
    const freq1 = 880; // A5
    const freq2 = 1320; // E6

    // Quick decay envelope
    const envelope = Math.exp(-progress * 12);

    // Two harmonics for a bright sound
    const tone1 = Math.sin(2 * Math.PI * freq1 * t);
    const tone2 = Math.sin(2 * Math.PI * freq2 * t) * 0.5;
    const sample = (tone1 + tone2) * envelope * 0.4;

    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'cheese.wav'), buffer);
  console.log('Created cheese.wav');
}

// Slide/whoosh - soft whoosh sound
function createSlideSound() {
  const sampleRate = 44100;
  const duration = 0.2;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Filtered noise for whoosh
    const envelope = Math.sin(progress * Math.PI) * 0.3;

    // Noise with some filtering effect
    let noise = 0;
    for (let j = 0; j < 5; j++) {
      noise += Math.sin(2 * Math.PI * (200 + j * 100 + progress * 300) * t);
    }
    noise = noise / 5 + (Math.random() - 0.5) * 0.5;

    const sample = noise * envelope * 0.25;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'slide.wav'), buffer);
  console.log('Created slide.wav');
}

// Level complete - triumphant ascending jingle
function createLevelCompleteSound() {
  const sampleRate = 44100;
  const samples = [];

  // Four ascending notes: C5, E5, G5, C6
  const notes = [523, 659, 784, 1047];
  const noteDuration = 0.12;
  const totalDuration = notes.length * noteDuration + 0.2;

  for (let i = 0; i < sampleRate * totalDuration; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (let n = 0; n < notes.length; n++) {
      const noteStart = n * noteDuration;
      const noteTime = t - noteStart;

      if (noteTime >= 0 && noteTime < noteDuration + 0.15) {
        const freq = notes[n];
        const envelope = Math.exp(-noteTime * 4) * Math.min(1, noteTime * 50);
        const tone = Math.sin(2 * Math.PI * freq * noteTime);
        const harmonic = Math.sin(2 * Math.PI * freq * 2 * noteTime) * 0.3;
        sample += (tone + harmonic) * envelope * 0.3;
      }
    }

    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'level-complete.wav'), buffer);
  console.log('Created level-complete.wav');
}

// Mouse hole activate - subtle magical chime
function createHoleActivateSound() {
  const sampleRate = 44100;
  const duration = 0.4;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Shimmery ascending frequencies
    const freq1 = 600 + progress * 400;
    const freq2 = 900 + progress * 300;
    const freq3 = 1200 + progress * 200;

    // Soft envelope
    const envelope = Math.sin(progress * Math.PI) * 0.5;

    const tone1 = Math.sin(2 * Math.PI * freq1 * t);
    const tone2 = Math.sin(2 * Math.PI * freq2 * t) * 0.6;
    const tone3 = Math.sin(2 * Math.PI * freq3 * t) * 0.3;

    const sample = (tone1 + tone2 + tone3) / 3 * envelope * 0.4;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'hole-activate.wav'), buffer);
  console.log('Created hole-activate.wav');
}

// Background music - "aurora over the tundra". Three arctic signatures:
// an open-fifth drone (vast empty ice), a slow bell melody in C Lydian
// (the raised 4th, F#, is the classic snowy-wonder sound - bright, never
// sad), and a quiet glassy ostinato falling like snow. A soft wind swell
// breathes underneath every couple of bars.
function createBackgroundMusic() {
  const sampleRate = 44100;
  const bpm = 112;
  const beatDuration = 60 / bpm;
  const barDuration = beatDuration * 4;
  const loopBars = 8;
  const totalDuration = barDuration * loopBars;

  // C Lydian tones
  const C5 = 523, D5 = 587, E5 = 659, Fs5 = 740, G5 = 784, A5 = 880, B5 = 988;
  const C6 = 1047, B5h = 988, D6 = 1175, E6 = 1319, G6 = 1568;

  // Sparse, sustained melody: [bar, beat, freq]. Long ringing bells with
  // space between them - glacial but luminous. F# and B over the C-G drone
  // make the "shimmer" chords; the phrase settles home on E (warm 3rd).
  const melodyEvents = [
    [0, 0, G5], [0, 3, E5],
    [1, 0, Fs5], [1, 3, D5],
    [2, 0, E5], [2, 2, G5], [2, 3, A5],
    [3, 0, B5],
    [4, 0, C6], [4, 2, B5h], [4, 3, A5],
    [5, 0, G5], [5, 2, E5], [5, 3, Fs5],
    [6, 0, A5], [6, 2, G5], [6, 3, D5],
    [7, 0, E5]
    // bar 8 tail is left empty so the last bell decays cleanly into the loop
  ];
  const noteOns = melodyEvents.map(([bar, beat, freq]) => ({
    start: bar * barDuration + beat * beatDuration,
    freq
  }));

  // Glassy snowfall ostinato: quiet descending 8th-note cycle, high register
  const ostinato = [G6, E6, D6, B5h];
  const eighthDuration = beatDuration / 2;

  const samples = [];
  for (let i = 0; i < sampleRate * totalDuration; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Open-fifth drone (C3 + G3), slowly breathing - the vast tundra
    const breathe = 0.8 + 0.2 * Math.sin((2 * Math.PI * t) / (barDuration * 2));
    sample += Math.sin(2 * Math.PI * 131 * t) * 0.055 * breathe;
    sample += Math.sin(2 * Math.PI * 196 * t) * 0.04 * breathe;

    // Melody bells: ring long past their beat (decay ~2s)
    for (const note of noteOns) {
      const noteT = t - note.start;
      if (noteT < 0 || noteT > 2) continue;
      const envelope = Math.exp(-noteT * 2.5) * Math.min(1, noteT * 120);
      const bell =
        Math.sin(2 * Math.PI * note.freq * noteT) +
        Math.sin(2 * Math.PI * note.freq * 2 * noteT) * 0.35 +
        Math.sin(2 * Math.PI * note.freq * 3 * noteT) * 0.1;
      sample += bell * envelope * 0.14;
    }

    // Snowfall ostinato: every 8th note, very quiet and quick to fade
    const eighthIndex = Math.floor(t / eighthDuration);
    const eighthT = t - eighthIndex * eighthDuration;
    const ostFreq = ostinato[eighthIndex % ostinato.length];
    const ostEnv = Math.exp(-eighthT * 9) * Math.min(1, eighthT * 300);
    sample += Math.sin(2 * Math.PI * ostFreq * eighthT) * ostEnv * 0.035;

    // Arctic wind: a soft noise swell cresting once every two bars
    const windPhase = (t % (barDuration * 2)) / (barDuration * 2);
    const windEnv = Math.pow(Math.sin(Math.PI * windPhase), 3) * 0.018;
    sample += (Math.random() - 0.5) * windEnv;

    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'music.wav'), buffer);
  console.log('Created music.wav');
}

// Countdown beep
function createCountdownBeep() {
  const sampleRate = 44100;
  const duration = 0.15;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    const freq = 440;
    const envelope = Math.exp(-progress * 10);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'countdown.wav'), buffer);
  console.log('Created countdown.wav');
}

// "Go!" sound - higher pitch
function createGoSound() {
  const sampleRate = 44100;
  const duration = 0.25;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;
    const freq = 880;
    const envelope = Math.exp(-progress * 6);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.5;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'go.wav'), buffer);
  console.log('Created go.wav');
}

// Ice cracking sound - short sharp crack
function createCrackSound() {
  const sampleRate = 44100;
  const duration = 0.15;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Sharp attack with fast decay
    const envelope = Math.exp(-progress * 20);

    // Mix of noise and low frequency for impact
    const noise = (Math.random() - 0.5) * envelope;
    const crack = Math.sin(2 * Math.PI * 150 * t) * envelope * 0.5;
    const pop = Math.sin(2 * Math.PI * 400 * t) * Math.exp(-progress * 30) * 0.3;

    const sample = (noise * 0.6 + crack + pop) * 0.5;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'crack.wav'), buffer);
  console.log('Created crack.wav');
}

// Ice splash/shatter sound - breaking through ice into water
function createSplashSound() {
  const sampleRate = 44100;
  const duration = 0.4;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Initial crack/shatter
    const crackEnv = Math.exp(-progress * 15);
    const crack = (Math.random() - 0.5) * crackEnv * 0.8;

    // Splash component (delayed slightly)
    const splashDelay = Math.max(0, t - 0.05);
    const splashProgress = splashDelay / (duration - 0.05);
    const splashEnv = Math.sin(splashProgress * Math.PI) * 0.6;

    // Filtered noise for water splash
    let splash = 0;
    for (let j = 0; j < 3; j++) {
      splash += Math.sin(2 * Math.PI * (100 + j * 80 + splashProgress * 50) * t);
    }
    splash = splash / 3 * splashEnv;

    // Bubbles (high frequency bursts)
    const bubbles = Math.sin(2 * Math.PI * 800 * t) * Math.random() * Math.exp(-progress * 8) * 0.2;

    const sample = (crack + splash * 0.4 + bubbles) * 0.5;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'splash.wav'), buffer);
  console.log('Created splash.wav');
}

// Squeak - quick chirp for wall bonks
function createSqueakSound() {
  const sampleRate = 44100;
  const duration = 0.12;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Fast rising then falling pitch, like a rubber toy
    const freq = 1400 + Math.sin(progress * Math.PI) * 900;
    const envelope = Math.sin(progress * Math.PI) * Math.exp(-progress * 3);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.35;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'squeak.wav'), buffer);
  console.log('Created squeak.wav');
}

// Boing - springy wobble for the caught-gag fling
function createBoingSound() {
  const sampleRate = 44100;
  const duration = 0.45;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Descending base with a wobbling vibrato = cartoon spring
    const baseFreq = 380 - progress * 180;
    const wobble = Math.sin(2 * Math.PI * 18 * t) * 60 * (1 - progress);
    const freq = baseFreq + wobble;
    const envelope = Math.exp(-progress * 5);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.45;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'boing.wav'), buffer);
  console.log('Created boing.wav');
}

// Golden cheese - sparkly ascending arpeggio, fancier than normal cheese
function createGoldenSound() {
  const sampleRate = 44100;
  const notes = [784, 988, 1175, 1568]; // G5 B5 D6 G6
  const noteDuration = 0.08;
  const totalDuration = notes.length * noteDuration + 0.25;
  const samples = [];

  for (let i = 0; i < sampleRate * totalDuration; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (let n = 0; n < notes.length; n++) {
      const noteStart = n * noteDuration;
      const noteTime = t - noteStart;
      if (noteTime >= 0 && noteTime < 0.25) {
        const envelope = Math.exp(-noteTime * 10) * Math.min(1, noteTime * 80);
        const tone = Math.sin(2 * Math.PI * notes[n] * noteTime);
        const shimmer = Math.sin(2 * Math.PI * notes[n] * 2 * noteTime) * 0.4;
        sample += (tone + shimmer) * envelope * 0.3;
      }
    }

    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'golden.wav'), buffer);
  console.log('Created golden.wav');
}

// Boost - rising whoosh for speed streaks
function createBoostSound() {
  const sampleRate = 44100;
  const duration = 0.3;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Rising swept tone plus airy noise
    const freq = 200 + progress * 700;
    const envelope = Math.sin(progress * Math.PI) * 0.6;
    const tone = Math.sin(2 * Math.PI * freq * t) * 0.5;
    const noise = (Math.random() - 0.5) * 0.5;
    const sample = (tone + noise * 0.5) * envelope * 0.5;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'boost.wav'), buffer);
  console.log('Created boost.wav');
}

// Wheee - slide-whistle up for cheese combos
function createWheeeSound() {
  const sampleRate = 44100;
  const duration = 0.35;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Slide whistle: smooth pitch sweep upward
    const freq = 500 + progress * progress * 1100;
    const envelope = Math.sin(progress * Math.PI) * 0.7;
    const tone = Math.sin(2 * Math.PI * freq * t);
    const breathy = Math.sin(2 * Math.PI * freq * 1.01 * t) * 0.3;
    const sample = (tone + breathy) * envelope * 0.35;
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'wheee.wav'), buffer);
  console.log('Created wheee.wav');
}

// Warp - quick zip up-then-down for burrow travel
function createWarpSound() {
  const sampleRate = 44100;
  const duration = 0.3;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Pitch zips up then dives - "into the tunnel and out the other side"
    const freq = progress < 0.5
      ? 400 + progress * 2 * 1200
      : 1600 - (progress - 0.5) * 2 * 1000;
    const envelope = Math.sin(progress * Math.PI) * 0.7;
    const tone = Math.sin(2 * Math.PI * freq * t);
    const sparkle = Math.sin(2 * Math.PI * freq * 2.02 * t) * 0.25;
    samples.push((tone + sparkle) * envelope * 0.4);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'warp.wav'), buffer);
  console.log('Created warp.wav');
}

// Yip - two quick fox chirps for the pounce telegraph
function createYipSound() {
  const sampleRate = 44100;
  const duration = 0.3;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    let sample = 0;

    // Two short falling chirps
    for (const start of [0, 0.15]) {
      const nt = t - start;
      if (nt >= 0 && nt < 0.1) {
        const p = nt / 0.1;
        const freq = 1100 - p * 400;
        const envelope = Math.sin(p * Math.PI) * Math.exp(-p * 2);
        sample += Math.sin(2 * Math.PI * freq * nt) * envelope * 0.4;
      }
    }
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'yip.wav'), buffer);
  console.log('Created yip.wav');
}

// Plug - deep thunk then a frosty shimmer (ice block seals a water hole)
function createPlugSound() {
  const sampleRate = 44100;
  const duration = 0.5;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Deep thunk at the start
    const thunkEnv = Math.exp(-progress * 18);
    const thunk = Math.sin(2 * Math.PI * 120 * t) * thunkEnv * 0.7;
    const impact = (Math.random() - 0.5) * Math.exp(-progress * 30) * 0.4;

    // Rising freeze shimmer after the thunk
    const shimmerDelay = Math.max(0, t - 0.12);
    const sp = shimmerDelay / (duration - 0.12);
    const shimmerEnv = Math.sin(Math.min(1, sp) * Math.PI) * 0.3;
    const shimmer = (
      Math.sin(2 * Math.PI * (900 + sp * 500) * t) +
      Math.sin(2 * Math.PI * (1350 + sp * 500) * t) * 0.6
    ) * shimmerEnv * 0.25;

    samples.push((thunk + impact + shimmer) * 0.6);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'plug.wav'), buffer);
  console.log('Created plug.wav');
}

// Chime - warm three-note hello for the fish delivery
function createChimeSound() {
  const sampleRate = 44100;
  const notes = [659, 831, 988]; // E5 Ab5 B5 - warm major feel
  const noteDuration = 0.1;
  const totalDuration = notes.length * noteDuration + 0.3;
  const samples = [];

  for (let i = 0; i < sampleRate * totalDuration; i++) {
    const t = i / sampleRate;
    let sample = 0;

    for (let n = 0; n < notes.length; n++) {
      const noteTime = t - n * noteDuration;
      if (noteTime >= 0 && noteTime < 0.3) {
        const envelope = Math.exp(-noteTime * 7) * Math.min(1, noteTime * 60);
        const tone = Math.sin(2 * Math.PI * notes[n] * noteTime);
        const warm = Math.sin(2 * Math.PI * notes[n] * 0.5 * noteTime) * 0.3;
        sample += (tone + warm) * envelope * 0.3;
      }
    }
    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'chime.wav'), buffer);
  console.log('Created chime.wav');
}

// Spin - accelerating whirl for the spinner tile
function createSpinSound() {
  const sampleRate = 44100;
  const duration = 0.6;
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Wobble that speeds up as the spin accelerates
    const wobbleRate = 6 + progress * 22;
    const freq = 500 + Math.sin(2 * Math.PI * wobbleRate * t) * 150 + progress * 200;
    const envelope = Math.sin(progress * Math.PI) * 0.6;
    const tone = Math.sin(2 * Math.PI * freq * t);
    const air = (Math.random() - 0.5) * 0.2;
    samples.push((tone + air) * envelope * 0.4);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'spin.wav'), buffer);
  console.log('Created spin.wav');
}

console.log('Generating sound effects...');
createCaughtSound();
createCheeseSound();
createSlideSound();
createLevelCompleteSound();
createHoleActivateSound();
createBackgroundMusic();
createCountdownBeep();
createGoSound();
createCrackSound();
createSplashSound();
createSqueakSound();
createBoingSound();
createGoldenSound();
createBoostSound();
createWheeeSound();
createWarpSound();
createYipSound();
createPlugSound();
createChimeSound();
createSpinSound();
console.log('Done!');
