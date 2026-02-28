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

console.log('Generating sound effects...');
createCaughtSound();
createCheeseSound();
createSlideSound();
createLevelCompleteSound();
createHoleActivateSound();
console.log('Done!');
