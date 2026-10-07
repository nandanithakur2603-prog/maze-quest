# Trail Quest — Block-Coding Maze Game

A Scratch/Blockly-style puzzle game for teaching ages 9–12 the basics of
sequencing, turns, and loops. Kids drag blocks to guide an explorer
through a maze to the flag. Built for a single laptop + projector
classroom demo — **no internet connection required once downloaded**,
no installation, no server.

## How to run it

1. Unzip the `maze-quest` folder anywhere on your laptop.
2. Double-click `index.html`. It opens in your default browser (Chrome,
   Edge, or Firefox all work).
3. That's it — everything (Blockly, sounds, icons) is bundled locally
   in the `lib/` folder, so it works with wifi off.

If double-clicking ever shows a blank page in your browser (some
browsers restrict local file access for security), instead:
- Open a terminal in the `maze-quest` folder
- Run: `python3 -m http.server 8000`
- Open `http://localhost:8000` in your browser

## What's included: 4 pilot levels

| Level | Teaches | Solution shape |
|---|---|---|
| 1. First Steps | Sequencing | 3× "move forward" |
| 2. Turn the Corner | Turning | move, move, turn right, move |
| 3. The Long Walk | Why loops help | "repeat 7 { move forward }" instead of 7 separate blocks |
| 4. The Ring | Loops + turns together | "repeat 3 { move, move, turn right }" |

Kids can always solve a level by brute-force dragging (e.g. 7 individual
move blocks for Level 3) — the Repeat block is introduced as a helpful
shortcut, not a hard requirement. That keeps early wins easy while still
motivating the "why loops matter" conversation.

## Part 2: Teach Robo (intro AI)

Open `ai.html` (or click "Teach Robo (AI)" in the nav bar from the maze
page). This is a second, self-contained activity that introduces the
core idea behind machine learning — **without any of the underlying
math on screen.**

**How it works:** kids place example fruits on a 2D map (Size vs.
Sweetness) and label each one Sweet or Sour. To predict a *new* fruit,
Robo finds the closest example it has already seen and copies that
label — this is a real technique (1-nearest-neighbor classification),
just never named as such. A live-shaded background shows Robo's
"decision boundary" — the invisible line it has drawn between Sweet and
Sour based on what it's been shown — updating instantly as more
examples are added.

A **Mystery Fruit Quiz** (6 hidden fruits, not shown on the map) lets
kids check how accurate Robo has become, and see that accuracy improve
as they add more, better-spread-out examples. This is the core lesson:
**models are only as good as the examples they're trained on.**

Good discussion prompts for this activity:
- "Robo got 3/6 fruits wrong — what could we show it to help it improve?"
- "What happens if we only give Robo examples from one corner of the
  map?" (Have them try it — accuracy stays low because Robo has no
  nearby example to compare unfamiliar fruits to.)
- "Is Robo actually 'thinking', or just copying its closest example?"
  (Good segue into what real AI systems do at a bigger scale.)

## Running the class session (suggested flow, ~70–80 min for both parts)

**Part 1 — Coding Maze (~40–45 min)**
1. **Hook (5 min):** Ask "How would you tell a robot, using only 3
   instructions — move, turn left, turn right — to walk to that door?"
   Get a few kids to act it out physically.
2. **Level 1–2 (10 min):** Let them explore the blocks freely, solve by
   trial and error. Most will succeed without help.
3. **Level 3 (10 min):** Let a few kids get frustrated dragging 7 blocks
   before revealing the Repeat block. This makes the "why" of loops
   land, rather than presenting it as an arbitrary tool.
4. **Level 4 (10 min):** Combine turn + repeat. Good checkpoint for
   understanding.
5. **Wrap-up (5–10 min):** Ask kids to predict what happens if they
   change the repeat count by 1 (off-by-one intuition), or challenge
   early finishers to solve Level 1 or 2 *using* a repeat block too.

**Part 2 — Teach Robo / intro AI (~25–30 min)**
1. **Hook (5 min):** Ask "If I showed you 3 fruits and told you which
   were sweet, could you guess a 4th one you've never seen?" Draw the
   parallel to how they'll teach Robo the same way.
2. **Free play (10 min):** Let kids add a handful of examples and test
   a few points. Most predictions will already feel intuitive.
3. **Quiz + improve (10 min):** Run the Mystery Fruit Quiz, discuss the
   score, then have kids add more/better-spread examples and re-quiz to
   watch the score improve.
4. **Wrap-up (5 min):** Use the discussion prompts below to connect this
   to real AI systems.

## Customizing / extending it

Everything is plain HTML/CSS/JS — no build step, so you can edit files
directly and just refresh the browser.

- **Add or edit levels:** open `levels.js`. Each level just needs a grid
  size, a list of walkable `[row, col]` cells, a start position/facing
  direction, and a goal cell. Comments at the top explain the format.
- **Add a new block** (e.g. "jump" or a conditional "if wall ahead"):
  open `app.js` and follow the pattern used for `maze_move_forward` —
  define the block, then register what JavaScript code it generates via
  `Blockly.JavaScript.forBlock['your_block_id']`.
- **Change the look:** all colors/fonts are CSS variables at the top of
  `style.css`.

## Where this could go next (not built yet — happy to build if useful)

- **Per-student progress saving**, if you move to one-laptop-per-kid —
  this would need a small local server instead of the single static
  file.
- More maze levels (conditionals: "if wall ahead, turn"; variables/
  functions for combining moves into a reusable block).
- A harder Teach Robo round with 3 categories instead of 2, or a
  feature that's deliberately misleading, to discuss bias in training
  data at an intro level.

## Requirements

- Any modern browser (Chrome, Edge, Firefox). No installs, no accounts,
  no internet needed after you've copied the folder onto the laptop.
