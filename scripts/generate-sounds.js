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
  buffer.writeUInt32LE(16, offset); offset += 4; // chunk size
  buffer.writeUInt16LE(1, offset); offset += 2; // PCM format
  buffer.writeUInt16LE(numChannels, offset); offset += 2;
  buffer.writeUInt32LE(sampleRate, offset); offset += 4;
  buffer.writeUInt32LE(byteRate, offset); offset += 4;
  buffer.writeUInt16LE(blockAlign, offset); offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset); offset += 2;

  // data chunk
  buffer.write('data', offset); offset += 4;
  buffer.writeUInt32LE(dataSize, offset); offset += 4;

  // Write samples
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(sample * 32767), offset);
    offset += 2;
  }

  return buffer;
}

// "Caught" sound - short descending buzzy tone
function createCaughtSound() {
  const sampleRate = 44100;
  const duration = 0.3; // 300ms
  const samples = [];

  for (let i = 0; i < sampleRate * duration; i++) {
    const t = i / sampleRate;
    const progress = t / duration;

    // Descending frequency from 400Hz to 150Hz
    const freq = 400 - (250 * progress);

    // Envelope: quick attack, sustain, quick release
    let envelope;
    if (progress < 0.05) {
      envelope = progress / 0.05;
    } else if (progress > 0.8) {
      envelope = (1 - progress) / 0.2;
    } else {
      envelope = 1;
    }

    // Mix of sine and square for a slightly buzzy sound
    const sine = Math.sin(2 * Math.PI * freq * t);
    const square = Math.sign(Math.sin(2 * Math.PI * freq * t));
    const sample = (sine * 0.7 + square * 0.3) * envelope * 0.5;

    samples.push(sample);
  }

  const buffer = createWav(samples, sampleRate);
  fs.writeFileSync(path.join(ASSETS_DIR, 'caught.wav'), buffer);
  console.log('Created caught.wav');
}

console.log('Generating sound effects...');
createCaughtSound();
console.log('Done!');
