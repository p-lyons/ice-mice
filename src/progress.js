// Saved progress: beaten levels, golden-cheese stars, best-run ghosts, and
// the chosen hat. Stored in localStorage so kids can close the browser and
// pick up where they left off.

const STORAGE_KEY = 'ice-mice-progress';

// Hats unlock as golden-cheese stars pile up. Cosmetic only.
export const HATS = [
  { key: 'hat-scarf', name: 'Scarf', stars: 2 },
  { key: 'hat-top', name: 'Top Hat', stars: 5 },
  { key: 'hat-viking', name: 'Viking', stars: 8 },
  { key: 'hat-crown', name: 'Crown', stars: 12 }
];

export function loadProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      beaten: (parsed && parsed.beaten) || {},
      stars: (parsed && parsed.stars) || {},
      ghosts: (parsed && parsed.ghosts) || {},
      selectedHat: (parsed && parsed.selectedHat) || null
    };
  } catch (e) {
    return { beaten: {}, stars: {}, ghosts: {}, selectedHat: null };
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // Storage unavailable (private mode etc.) - progress just won't persist
  }
}

export function recordLevelResult(levelIndex, goldenCollected) {
  const progress = loadProgress();
  progress.beaten[levelIndex] = true;
  if (goldenCollected) {
    progress.stars[levelIndex] = true;
  }
  saveProgress(progress);
  return progress;
}

export function starCount() {
  return Object.keys(loadProgress().stars).length;
}

export function getSelectedHat() {
  return loadProgress().selectedHat;
}

export function setSelectedHat(hatKey) {
  const progress = loadProgress();
  progress.selectedHat = hatKey || null;
  saveProgress(progress);
}

// Ghosts: the best solo run per level, as a flat [x0, y0, x1, y1, ...] path
// sampled on a fixed interval. Small enough to keep in localStorage.
export function getGhost(levelIndex) {
  return loadProgress().ghosts[levelIndex] || null;
}

// Saves only if this run beat the stored best time. Returns true when the
// new ghost was recorded (i.e. "New best!").
export function saveGhostIfBest(levelIndex, timeMs, path) {
  const progress = loadProgress();
  const existing = progress.ghosts[levelIndex];
  if (existing && existing.time <= timeMs) return false;
  progress.ghosts[levelIndex] = { time: Math.round(timeMs), path: path.map(Math.round) };
  saveProgress(progress);
  return true;
}
