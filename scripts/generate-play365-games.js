#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const THUMB_DIR = path.join(__dirname, '..', 'thumbnails');
const OUT_FILE = path.join(__dirname, '..', 'play365Games.js');
const BASE_URL = 'https://htmlgames.play365game.com';

function titleCase(slug) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function categorize(slug) {
  const s = slug.toLowerCase();
  const filters = new Set(['All Games']);
  const sections = new Set(['all-games']);

  const branded =
    /tom-and-jerry|star-wars|spongebob|teenage-mutant-ninja|scooby-doo|powerpuff|bunnicula|barbie|avenger|spider-man|hulk|looney-tunes|mr-bean|kung-fu-panda|dora|frozen|descendants|kim-possible|henry-danger|lego-star-wars|bugs-bunny|thundercats|disney|elena-of-avalor|goldie-bear|puss-in-boots|dennis-gnasher|malvsuma|mickyminnie|hanuman|indiara/.test(
      s
    );
  const sports =
    /airhockey|table-tennis|hoops|hurdles|minigolf|golf|billiard|trickshot|rafting|penalty|football|soccer|baseball|tennis|sport/.test(s);
  const racing =
    /aircraft|car-race|trafficracer|bikespeed|boom-car|crazycar|crazyrunner|racer|railrush|firetruck|chase|rush|run$|runner|driving/.test(s);
  const puzzle =
    /candy|match|bubble|bingo|babel|reasoning|freakymath|mind-grands|hiddenmistry|blockit|side-chain|duetto|pairs|puzzle|color|sudoku|word/.test(s);
  const action =
    /tank|sky-war|ninja|terror|shoot|fight|battle|defender|attack|war|combat|avenger|spider|hulk|gun|zombie|monster|samurai|hero/.test(s);
  const soothing =
    /balloon|forest|pond|swing|soothing|dress-up|makeup|cooking|creator|matching-pairs/.test(s);
  const multiplayer = /multiplayer|versus|vs-|tournament|2-player|foodfight|airhockey|table-tennis/.test(s);

  if (branded) {
    filters.add('Top 10 Games');
    sections.add('vip-games');
    sections.add('top-10-games');
  }
  if (sports) {
    filters.add('Arcade');
    sections.add('sports');
  }
  if (racing) {
    filters.add('Arcade');
    filters.add('Action');
    sections.add('quick-break-at-work');
  }
  if (puzzle) {
    filters.add('Puzzle');
    filters.add('Easy to Play');
    sections.add('train-your-brain');
  }
  if (action) {
    filters.add('Action');
    sections.add('games-with-leaderboard');
  }
  if (soothing) {
    filters.add('Easy to Play');
    sections.add('soothing');
  }
  if (multiplayer) {
    sections.add('multiplayer');
  }

  if (
    !puzzle &&
    !action &&
    !racing &&
    !sports &&
    /jump|ball|pin-|flip|catch|bird|plane|copter|arcade|platformer|swing/.test(s)
  ) {
    filters.add('Arcade');
    filters.add('Easy to Play');
    sections.add('quick-break-at-work');
  }

  if (filters.size === 1) {
    filters.add('Easy to Play');
    sections.add('quick-break-at-work');
  }

  return {
    filters: [...filters],
    sections: [...sections],
  };
}

const files = fs.readdirSync(THUMB_DIR).filter((f) => /\.(png|jpg|jpeg|gif|webp|ico)$/i.test(f));
files.sort();

const games = files.map((file) => {
  const slug = path.basename(file, path.extname(file));
  const { filters, sections } = categorize(slug);
  return {
    name: titleCase(slug),
    slug,
    url: `${BASE_URL}/${slug}/`,
    thumbnail: `./thumbnails/${file}`,
    categories: filters,
    sections,
  };
});

const out = `// Auto-generated from thumbnails/ — run: node scripts/generate-play365-games.js
export const play365Games = ${JSON.stringify(games, null, 2)};

export function getPlay365ForSection(sectionKey) {
  return play365Games.filter((g) => g.sections.includes(sectionKey));
}

export function getPlay365ForFilter(filterKey) {
  if (filterKey === 'all') return play365Games;
  return play365Games.filter((g) => g.categories.includes(filterKey));
}
`;

fs.writeFileSync(OUT_FILE, out);
console.log(`Wrote ${games.length} games to ${OUT_FILE}`);
