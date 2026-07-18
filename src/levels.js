// Tile codes:
// 0 = ice (open)
// 1 = snowbank (wall)
// 2 = cheese (collectible)
// 3 = mouse hole (exit)
// 4 = mouse start position
// 5 = polar bear patrol start
// 6 = cracking ice (cracks on first pass, breaks to water on second)
// 7 = melting ice (15-second timer, warns at 5s, melts to water - persists through death)
// 8 = golden cheese (optional bonus - earns a star on the level select)
// 9 = walrus (sleeping bumper - mice ping off its belly)
// 10 = speed streak right (flings the mouse past max speed)
// 11 = speed streak left
// 12 = speed streak up
// 13 = speed streak down
// 14 = slush (high drag - the one place a mouse can actually stop)
// 15 = penguin patrol start (friendly belly-slider, nudges but never hurts)
// 16 = ice block (pushable; slides until it hits something, plugs water holes)
// 17 = burrow (paired in reading order 1st+2nd, 3rd+4th; teleports with velocity)
// 18 = spinner (whirls the mouse and flings it out)
// 19 = wind right / 20 = wind left / 21 = wind up / 22 = wind down (steady push)
// 23 = fox den (fox pounces on a fixed marked tile; needs a `foxes` target entry)
// 24 = otter pool (open water, but the otter tosses fallen mice back out)
// 25 = frozen fish (carry it to a penguin for a thank-you party)

// Grid: 16 columns x 12 rows (48px tiles)
// Canvas: 800x600, grid offset: x=16, y=24 (24px HUD at top)

const TILE_SIZE = 48;
const GRID_OFFSET_X = 16;
const GRID_OFFSET_Y = 24;

// Helper to convert grid coordinates to pixel coordinates
function gridToPixel(col, row) {
  return {
    x: GRID_OFFSET_X + col * TILE_SIZE + TILE_SIZE / 2,
    y: GRID_OFFSET_Y + row * TILE_SIZE + TILE_SIZE / 2
  };
}

const levels = [
  // Level 1: Tutorial - Small open pond, 3 cheeses, no bears
  // Golden cheese in the top-right corner teaches wall-bounce control
  {
    name: 'First Slide',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: []
  },

  // Level 2: Snowbank maze, 5 cheeses, no bears
  // Penguin buddy slides along the bottom; golden cheese in a dead-end pocket
  {
    name: 'Snowbank Maze',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 0, 2, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 15, 0, 0, 0, 0, 0, 0, 2, 0, 1],
      [1, 8, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [],
    penguins: [
      // Penguin slides back and forth along the bottom corridor
      [gridToPixel(6, 9), gridToPixel(12, 9)]
    ]
  },

  // Level 3: First bear, simple patrol, 5 cheeses, intro to cracking ice
  // Bear patrols horizontally in the middle corridor
  // Golden cheese sits inside the bear's box
  {
    name: 'Bear Crossing',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 5, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 8, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 6, 0, 6, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: horizontal patrol in the box (back and forth)
      [gridToPixel(4, 5), gridToPixel(11, 5)]
    ]
  },

  // Level 4: Two bears, tighter corridors, 7 cheeses, cracking + melting ice intro
  // Slush patch gives a safe brake spot; golden cheese at the end of a bear corridor
  {
    name: 'Thin Ice',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 5, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 1],
      [1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1],
      [1, 2, 0, 6, 0, 0, 0, 0, 1, 0, 0, 6, 0, 0, 2, 1],
      [1, 0, 0, 6, 0, 14, 14, 0, 1, 0, 0, 6, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 0, 0, 6, 0, 0, 5, 0, 0, 0, 8, 1],
      [1, 2, 0, 0, 1, 0, 0, 6, 0, 0, 0, 0, 1, 7, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 7, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: vertical patrol in top corridor
      [gridToPixel(6, 1), gridToPixel(6, 3)],
      // Bear 2: horizontal patrol in bottom area
      [gridToPixel(5, 8), gridToPixel(11, 8)]
    ]
  },

  // Level 5: Truly double trouble - TWO rooms, each owned by one bear on a
  // big predictable rectangular loop. The challenge is planning: time the
  // loops, pick your crossing (safe top/bottom bands vs. the one-way cracking
  // shortcut through the middle), and dart into bear 2's loop for the golden.
  // Corridors stay wide; nothing requires twitch dodging.
  {
    name: 'Double Trouble',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 1, 2, 0, 1, 0, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 6, 6, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 5, 0, 0, 1, 6, 6, 1, 0, 0, 5, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 9, 0, 0, 0, 1, 2, 0, 1, 0, 7, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: clockwise loop around the left room's cheese
      [gridToPixel(2, 3), gridToPixel(5, 3), gridToPixel(5, 7), gridToPixel(2, 7)],
      // Bear 2: clockwise loop through the right room - it walks right over
      // the golden cheese spot, so kids learn the loop and dart in behind it
      [gridToPixel(11, 3), gridToPixel(14, 3), gridToPixel(14, 7), gridToPixel(11, 7)]
    ]
  },

  // Level 6: Cracking ice gauntlet - two bears, 7 cheese
  // Tighter layout with bears patrolling. Most direct paths cross cracking tiles.
  // Golden cheese in the heart of the crack field; speed streak on the bottom run.
  {
    name: 'Crackle Field',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 1],
      [1, 0, 0, 0, 1, 0, 5, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 6, 6, 1, 0, 0, 0, 0, 0, 0, 1, 6, 6, 0, 1],
      [1, 0, 6, 6, 0, 0, 0, 1, 1, 0, 0, 0, 6, 6, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 6, 6, 0, 0, 6, 6, 0, 0, 0, 0, 1],
      [1, 0, 6, 6, 0, 6, 6, 8, 0, 6, 6, 0, 6, 6, 0, 1],
      [1, 2, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 2, 1],
      [1, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: horizontal patrol in top area
      [gridToPixel(5, 2), gridToPixel(10, 2)],
      // Bear 2: horizontal patrol in bottom area
      [gridToPixel(3, 9), gridToPixel(12, 9)]
    ]
  },

  // Level 7: Melting ice pressure - two bears, 6 cheese
  // Melting tiles create time pressure. Some block shortcuts, others open new paths.
  // Golden cheese in a melting-flanked pocket; slush brake pad + penguin below.
  {
    name: 'The Big Melt',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 2, 0, 0, 0, 7, 0, 0, 5, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 7, 0, 8, 0, 7, 0, 0, 0, 5, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 15, 0, 0, 0, 0, 14, 14, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: horizontal patrol in top-right
      [gridToPixel(10, 2), gridToPixel(13, 2)],
      // Bear 2: vertical patrol on right side
      [gridToPixel(13, 6), gridToPixel(13, 9)]
    ],
    penguins: [
      // Penguin cruises the lower corridor, left of the slush
      [gridToPixel(2, 9), gridToPixel(6, 9)]
    ]
  },

  // Level 8: Cracking + melting combo - two bears, 7 cheese
  // Safe early paths cross cracking tiles, but as melting tiles open water holes,
  // new routes become available (or necessary). Walrus bumper guards the left side;
  // a down-streak flings you through the right-hand crack field.
  {
    name: "Slip 'n Slide",
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 1, 0, 0, 0, 5, 0, 0, 1, 0, 0, 2, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 13, 0, 1],
      [1, 0, 6, 6, 1, 0, 1, 1, 1, 1, 0, 1, 6, 6, 0, 1],
      [1, 0, 6, 6, 0, 0, 0, 7, 7, 0, 0, 0, 6, 6, 0, 1],
      [1, 0, 0, 0, 9, 0, 0, 7, 7, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 1, 1, 0, 8, 1, 1, 0, 0, 0, 0, 1],
      [1, 0, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 0, 1],
      [1, 2, 6, 6, 0, 0, 5, 0, 0, 0, 0, 0, 6, 6, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: horizontal patrol across top corridor
      [gridToPixel(5, 1), gridToPixel(10, 1)],
      // Bear 2: horizontal patrol across bottom area
      [gridToPixel(4, 9), gridToPixel(11, 9)]
    ]
  },

  // Level 9: Heavy cracking "one-shot" paths - three bears, 8 cheese
  // Most paths can only be traveled once due to cracking ice.
  // Golden cheese in the right-side bear's turf; speed streak along the bottom.
  {
    name: 'One-Way Ice',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 6, 6, 0, 2, 1, 2, 0, 6, 6, 0, 8, 0, 1],
      [1, 0, 0, 6, 6, 0, 0, 1, 0, 0, 6, 6, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 5, 0, 1],
      [1, 6, 6, 0, 1, 1, 1, 1, 1, 1, 1, 0, 6, 6, 0, 1],
      [1, 6, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 0, 1],
      [1, 0, 0, 0, 0, 5, 0, 7, 0, 5, 0, 0, 0, 0, 2, 1],
      [1, 2, 0, 6, 6, 0, 0, 0, 0, 0, 6, 6, 0, 1, 1, 1],
      [1, 0, 0, 6, 6, 0, 1, 1, 1, 0, 6, 6, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 1, 7, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: vertical patrol on right side (stays away from start)
      [gridToPixel(13, 2), gridToPixel(13, 5)],
      // Bear 2: horizontal patrol in middle
      [gridToPixel(2, 6), gridToPixel(6, 6)],
      // Bear 3: horizontal patrol in middle-right
      [gridToPixel(9, 6), gridToPixel(13, 6)]
    ]
  },

  // Level 10: The Finale - three bears with complex patrols, 9 cheese
  // Mix of cracking and melting ice. Puzzle-like: must plan cheese collection order
  // because cracking tiles cut off paths behind you. Mouse hole behind a gauntlet.
  // Penguin cruises the mid corridor, walrus bumper on the right, and a speed
  // streak that rockets across the bottom row - before it melts.
  {
    name: 'The Big Freeze',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 2, 0, 6, 1, 0, 0, 0, 1, 6, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 6, 1, 8, 5, 0, 1, 6, 0, 0, 0, 1],
      [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 1, 6, 6, 1, 7, 7, 1, 6, 6, 1, 0, 0, 1],
      [1, 2, 0, 1, 6, 6, 1, 7, 7, 1, 6, 6, 1, 0, 2, 1],
      [1, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 0, 1],
      [1, 0, 5, 0, 0, 6, 1, 0, 0, 1, 6, 0, 0, 5, 0, 1],
      [1, 0, 0, 0, 0, 6, 1, 0, 0, 1, 6, 0, 0, 0, 0, 1],
      [1, 2, 0, 1, 1, 1, 1, 6, 6, 1, 1, 1, 1, 0, 2, 1],
      [1, 0, 10, 0, 0, 7, 7, 6, 6, 7, 7, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: L-shaped patrol in top-middle area
      [gridToPixel(8, 1), gridToPixel(8, 3), gridToPixel(5, 3), gridToPixel(5, 1)],
      // Bear 2: triangular patrol on left side
      [gridToPixel(2, 6), gridToPixel(2, 8), gridToPixel(4, 7)],
      // Bear 3: triangular patrol on right side
      [gridToPixel(13, 6), gridToPixel(13, 8), gridToPixel(11, 7)]
    ],
    penguins: [
      // Penguin slides along the left half of the mid corridor
      [gridToPixel(2, 6), gridToPixel(7, 6)]
    ]
  },

  // Level 11: Ice block intro - push blocks around, plug melting holes.
  // One slow bear at the bottom. The golden cheese hides in a melting pocket.
  {
    name: 'Block Party',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 1, 2, 0, 0, 0, 0, 1, 8, 0, 2, 1],
      [1, 0, 0, 16, 0, 1, 0, 0, 16, 0, 0, 1, 7, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 7, 0, 0, 1],
      [1, 2, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
      [1, 0, 16, 0, 0, 0, 7, 7, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1],
      [1, 2, 0, 0, 1, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 5, 0, 0, 1, 0, 0, 0, 2, 0, 1],
      [1, 0, 0, 2, 0, 0, 0, 0, 0, 7, 7, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: horizontal patrol along the bottom corridor
      [gridToPixel(2, 9), gridToPixel(8, 9)]
    ]
  },

  // Level 12: Burrow tunnels - two color-coded pairs warp across bear walls.
  // Velocity carries through, so a fast entry means a fast exit.
  {
    name: 'Tunnel Town',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 1, 0, 0, 2, 0, 0, 1, 2, 0, 17, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 17, 0, 1, 0, 5, 0, 0, 0, 1, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 8, 0, 0, 1, 2, 0, 1],
      [1, 1, 1, 0, 1, 2, 0, 6, 6, 0, 0, 0, 1, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 6, 6, 0, 0, 0, 1, 17, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 5, 0, 1, 0, 0, 1],
      [1, 0, 17, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2, 1],
      [1, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: horizontal patrol in the upper room
      [gridToPixel(5, 3), gridToPixel(9, 3)],
      // Bear 2: vertical patrol guarding the right corridor
      [gridToPixel(10, 7), gridToPixel(10, 9)]
    ]
  },

  // Level 13: Wind and spinners - crosswinds guard the vertical corridors and
  // two spinners sit mid-field between the bear lanes. Slush pads to recover.
  {
    name: 'Windy Pond',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 2, 0, 0, 22, 0, 0, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 22, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 19, 19, 19, 0, 22, 0, 1, 1, 0, 0, 1],
      [1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1],
      [1, 0, 0, 1, 0, 5, 0, 0, 18, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 14, 0, 0, 0, 0, 8, 0, 0, 0, 14, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 18, 0, 5, 0, 1, 0, 0, 1],
      [1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1],
      [1, 0, 0, 1, 1, 20, 20, 20, 0, 21, 0, 1, 1, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 0, 0, 0, 21, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: patrol across the upper spinner lane
      [gridToPixel(4, 5), gridToPixel(11, 5)],
      // Bear 2: patrol across the lower spinner lane
      [gridToPixel(4, 7), gridToPixel(11, 7)]
    ]
  },

  // Level 14: Fox intro - it pounces on the golden cheese spot on a fixed
  // rhythm. A friendly otter pool forgives one route mistake, and a frozen
  // fish waits for delivery to the penguin cruising the bottom lane.
  {
    name: 'Fox Trot',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 1, 2, 0, 0, 0, 0, 0, 2, 1, 0, 2, 1],
      [1, 0, 0, 0, 1, 0, 0, 23, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 6, 0, 1],
      [1, 1, 0, 0, 0, 1, 0, 5, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 25, 0, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 2, 0, 1],
      [1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 6, 0, 0, 1],
      [1, 0, 0, 6, 1, 1, 0, 2, 0, 0, 0, 1, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 15, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: horizontal patrol through the middle
      [gridToPixel(6, 5), gridToPixel(10, 5)]
    ],
    foxes: [
      // Fox 1: pounces right onto the golden cheese spot
      gridToPixel(9, 3)
    ],
    penguins: [
      // Penguin cruises the bottom lane, waiting for its fish
      [gridToPixel(4, 10), gridToPixel(12, 10)]
    ]
  },

  // Level 15: The grand finale under the northern lights. Everything at once:
  // burrows, spinners, wind, a fox guarding the golden chamber, twin bears,
  // a walrus bumper, an ice block, and a fish for the penguin.
  {
    name: 'Northern Lights',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 2, 0, 17, 1, 0, 0, 2, 0, 0, 1, 6, 0, 2, 0, 1],
      [1, 0, 0, 0, 1, 0, 23, 0, 0, 0, 1, 0, 0, 0, 0, 1],
      [1, 4, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 16, 0, 2, 1],
      [1, 0, 0, 1, 6, 6, 1, 0, 0, 1, 7, 7, 1, 0, 0, 1],
      [1, 2, 0, 1, 0, 0, 1, 25, 0, 1, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 5, 0, 0, 0, 0, 5, 0, 0, 0, 9, 1],
      [1, 0, 15, 1, 0, 0, 1, 0, 8, 1, 0, 0, 1, 0, 0, 1],
      [1, 2, 0, 1, 7, 7, 1, 0, 0, 1, 6, 6, 1, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 18, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 17, 0, 2, 0, 19, 19, 0, 0, 2, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: patrols the left half of the great hall
      [gridToPixel(3, 6), gridToPixel(7, 6)],
      // Bear 2: patrols the right half of the great hall
      [gridToPixel(9, 6), gridToPixel(13, 6)]
    ],
    foxes: [
      // Fox 1: pounces down onto the upper spinner - ride at your peril
      gridToPixel(8, 3)
    ],
    penguins: [
      // Penguin bobs up and down the left aisle
      [gridToPixel(2, 6), gridToPixel(2, 9)]
    ]
  },

  // Level 16: A sealed vault of treasure in the middle of the pond. The ONLY
  // way in (and out) is the burrow pair. Two bears sweep the outside.
  {
    name: 'Cheese Vault',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 1, 2, 0, 8, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 17, 0, 0, 1, 0, 5, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 2, 0, 2, 0, 1, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 0, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 6, 0, 2, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: long sweep across the vault's north face
      [gridToPixel(2, 3), gridToPixel(13, 3)],
      // Bear 2: vertical patrol down the vault's east side
      [gridToPixel(12, 4), gridToPixel(12, 9)]
    ]
  },

  // Level 17: Fight leftward gales to reach the east side. The speed streak
  // punches through the headwind; the slush pads are rest stops.
  {
    name: 'Headwinds',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
      [1, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 2, 0, 0, 0, 20, 20, 20, 20, 20, 20, 0, 0, 0, 0, 1],
      [1, 0, 10, 0, 0, 20, 20, 20, 20, 20, 20, 0, 2, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 14, 0, 0, 5, 0, 0, 0, 0, 0, 14, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1],
      [1, 2, 0, 0, 8, 0, 0, 0, 11, 0, 0, 2, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: sweeps the top room
      [gridToPixel(1, 2), gridToPixel(14, 2)],
      // Bear 2: sweeps the third shelf between the slush pads
      [gridToPixel(1, 8), gridToPixel(11, 8)]
    ]
  },

  // Level 18: A great melting lake with two friendly otters living in it.
  // The ring of melting ice closes shortcuts as it thaws; the gaps stay open.
  {
    name: 'Otter Lake',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 1],
      [1, 0, 0, 7, 7, 0, 7, 7, 7, 0, 7, 7, 0, 0, 0, 1],
      [1, 2, 0, 7, 0, 0, 2, 0, 0, 0, 0, 7, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 24, 0, 0, 14, 2, 0, 0, 0, 2, 0, 1],
      [1, 0, 0, 7, 0, 0, 0, 0, 0, 24, 0, 7, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 14, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 7, 7, 0, 7, 7, 7, 0, 7, 7, 0, 8, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: patrols the north shore
      [gridToPixel(2, 2), gridToPixel(13, 2)],
      // Bear 2: patrols the south shore
      [gridToPixel(2, 10), gridToPixel(12, 10)]
    ]
  },

  // Level 19: Two foxes pounce into the central alley on their own rhythms.
  // The slush pads are safe benches to sit and study the beat; the golden
  // waits at the alley's far end.
  {
    name: 'Fox Alley',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 1, 1, 23, 1, 1, 1, 1, 23, 1, 1, 0, 0, 1],
      [1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 0, 0, 0, 0, 14, 0, 2, 0, 0, 14, 0, 0, 0, 8, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
      [1, 2, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 2, 1],
      [1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: sweeps the top approach
      [gridToPixel(2, 2), gridToPixel(13, 2)]
    ],
    foxes: [
      // Fox 1 pounces into the alley's west half
      gridToPixel(6, 5),
      // Fox 2 pounces into the alley's east half
      gridToPixel(9, 5)
    ]
  },

  // Level 20: The plug factory. Four melting gates guard a chamber holding
  // the golden cheese; blocks are staged one push away from each gate. Grab
  // it early, or engineer your way in later.
  {
    name: 'Ice Factory',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 1, 2, 0, 0, 0, 0, 2, 1, 0, 2, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 1],
      [1, 0, 0, 0, 1, 0, 0, 16, 0, 0, 0, 1, 0, 0, 0, 1],
      [1, 1, 1, 0, 1, 1, 1, 7, 7, 1, 1, 1, 0, 1, 1, 1],
      [1, 2, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 2, 1],
      [1, 0, 16, 0, 0, 0, 7, 0, 8, 7, 0, 0, 0, 16, 0, 1],
      [1, 0, 0, 5, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: short vertical patrol on the east approach
      [gridToPixel(13, 1), gridToPixel(13, 4)],
      // Bear 2: short patrol below the factory floor
      [gridToPixel(1, 8), gridToPixel(4, 8)]
    ]
  },

  // Level 21: A breather with zero bears. Walrus bumpers, spinners, and
  // streaks turn the pond into a pinball table; the golden sits in a nest
  // of cracking ice that punishes sloppy bouncing.
  {
    name: 'Pinball Pond',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 9, 0, 0, 0, 13, 0, 0, 13, 0, 0, 0, 9, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 18, 0, 0, 6, 6, 0, 0, 18, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 6, 0, 0, 6, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 6, 8, 0, 6, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 6, 6, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 9, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0, 0, 1],
      [1, 0, 2, 0, 0, 0, 10, 0, 0, 2, 0, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: []
  },

  // Level 22: Rush-hour crosswalk. Three bears run vertical lanes at
  // different phases; crosswinds shove you between lanes. Watch, wait, go.
  {
    name: 'The Crossing',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 5, 0, 0, 0, 5, 0, 0, 0, 5, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 14, 0, 0, 0, 14, 0, 0, 0, 0, 1],
      [1, 0, 0, 22, 0, 0, 0, 0, 21, 0, 0, 0, 22, 0, 2, 1],
      [1, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 22, 0, 14, 0, 0, 21, 0, 0, 0, 22, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 22, 0, 0, 14, 0, 21, 0, 14, 0, 22, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Three lanes, staggered phases: bear 2 starts by heading the other way
      [gridToPixel(4, 1), gridToPixel(4, 9)],
      [gridToPixel(8, 9), gridToPixel(8, 1)],
      [gridToPixel(12, 1), gridToPixel(12, 9)]
    ]
  },

  // Level 23: Four rooms, one bottom corridor, and two burrow pairs doing
  // the connecting. The northwest room's only exit is its burrow - plan the
  // whole tour before you hop.
  {
    name: 'Four Corners',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 2, 0, 1, 1, 2, 0, 0, 0, 0, 17, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 5, 0, 0, 0, 1],
      [1, 0, 2, 0, 17, 0, 0, 1, 1, 0, 0, 0, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 1, 1, 17, 0, 0, 0, 0, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 0, 0, 17, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 2, 0, 1, 1, 0, 2, 0, 0, 5, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 5, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 0, 0, 8, 0, 0, 0, 0, 2, 0, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: sweeps the northeast room
      [gridToPixel(9, 2), gridToPixel(13, 2)],
      // Bear 2: vertical patrol in the southeast room
      [gridToPixel(13, 6), gridToPixel(13, 9)],
      // Bear 3: sweeps the southwest room
      [gridToPixel(1, 9), gridToPixel(6, 9)]
    ]
  },

  // Level 24: A proper blizzard. Wind from every direction, slush islands
  // to catch your breath, a fox on the prowl, and an otter mid-pond in case
  // the gusts win.
  {
    name: 'Blizzard Alley',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 20, 20, 0, 0, 2, 0, 0, 0, 2, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 1],
      [1, 2, 0, 19, 19, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 22, 0, 0, 0, 20, 20, 0, 2, 0, 1],
      [1, 0, 14, 0, 0, 0, 22, 0, 24, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 19, 19, 0, 0, 0, 0, 0, 14, 0, 0, 2, 1],
      [1, 2, 0, 0, 0, 0, 0, 21, 0, 0, 19, 19, 0, 0, 0, 1],
      [1, 0, 0, 14, 0, 0, 0, 21, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 20, 20, 0, 0, 14, 0, 0, 5, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 8, 0, 0, 2, 0, 0, 3, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Bear 1: patrols the bottom stretch near the exit
      [gridToPixel(9, 9), gridToPixel(14, 9)]
    ],
    foxes: [
      // Fox 1: dives from its den into the mid-field
      gridToPixel(11, 5)
    ]
  },

  // Level 25: The Last Pond. The exit hole sits inside a walled keep with
  // the golden cheese beside it. The north shortcut melts shut, the south
  // gate stays open but is flanked by twin bears. Fox on the wall, penguin
  // waiting for one last fish, spinner and burrows for the daredevils.
  {
    name: 'The Last Pond',
    grid: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 4, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 2, 1, 1, 6, 0, 0, 23, 0, 6, 1, 1, 2, 0, 1],
      [1, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 1],
      [1, 0, 0, 6, 0, 0, 1, 7, 7, 1, 0, 0, 6, 0, 17, 1],
      [1, 2, 0, 0, 0, 5, 1, 3, 8, 1, 5, 0, 0, 0, 0, 1],
      [1, 0, 0, 6, 0, 0, 1, 0, 0, 1, 0, 0, 6, 0, 0, 1],
      [1, 0, 0, 1, 2, 0, 0, 15, 0, 0, 0, 2, 1, 0, 0, 1],
      [1, 0, 0, 1, 1, 0, 18, 0, 0, 25, 0, 1, 1, 0, 0, 1],
      [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ],
    bears: [
      // Twin guards flanking the keep, pacing its full height
      [gridToPixel(5, 4), gridToPixel(5, 9)],
      [gridToPixel(10, 4), gridToPixel(10, 9)]
    ],
    foxes: [
      // Fox 1: guards the north approach to the keep
      gridToPixel(8, 4)
    ],
    penguins: [
      // Penguin paces the south gate, hoping for a farewell fish
      [gridToPixel(4, 8), gridToPixel(11, 8)]
    ]
  }
];

export default levels;
