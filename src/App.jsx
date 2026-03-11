/*
CHANGELOG
---------
v1.6 - 2026-03-10
- Redesigned: Luna, Artemis, Diana as proper matched cat trio with anatomy, symbols, paws
- Added: SVG preview cards for all backgrounds, sparkle effects, and borders
- Fixed: Magical Garden / Cherry Blossom / Blossoms no longer share same image

v1.54 - 2026-03-10
- Added: Update splash screen on first visit after each update
- Added: Full version history screen (📋 What's New button on start screen)
- Added: New versioning system (x.0 massive, x.5 major, x.1-x.4 moderate, x.x1 patch)

v1.53 - 2026-03-10
- Added: Full custom SVG art for Baby Dragon, Tiny Fairy, Celestial Fox, Baby Phoenix

v1.52 - 2026-03-10
- Fixed: Loading screen full width, syntax error, home button added

v1.51 - 2026-03-10
- Fixed: Sparkles/pet contained in app, crystal popup positioning

v1.5 - 2026-03-10
- Added: Crystal shop, pet companions, magic crystal economy, cosmetics

v1.2 - 2026-03-10
- Added: Character gallery, mid-session unlocks

v1.1 - 2026-03-10
- Added: Netlify proxy, API key secured, rate limiting

v1.0 - 2026-03-10
- Initial launch
*/import { useState, useEffect, useRef, useCallback } from "react";

// Ensure full-width rendering
const GlobalStyle = () => (
  <style>{`
    html, body, #root { width: 100%; min-height: 100dvh; margin: 0; padding: 0; }
    * { box-sizing: border-box; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────────────────────
// VERSION & CHANGELOG
// ─────────────────────────────────────────────────────────────────────────────
const CURRENT_VERSION = "1.6";

const CHANGELOG = [
  {
    version: "1.6",
    date: "2026-03-10",
    label: "Cat Trio Redesign & Shop Art",
    emoji: "🐱",
    changes: [
      "Redesigned: Luna — proper sharp triangular ears, golden eyes, crescent forehead symbol, visible paws, matching cat anatomy",
      "Redesigned: Artemis — cream/white fur, vivid blue glowing eyes, mirrored crescent symbol, paws, distinct from Luna",
      "Redesigned: Diana — lavender-grey kitten, oversized violet eyes with sparkle, crescent+star symbol, tiny paws, tear when sad",
      "All three cats now share a consistent design language but are immediately recognisable as individuals",
      "Added: SVG preview cards for all Backgrounds — unique hand-drawn scenes (garden, night sky, cherry tree, forest, ocean, galaxy)",
      "Added: SVG preview cards for all Sparkle effects — unique compositions showing the effect style",
      "Added: SVG preview cards for all Border styles — accurate border previews",
      "Fixed: Magical Garden, Cherry Blossom, and Blossoms sparkles no longer share the same 🌸 image",
    ],
  },
  {
    version: "1.54",
    date: "2026-03-10",
    label: "Update Log System",
    emoji: "📋",
    changes: [
      "Added: Update splash screen — shows what's new automatically after each update",
      "Added: Full version history accessible from the start screen",
      "Added: New versioning system (x.0 = massive, x.5 = major, x.1–x.4 = moderate, x.x1 = patch)",
    ],
  },
  {
    version: "1.53",
    date: "2026-03-10",
    label: "Full Pet Artwork",
    emoji: "🎨",
    changes: [
      "Added: Full custom SVG art for Baby Dragon (green, sparkle breath, gold eyes)",
      "Added: Full custom SVG art for Tiny Fairy (pink dress, wings, wand)",
      "Added: Full custom SVG art for Celestial Fox (three tails, glowing blue eyes, cosmic markings)",
      "Added: Full custom SVG art for Baby Phoenix (flame feathers, ember eyes, glowing crest)",
      "All pets now have idle, happy, and sad animation states",
    ],
  },
  {
    version: "1.52",
    date: "2026-03-10",
    label: "Layout & Build Fixes",
    emoji: "🔧",
    changes: [
      "Fixed: Loading screen now fills full width on all devices",
      "Fixed: Syntax error in loading screen closing tag",
      "Fixed: Home button added to playing screen to return to start",
    ],
  },
  {
    version: "1.51",
    date: "2026-03-10",
    label: "Positioning Fixes",
    emoji: "📐",
    changes: [
      "Fixed: Sparkles now contained inside app — no longer leak outside on iPad",
      "Fixed: Pet companion now contained inside app boundaries",
      "Fixed: Crystal earned popup uses correct positioning",
      "Fixed: All screens now fill full width on iPad and iPhone",
    ],
  },
  {
    version: "1.5",
    date: "2026-03-10",
    label: "Crystal Shop & Pet Companions",
    emoji: "💎",
    changes: [
      "Added: Magic crystal economy — earn crystals for streaks, perfect sessions, no-hint runs",
      "Added: Crystal Shop with Pets, Backgrounds, Sparkles, and Borders tabs",
      "Added: Luna pet companion with idle/happy/sad animations on every problem",
      "Added: 8 purchasable pets: Luna (free), Moon Rabbit, Artemis, Baby Dragon, Tiny Fairy, Celestial Fox, Diana, Baby Phoenix",
      "Added: 6 background themes including Starry Night, Galaxy, Enchanted Forest",
      "Added: 6 sparkle effects including Rainbow, Hearts, Shooting Stars",
      "Added: 5 card border styles",
      "Added: Crystal balance shown in playing screen header",
      "Added: One-time bonuses for first Hard clear and first perfect score per difficulty",
    ],
  },
  {
    version: "1.2",
    date: "2026-03-10",
    label: "Character Gallery & Mid-Session Unlocks",
    emoji: "👯",
    changes: [
      "Added: Character Gallery — view all 16 characters from the start screen",
      "Added: Locked characters shown as silhouettes with unlock requirements",
      "Added: Tap any unlocked character for a profile card with their story",
      "Fixed: New character unlocks now appear immediately mid-session without restarting",
    ],
  },
  {
    version: "1.1",
    date: "2026-03-10",
    label: "Security & Gallery",
    emoji: "🔒",
    changes: [
      "Added: Netlify function proxy — API key now hidden server-side, safe to share",
      "Added: Rate limiting (10 sessions per IP per hour) to protect API credits",
      "Removed: API key from browser-side code entirely",
    ],
  },
  {
    version: "1.0",
    date: "2026-03-10",
    label: "Initial Launch",
    emoji: "🚀",
    changes: [
      "Core two-part math word problem engine with AI generation via Claude",
      "16 magical girl characters — 8 starters, 8 unlockable by star count",
      "Three difficulty levels: Easy, Medium, Hard with adaptive difficulty",
      "Star economy with character unlocks at milestone star counts",
      "Streak counter with bonus chime every 3 in a row",
      "Confetti celebration on 90%+ session score",
      "Sound effects: correct, wrong, streak, unlock, celebrate",
      "Hint system with 2 attempts per problem part before reveal",
      "Persistent progress via localStorage",
      "Mute button and difficulty toggle in playing screen header",
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SOUND ENGINE
// ─────────────────────────────────────────────────────────────────────────────
function createSound(frequencies, durations, type = "sine", volumeScale = 0.3) {
  return (muted) => {
    if (muted) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      let time = ctx.currentTime;
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(volumeScale, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + durations[i]);
        osc.start(time); osc.stop(time + durations[i]);
        time += durations[i];
      });
    } catch(e) {}
  };
}
const SOUNDS = {
  correct:   createSound([523,659,784,1047],[0.1,0.1,0.1,0.2],"sine",0.25),
  wrong:     createSound([200,150],[0.15,0.25],"sawtooth",0.15),
  streak:    createSound([784,880,988,1047,1175],[0.08,0.08,0.08,0.08,0.3],"sine",0.3),
  unlock:    createSound([523,659,784,1047,1319,1047,784,1047,1319],[0.1,0.1,0.1,0.1,0.3,0.1,0.1,0.1,0.4],"sine",0.3),
  celebrate: createSound([784,988,1175,1319,1568],[0.1,0.1,0.1,0.1,0.4],"sine",0.3),
  click:     createSound([440],[0.05],"sine",0.1),
};

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const STORAGE_KEY = "magicalMathV2";
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function saveData(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}
function defaultData() {
  return {
    totalStars: 0,
    sessionBest: 0,
    weakSpots: { add: 0, sub: 0, mul: 0, div: 0, rem: 0 },
    difficulty: "medium",
    muted: false,
    unlockedCount: 8,
    seenUnlockAt: [],
    // Crystal economy
    crystals: 0,
    totalCrystalsEarned: 0,
    // Cosmetics owned & active
    ownedItems: ["pet_luna","bg_default","sparkle_default"],
    activePet: "pet_luna",
    activeBg: "bg_default",
    activeSparkle: "sparkle_default",
    activeBorder: "border_default",
    // Session tracking for crystal rewards
    sessionHintsUsed: 0,
    firstHardComplete: false,
    perfectByDiff: { easy: false, medium: false, hard: false },
    // Update log
    lastSeenVersion: null,
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// SHOP ITEMS
// ─────────────────────────────────────────────────────────────────────────────
// Shop preview SVGs — unique scenes for each item
const SHOP_PREVIEWS = {
  bg_default: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff0fb"/><stop offset="100%" stop-color="#f0eaff"/></linearGradient></defs>
    <rect width="64" height="48" fill="url(#g1)" rx="8"/>
    <circle cx="12" cy="12" r="5" fill="#FFD700" opacity="0.7"/>
    <ellipse cx="32" cy="36" rx="14" ry="6" fill="#88CC88" opacity="0.6"/>
    <path d="M20 36 Q24 28 28 36" fill="#66AA66" opacity="0.8"/>
    <path d="M32 36 Q36 26 40 36" fill="#55BB55" opacity="0.8"/>
    <path d="M44 36 Q46 30 48 36" fill="#66AA66" opacity="0.7"/>
    <circle cx="18" cy="20" r="3" fill="#FF88CC" opacity="0.7"/>
    <circle cx="44" cy="16" r="2" fill="#FF66AA" opacity="0.6"/>
    <text x="28" y="18" font-size="10" fill="#e0379a" opacity="0.8">✦</text>
    <text x="8" y="30" font-size="7" fill="#AA88FF" opacity="0.7">✧</text>
    <text x="50" y="30" font-size="7" fill="#FFD700" opacity="0.7">✦</text>
  </svg>`,
  bg_starry: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0d0d2e"/><stop offset="100%" stop-color="#1a1a4e"/></linearGradient></defs>
    <rect width="64" height="48" fill="url(#g2)" rx="8"/>
    <circle cx="10" cy="8" r="1.5" fill="white" opacity="0.9"/>
    <circle cx="22" cy="14" r="1" fill="white" opacity="0.7"/>
    <circle cx="38" cy="6" r="1.5" fill="white" opacity="0.9"/>
    <circle cx="52" cy="12" r="1" fill="white" opacity="0.8"/>
    <circle cx="18" cy="22" r="1" fill="white" opacity="0.6"/>
    <circle cx="44" cy="20" r="1.5" fill="white" opacity="0.9"/>
    <circle cx="58" cy="26" r="1" fill="white" opacity="0.7"/>
    <circle cx="6" cy="30" r="1" fill="white" opacity="0.8"/>
    <circle cx="30" cy="18" r="2" fill="#FFD700" opacity="0.9"/>
    <path d="M28 18 L30 14 L32 18 L36 18 L33 21 L34 25 L30 22 L26 25 L27 21 L24 18 Z" fill="#FFD700" opacity="0.4" transform="scale(0.6) translate(20,12)"/>
    <path d="M20 38 Q32 28 44 38" stroke="#4466FF" stroke-width="1.5" fill="none" opacity="0.5"/>
    <text x="26" y="36" font-size="8" fill="#FFD700" opacity="0.8">★</text>
    <text x="10" y="42" font-size="6" fill="white" opacity="0.5">✦</text>
    <text x="48" y="40" font-size="6" fill="#AADDFF" opacity="0.6">✧</text>
  </svg>`,
  bg_cherry: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#fff0f5"/><stop offset="100%" stop-color="#ffe4ee"/></linearGradient></defs>
    <rect width="64" height="48" fill="url(#g3)" rx="8"/>
    <!-- cherry blossom tree -->
    <line x1="32" y1="48" x2="32" y2="28" stroke="#8B5E3C" stroke-width="2.5"/>
    <line x1="32" y1="36" x2="20" y2="26" stroke="#8B5E3C" stroke-width="1.5"/>
    <line x1="32" y1="32" x2="44" y2="24" stroke="#8B5E3C" stroke-width="1.5"/>
    <!-- blossoms on branches -->
    <circle cx="20" cy="24" r="5" fill="#FFB0CC" opacity="0.85"/>
    <circle cx="15" cy="20" r="4" fill="#FF88AA" opacity="0.8"/>
    <circle cx="25" cy="19" r="4.5" fill="#FFCCDD" opacity="0.8"/>
    <circle cx="44" cy="22" r="5" fill="#FFB0CC" opacity="0.85"/>
    <circle cx="50" cy="18" r="4" fill="#FF88AA" opacity="0.8"/>
    <circle cx="40" cy="17" r="4.5" fill="#FFCCDD" opacity="0.8"/>
    <circle cx="32" cy="18" r="5" fill="#FFB0CC" opacity="0.8"/>
    <!-- falling petals -->
    <ellipse cx="8" cy="16" rx="2.5" ry="1.5" fill="#FFB0CC" opacity="0.7" transform="rotate(30,8,16)"/>
    <ellipse cx="54" cy="24" rx="2" ry="1.2" fill="#FF88AA" opacity="0.6" transform="rotate(-20,54,24)"/>
    <ellipse cx="14" cy="36" rx="2.5" ry="1.5" fill="#FFCCDD" opacity="0.7" transform="rotate(15,14,36)"/>
    <ellipse cx="48" cy="38" rx="2" ry="1.2" fill="#FFB0CC" opacity="0.6" transform="rotate(-30,48,38)"/>
    <ellipse cx="38" cy="42" rx="2" ry="1.2" fill="#FF88AA" opacity="0.5" transform="rotate(10,38,42)"/>
  </svg>`,
  bg_forest: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0d2e1a"/><stop offset="100%" stop-color="#1a4e2e"/></linearGradient></defs>
    <rect width="64" height="48" fill="url(#g4)" rx="8"/>
    <!-- trees -->
    <polygon points="10,42 18,18 26,42" fill="#1a6630"/>
    <polygon points="8,42 18,12 28,42" fill="#228844"/>
    <polygon points="36,42 44,20 52,42" fill="#1a6630"/>
    <polygon points="34,42 44,14 54,42" fill="#228844"/>
    <polygon points="20,42 28,24 36,42" fill="#2a7740" opacity="0.8"/>
    <!-- ground -->
    <ellipse cx="32" cy="44" rx="32" ry="6" fill="#0d2e1a"/>
    <!-- fireflies -->
    <circle cx="14" cy="28" r="1.5" fill="#AAFF44" opacity="0.9"/>
    <circle cx="14" cy="28" r="3" fill="#AAFF44" opacity="0.2"/>
    <circle cx="50" cy="24" r="1.5" fill="#AAFF44" opacity="0.8"/>
    <circle cx="50" cy="24" r="3" fill="#AAFF44" opacity="0.2"/>
    <circle cx="30" cy="32" r="1.5" fill="#FFFF88" opacity="0.7"/>
    <circle cx="30" cy="32" r="3" fill="#FFFF88" opacity="0.15"/>
    <!-- moon peek -->
    <circle cx="52" cy="8" r="5" fill="#FFFACC" opacity="0.6"/>
    <text x="6" y="16" font-size="6" fill="#AAFF44" opacity="0.5">✦</text>
    <text x="42" y="36" font-size="6" fill="#88FF44" opacity="0.4">✧</text>
  </svg>`,
  bg_ocean: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g5" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0d1e3e"/><stop offset="100%" stop-color="#0a3050"/></linearGradient></defs>
    <rect width="64" height="48" fill="url(#g5)" rx="8"/>
    <!-- light rays from surface -->
    <path d="M20 0 L16 48" stroke="#4488FF" stroke-width="1" opacity="0.15"/>
    <path d="M32 0 L30 48" stroke="#44AAFF" stroke-width="1.5" opacity="0.2"/>
    <path d="M46 0 L50 48" stroke="#4488FF" stroke-width="1" opacity="0.15"/>
    <!-- bubbles -->
    <circle cx="10" cy="36" r="2" fill="none" stroke="#88DDFF" stroke-width="0.8" opacity="0.7"/>
    <circle cx="18" cy="20" r="1.5" fill="none" stroke="#88DDFF" stroke-width="0.8" opacity="0.6"/>
    <circle cx="44" cy="28" r="2.5" fill="none" stroke="#AAEEFF" stroke-width="0.8" opacity="0.7"/>
    <circle cx="56" cy="16" r="1.5" fill="none" stroke="#88DDFF" stroke-width="0.8" opacity="0.6"/>
    <!-- seaweed -->
    <path d="M8 48 Q6 40 10 34 Q8 28 12 22" stroke="#22AA66" stroke-width="2" fill="none" opacity="0.7"/>
    <path d="M56 48 Q58 40 54 34 Q56 28 52 22" stroke="#22AA66" stroke-width="2" fill="none" opacity="0.7"/>
    <!-- fish -->
    <ellipse cx="28" cy="24" rx="5" ry="3" fill="#FF8844" opacity="0.8"/>
    <polygon points="33,24 37,20 37,28" fill="#FF8844" opacity="0.8"/>
    <circle cx="26" cy="23" r="1" fill="white"/>
    <circle cx="26" cy="23" r="0.5" fill="#222"/>
    <ellipse cx="44" cy="36" rx="4" ry="2.5" fill="#FF88CC" opacity="0.7"/>
    <polygon points="48,36 51,33 51,39" fill="#FF88CC" opacity="0.7"/>
    <!-- sparkle underwater -->
    <text x="14" y="42" font-size="7" fill="#88DDFF" opacity="0.6">✦</text>
    <text x="48" y="44" font-size="6" fill="#AAEEFF" opacity="0.5">✧</text>
  </svg>`,
  bg_galaxy: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#0d0d1a"/><stop offset="100%" stop-color="#1a0d2e"/></linearGradient></defs>
    <rect width="64" height="48" fill="url(#g6)" rx="8"/>
    <!-- galaxy spiral -->
    <ellipse cx="32" cy="24" rx="24" ry="14" fill="none" stroke="#AA44FF" stroke-width="0.8" opacity="0.3" transform="rotate(-20,32,24)"/>
    <ellipse cx="32" cy="24" rx="16" ry="9" fill="none" stroke="#CC66FF" stroke-width="0.8" opacity="0.4" transform="rotate(-20,32,24)"/>
    <ellipse cx="32" cy="24" rx="8" ry="5" fill="#AA44FF" opacity="0.15" transform="rotate(-20,32,24)"/>
    <circle cx="32" cy="24" r="3" fill="#FFD700" opacity="0.8"/>
    <circle cx="32" cy="24" r="6" fill="#FFD700" opacity="0.1"/>
    <!-- stars scattered -->
    <circle cx="6" cy="6" r="1.2" fill="white" opacity="0.8"/>
    <circle cx="58" cy="8" r="1" fill="white" opacity="0.7"/>
    <circle cx="12" cy="40" r="1" fill="#DDAAFF" opacity="0.8"/>
    <circle cx="52" cy="42" r="1.2" fill="#AADDFF" opacity="0.7"/>
    <circle cx="8" cy="22" r="1.5" fill="#FF88CC" opacity="0.6"/>
    <circle cx="56" cy="30" r="1" fill="#FFD700" opacity="0.8"/>
    <circle cx="20" cy="10" r="1" fill="#AADDFF" opacity="0.6"/>
    <circle cx="46" cy="6" r="1.5" fill="#AA44FF" opacity="0.8"/>
    <text x="18" y="30" font-size="7" fill="#AA44FF" opacity="0.7">✦</text>
    <text x="42" y="36" font-size="6" fill="#FF88CC" opacity="0.6">✧</text>
    <text x="4" y="44" font-size="6" fill="#AADDFF" opacity="0.5">✦</text>
  </svg>`,
  sparkle_default: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#1a0033" rx="8"/>
    <text x="8" y="18" font-size="14" fill="#FFD700">✦</text>
    <text x="28" y="30" font-size="18" fill="#AA88FF">✧</text>
    <text x="46" y="16" font-size="12" fill="#FF88CC">⋆</text>
    <text x="4" y="40" font-size="10" fill="#88DDFF">✽</text>
    <text x="48" y="42" font-size="10" fill="#FFD700">⊹</text>
    <text x="20" y="46" font-size="8" fill="#AA88FF">✺</text>
    <text x="38" y="44" font-size="8" fill="#FF88CC">✦</text>
  </svg>`,
  sparkle_rainbow: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#0d0022" rx="8"/>
    <path d="M8 38 Q32 8 56 38" fill="none" stroke="#FF4444" stroke-width="2" opacity="0.7"/>
    <path d="M10 40 Q32 12 54 40" fill="none" stroke="#FF8800" stroke-width="2" opacity="0.7"/>
    <path d="M12 42 Q32 16 52 42" fill="none" stroke="#FFDD00" stroke-width="2" opacity="0.7"/>
    <path d="M14 44 Q32 20 50 44" fill="none" stroke="#44CC44" stroke-width="2" opacity="0.7"/>
    <path d="M16 46 Q32 24 48 46" fill="none" stroke="#4488FF" stroke-width="2" opacity="0.7"/>
    <path d="M18 47 Q32 27 46 47" fill="none" stroke="#AA44FF" stroke-width="2" opacity="0.7"/>
    <text x="6" y="14" font-size="10" fill="#FF4444">◆</text>
    <text x="52" y="14" font-size="8" fill="#4488FF">◆</text>
    <text x="28" y="10" font-size="10" fill="#FFDD00">★</text>
  </svg>`,
  sparkle_hearts: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#1a0011" rx="8"/>
    <text x="6" y="20" font-size="16" fill="#FF4466">♥</text>
    <text x="26" y="14" font-size="12" fill="#FF88AA">♡</text>
    <text x="44" y="22" font-size="14" fill="#FF4466">♥</text>
    <text x="14" y="38" font-size="10" fill="#FF88AA">♡</text>
    <text x="38" y="40" font-size="12" fill="#FFAABB">♥</text>
    <text x="54" y="36" font-size="8" fill="#FF6688">♡</text>
    <text x="2" y="44" font-size="8" fill="#FF4466">♥</text>
    <text x="28" y="44" font-size="10" fill="#FF88AA">♡</text>
  </svg>`,
  sparkle_shoots: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#0d0d1a" rx="8"/>
    <!-- shooting stars -->
    <line x1="4" y1="8" x2="24" y2="18" stroke="white" stroke-width="1.5" opacity="0.9"/>
    <circle cx="4" cy="8" r="2" fill="#FFD700"/>
    <line x1="20" y1="4" x2="44" y2="16" stroke="white" stroke-width="1.5" opacity="0.8"/>
    <circle cx="20" cy="4" r="2" fill="#FFFAAA"/>
    <line x1="36" y1="10" x2="58" y2="22" stroke="white" stroke-width="1.5" opacity="0.9"/>
    <circle cx="36" cy="10" r="2" fill="#FFD700"/>
    <line x1="8" y1="24" x2="30" y2="34" stroke="white" stroke-width="1" opacity="0.7"/>
    <circle cx="8" cy="24" r="1.5" fill="#FFFFFF"/>
    <line x1="28" y1="30" x2="52" y2="40" stroke="white" stroke-width="1.5" opacity="0.8"/>
    <circle cx="28" cy="30" r="2" fill="#FFD700"/>
    <!-- static stars -->
    <circle cx="56" cy="6" r="1" fill="white" opacity="0.7"/>
    <circle cx="12" cy="44" r="1" fill="white" opacity="0.6"/>
    <circle cx="50" cy="44" r="1" fill="#FFD700" opacity="0.8"/>
  </svg>`,
  sparkle_blossom: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#1a000d" rx="8"/>
    <!-- floating blossom petals scattered -->
    <ellipse cx="10" cy="12" rx="4" ry="2.5" fill="#FFB0CC" opacity="0.85" transform="rotate(30,10,12)"/>
    <ellipse cx="28" cy="8" rx="3.5" ry="2" fill="#FF88AA" opacity="0.8" transform="rotate(-15,28,8)"/>
    <ellipse cx="48" cy="14" rx="4" ry="2.5" fill="#FFCCDD" opacity="0.85" transform="rotate(45,48,14)"/>
    <ellipse cx="6" cy="30" rx="3" ry="2" fill="#FFB0CC" opacity="0.7" transform="rotate(-30,6,30)"/>
    <ellipse cx="22" cy="26" rx="4" ry="2.5" fill="#FF88AA" opacity="0.8" transform="rotate(20,22,26)"/>
    <ellipse cx="42" cy="24" rx="3.5" ry="2" fill="#FFCCDD" opacity="0.75" transform="rotate(-40,42,24)"/>
    <ellipse cx="58" cy="32" rx="4" ry="2.5" fill="#FFB0CC" opacity="0.8" transform="rotate(10,58,32)"/>
    <ellipse cx="14" cy="42" rx="3" ry="2" fill="#FF88AA" opacity="0.7" transform="rotate(25,14,42)"/>
    <ellipse cx="36" cy="40" rx="4" ry="2.5" fill="#FFB0CC" opacity="0.8" transform="rotate(-20,36,40)"/>
    <ellipse cx="54" cy="44" rx="3" ry="2" fill="#FFCCDD" opacity="0.7" transform="rotate(35,54,44)"/>
    <!-- 5-petal blossom -->
    <circle cx="32" cy="28" r="2" fill="#FFDDEE"/>
    <ellipse cx="32" cy="22" rx="2" ry="3.5" fill="#FF88AA" opacity="0.9"/>
    <ellipse cx="32" cy="34" rx="2" ry="3.5" fill="#FF88AA" opacity="0.9"/>
    <ellipse cx="26" cy="28" rx="3.5" ry="2" fill="#FFB0CC" opacity="0.9"/>
    <ellipse cx="38" cy="28" rx="3.5" ry="2" fill="#FFB0CC" opacity="0.9"/>
  </svg>`,
  sparkle_galaxy: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#080014" rx="8"/>
    <text x="4" y="16" font-size="12" fill="#AA44FF" opacity="0.9">✦</text>
    <text x="22" y="10" font-size="8" fill="#4488FF" opacity="0.8">·</text>
    <text x="34" y="20" font-size="14" fill="#FF44BB" opacity="0.8">⋆</text>
    <text x="50" y="14" font-size="10" fill="#44FFCC" opacity="0.7">✧</text>
    <text x="8" y="34" font-size="8" fill="#FFAA44" opacity="0.8">∗</text>
    <text x="24" y="40" font-size="12" fill="#AA44FF" opacity="0.7">⊹</text>
    <text x="44" y="36" font-size="10" fill="#4488FF" opacity="0.8">✦</text>
    <text x="56" y="44" font-size="8" fill="#FF44BB" opacity="0.7">·</text>
    <text x="14" y="46" font-size="8" fill="#44FFCC" opacity="0.6">✧</text>
    <!-- nebula glow -->
    <circle cx="32" cy="24" r="16" fill="#AA44FF" opacity="0.05"/>
    <circle cx="20" cy="16" r="8" fill="#4488FF" opacity="0.06"/>
    <circle cx="46" cy="32" r="10" fill="#FF44BB" opacity="0.05"/>
  </svg>`,
  border_default: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#1a0033" rx="8"/>
    <rect x="4" y="4" width="56" height="40" fill="none" stroke="#664488" stroke-width="1.5" rx="5"/>
    <rect x="8" y="8" width="48" height="32" fill="none" stroke="#442266" stroke-width="0.8" rx="3"/>
    <text x="22" y="30" font-size="14" fill="#553366" opacity="0.5">✦</text>
  </svg>`,
  border_floral: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#0d1a0d" rx="8"/>
    <!-- vine border -->
    <path d="M4 4 Q32 2 60 4 Q62 24 60 44 Q32 46 4 44 Q2 24 4 4" fill="none" stroke="#44AA44" stroke-width="1.5"/>
    <!-- flowers at corners -->
    <circle cx="6" cy="6" r="3" fill="#FF88AA"/>
    <circle cx="6" cy="6" r="1.5" fill="#FFD700"/>
    <circle cx="58" cy="6" r="3" fill="#FF88AA"/>
    <circle cx="58" cy="6" r="1.5" fill="#FFD700"/>
    <circle cx="6" cy="42" r="3" fill="#FF88AA"/>
    <circle cx="6" cy="42" r="1.5" fill="#FFD700"/>
    <circle cx="58" cy="42" r="3" fill="#FF88AA"/>
    <circle cx="58" cy="42" r="1.5" fill="#FFD700"/>
    <!-- leaves along vine -->
    <ellipse cx="20" cy="3" rx="3" ry="1.5" fill="#66BB66" transform="rotate(-10,20,3)"/>
    <ellipse cx="44" cy="3" rx="3" ry="1.5" fill="#66BB66" transform="rotate(10,44,3)"/>
    <ellipse cx="61" cy="16" rx="1.5" ry="3" fill="#66BB66" transform="rotate(10,61,16)"/>
    <ellipse cx="61" cy="32" rx="1.5" ry="3" fill="#66BB66" transform="rotate(-10,61,32)"/>
    <ellipse cx="20" cy="45" rx="3" ry="1.5" fill="#66BB66" transform="rotate(10,20,45)"/>
    <ellipse cx="44" cy="45" rx="3" ry="1.5" fill="#66BB66" transform="rotate(-10,44,45)"/>
    <ellipse cx="3" cy="16" rx="1.5" ry="3" fill="#66BB66"/>
    <ellipse cx="3" cy="32" rx="1.5" ry="3" fill="#66BB66"/>
    <text x="24" y="30" font-size="12" fill="#44AA44" opacity="0.3">✿</text>
  </svg>`,
  border_starburst: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#0d0d22" rx="8"/>
    <!-- corner stars -->
    <text x="2" y="12" font-size="12" fill="#FFD700">★</text>
    <text x="50" y="12" font-size="12" fill="#FFD700">★</text>
    <text x="2" y="46" font-size="12" fill="#FFD700">★</text>
    <text x="50" y="46" font-size="12" fill="#FFD700">★</text>
    <!-- rays from corners -->
    <line x1="8" y1="8" x2="20" y2="20" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
    <line x1="56" y1="8" x2="44" y2="20" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
    <line x1="8" y1="40" x2="20" y2="28" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
    <line x1="56" y1="40" x2="44" y2="28" stroke="#FFD700" stroke-width="1" opacity="0.5"/>
    <!-- mid-edge stars -->
    <text x="27" y="8" font-size="8" fill="#FFAA44">✦</text>
    <text x="27" y="47" font-size="8" fill="#FFAA44">✦</text>
    <text x="2" y="28" font-size="8" fill="#FFAA44">✦</text>
    <text x="56" y="28" font-size="8" fill="#FFAA44">✦</text>
    <rect x="16" y="14" width="32" height="20" fill="none" stroke="#FFD700" stroke-width="0.5" opacity="0.3" rx="2"/>
  </svg>`,
  border_moon: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#080014" rx="8"/>
    <!-- corner crescent moons -->
    <circle cx="8" cy="8" r="5" fill="none" stroke="#FFFACC" stroke-width="1.2" opacity="0.8"/>
    <circle cx="10" cy="7" r="4" fill="#080014"/>
    <circle cx="56" cy="8" r="5" fill="none" stroke="#FFFACC" stroke-width="1.2" opacity="0.8"/>
    <circle cx="54" cy="7" r="4" fill="#080014"/>
    <circle cx="8" cy="40" r="5" fill="none" stroke="#FFFACC" stroke-width="1.2" opacity="0.8"/>
    <circle cx="10" cy="41" r="4" fill="#080014"/>
    <circle cx="56" cy="40" r="5" fill="none" stroke="#FFFACC" stroke-width="1.2" opacity="0.8"/>
    <circle cx="54" cy="41" r="4" fill="#080014"/>
    <!-- small stars along edges -->
    <text x="26" y="7" font-size="7" fill="#FFFACC" opacity="0.7">✦</text>
    <text x="26" y="47" font-size="7" fill="#FFFACC" opacity="0.7">✦</text>
    <text x="2" y="27" font-size="7" fill="#FFFACC" opacity="0.6">✧</text>
    <text x="57" y="27" font-size="7" fill="#FFFACC" opacity="0.6">✧</text>
    <!-- center star -->
    <text x="28" y="30" font-size="10" fill="#FFFACC" opacity="0.2">★</text>
  </svg>`,
  border_crystal: `<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="48" fill="#0a0a1e" rx="8"/>
    <!-- diamond gems at corners -->
    <polygon points="8,4 12,8 8,12 4,8" fill="#88DDFF" opacity="0.9"/>
    <polygon points="56,4 60,8 56,12 52,8" fill="#AA88FF" opacity="0.9"/>
    <polygon points="8,36 12,40 8,44 4,40" fill="#FF88DD" opacity="0.9"/>
    <polygon points="56,36 60,40 56,44 52,40" fill="#88DDFF" opacity="0.9"/>
    <!-- gem shine -->
    <line x1="6" y1="6" x2="10" y2="10" stroke="white" stroke-width="0.8" opacity="0.7"/>
    <line x1="54" y1="6" x2="58" y2="10" stroke="white" stroke-width="0.8" opacity="0.7"/>
    <!-- mid-edge gems smaller -->
    <polygon points="32,2 34,5 32,8 30,5" fill="#FFDD88" opacity="0.8"/>
    <polygon points="32,40 34,43 32,46 30,43" fill="#FFDD88" opacity="0.8"/>
    <polygon points="2,22 5,24 2,26 -1,24" fill="#88FFDD" opacity="0.7"/>
    <polygon points="62,22 65,24 62,26 59,24" fill="#88FFDD" opacity="0.7"/>
    <!-- crystal border lines -->
    <path d="M12 4 L30 2 L52 4" fill="none" stroke="#88DDFF" stroke-width="0.8" opacity="0.5"/>
    <path d="M12 44 L30 46 L52 44" fill="none" stroke="#88DDFF" stroke-width="0.8" opacity="0.5"/>
    <path d="M4 12 L2 24 L4 36" fill="none" stroke="#AA88FF" stroke-width="0.8" opacity="0.5"/>
    <path d="M60 12 L62 24 L60 36" fill="none" stroke="#AA88FF" stroke-width="0.8" opacity="0.5"/>
    <text x="24" y="30" font-size="10" fill="#88DDFF" opacity="0.15">💎</text>
  </svg>`,
};

const SHOP_ITEMS = {
  pets: [
    { id:"pet_luna",    name:"Luna",          emoji:"🖤", cost:0,   desc:"Your faithful black cat companion!" },
    { id:"pet_artemis", name:"Artemis",        emoji:"🤍", cost:150, desc:"Luna's wise white cat partner!" },
    { id:"pet_diana",   name:"Diana",          emoji:"💜", cost:400, desc:"Their precious grey kitten daughter!" },
    { id:"pet_dragon",  name:"Baby Dragon",    emoji:"🐉", cost:200, desc:"A tiny dragon who breathes sparkles!" },
    { id:"pet_fairy",   name:"Tiny Fairy",     emoji:"✨", cost:250, desc:"A magical fairy that matches your character!" },
    { id:"pet_fox",     name:"Celestial Fox",  emoji:"🦊", cost:300, desc:"A fox surrounded by cosmic energy!" },
    { id:"pet_rabbit",  name:"Moon Rabbit",    emoji:"🐰", cost:50,  desc:"A gentle bunny from the moon!" },
    { id:"pet_phoenix", name:"Baby Phoenix",   emoji:"🔥", cost:500, desc:"The rarest companion — a phoenix of pure magic!" },
  ],
  backgrounds: [
    { id:"bg_default",    name:"Magical Garden",    cost:0,  desc:"Soft pastels and floating magic" },
    { id:"bg_starry",     name:"Starry Night",       cost:20, desc:"A dreamy night sky full of stars" },
    { id:"bg_cherry",     name:"Cherry Blossom",     cost:20, desc:"Soft pink petals falling gently" },
    { id:"bg_forest",     name:"Enchanted Forest",   cost:25, desc:"A mysterious magical forest" },
    { id:"bg_ocean",      name:"Underwater Kingdom", cost:25, desc:"Deep beneath the sparkling sea" },
    { id:"bg_galaxy",     name:"Galaxy",             cost:30, desc:"Drift through the cosmos itself" },
  ],
  sparkles: [
    { id:"sparkle_default", name:"Magic Stars",    cost:0,  desc:"Classic magical sparkles" },
    { id:"sparkle_rainbow", name:"Rainbow",        cost:15, desc:"All the colors of the rainbow!" },
    { id:"sparkle_hearts",  name:"Hearts",         cost:15, desc:"Floating hearts everywhere!" },
    { id:"sparkle_shoots",  name:"Shooting Stars", cost:20, desc:"Stars streaking across the screen" },
    { id:"sparkle_blossom", name:"Blossoms",       cost:20, desc:"Soft petals drifting by" },
    { id:"sparkle_galaxy",  name:"Galaxy Dust",    cost:25, desc:"Cosmic dust from distant stars" },
  ],
  borders: [
    { id:"border_default",  name:"Simple",         cost:0,  desc:"Clean and simple" },
    { id:"border_floral",   name:"Floral Vine",    cost:20, desc:"Delicate vines and flowers" },
    { id:"border_starburst",name:"Star Burst",     cost:20, desc:"Radiating star energy" },
    { id:"border_moon",     name:"Moon & Stars",   cost:25, desc:"Crescent moons and twinkling stars" },
    { id:"border_crystal",  name:"Crystal Gems",   cost:30, desc:"Sparkling crystal gems" },
  ],
};

// Background themes
const BG_THEMES = {
  bg_default: "linear-gradient(135deg,#fff0fb,#f0eaff)",
  bg_starry:  "linear-gradient(135deg,#0d0d2e,#1a1a4e)",
  bg_cherry:  "linear-gradient(135deg,#fff0f5,#ffe4ee)",
  bg_forest:  "linear-gradient(135deg,#0d2e1a,#1a4e2e)",
  bg_ocean:   "linear-gradient(135deg,#0d1e3e,#1a3a5e)",
  bg_galaxy:  "linear-gradient(135deg,#0d0d1a,#1a0d2e)",
};

// Sparkle configs
const SPARKLE_CONFIGS = {
  sparkle_default: { chars:["✦","✧","⋆","✺","❋","✼","✻","✽","⊹"], colors:["#FFD700","#FF88CC","#AA88FF","#88DDFF"] },
  sparkle_rainbow: { chars:["✦","✧","⋆","◆","●","★"], colors:["#FF4444","#FF8800","#FFDD00","#44CC44","#4488FF","#AA44FF"] },
  sparkle_hearts:  { chars:["♥","♡","❤","💕","❣"], colors:["#FF4466","#FF88AA","#FFAABB","#FF6688"] },
  sparkle_shoots:  { chars:["✦","★","⭐","💫","✨"], colors:["#FFD700","#FFFAAA","#FFEECC","#FFFFFF"] },
  sparkle_blossom: { chars:["🌸","✿","❀","✽","❋"], colors:["#FFB0CC","#FFAABB","#FF88AA","#FFD0E0"] },
  sparkle_galaxy:  { chars:["✦","✧","⋆","·","∗","⊹"], colors:["#AA44FF","#4488FF","#FF44BB","#44FFCC","#FFAA44"] },
};

// Pet SVG art
function getPetArt(petId, state="idle", accentColor="#e0379a") {
  const col = accentColor;
  const arts = {
    pet_luna: {
      idle:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <!-- body -->
  <ellipse cx="30" cy="52" rx="17" ry="13" fill="#1a1a1a"/>
  <!-- front paws -->
  <ellipse cx="20" cy="62" rx="7" ry="4" fill="#222222"/>
  <ellipse cx="40" cy="62" rx="7" ry="4" fill="#222222"/>
  <ellipse cx="18" cy="63" rx="2.5" ry="1.5" fill="#333"/>
  <ellipse cx="22" cy="64" rx="2.5" ry="1.5" fill="#333"/>
  <ellipse cx="38" cy="63" rx="2.5" ry="1.5" fill="#333"/>
  <ellipse cx="42" cy="64" rx="2.5" ry="1.5" fill="#333"/>
  <!-- tail -->
  <path d="M47 52 Q58 44 55 36 Q52 32 48 36 Q50 42 44 48" fill="#222222"/>
  <!-- head -->
  <ellipse cx="30" cy="30" rx="16" ry="15" fill="#1a1a1a"/>
  <!-- ears - sharp triangles -->
  <polygon points="16,20 12,6 22,14" fill="#1a1a1a"/>
  <polygon points="44,20 48,6 38,14" fill="#1a1a1a"/>
  <!-- inner ear -->
  <polygon points="16,19 13,9 21,15" fill="#FF88AA"/>
  <polygon points="44,19 47,9 39,15" fill="#FF88AA"/>
  <!-- face - muzzle -->
  <ellipse cx="30" cy="34" rx="8" ry="6" fill="#2a2a2a"/>
  <!-- eyes - golden, large -->
  <ellipse cx="23" cy="28" rx="5" ry="6" fill="#FFD700"/>
  <ellipse cx="37" cy="28" rx="5" ry="6" fill="#FFD700"/>
  <ellipse cx="23" cy="28" rx="3" ry="4" fill="#111100"/>
  <ellipse cx="37" cy="28" rx="3" ry="4" fill="#111100"/>
  <circle cx="22" cy="26" r="1.5" fill="white"/>
  <circle cx="36" cy="26" r="1.5" fill="white"/>
  <!-- nose -->
  <ellipse cx="30" cy="33" rx="2.2" ry="1.5" fill="#FF6688"/>
  <!-- mouth -->
  <path d="M28 35 Q30 37 32 35" stroke="#FF6688" stroke-width="1" fill="none"/>
  <!-- whiskers -->
  <line x1="14" y1="32" x2="27" y2="33" stroke="#888" stroke-width="0.8"/>
  <line x1="14" y1="34" x2="27" y2="34" stroke="#888" stroke-width="0.8"/>
  <line x1="33" y1="33" x2="46" y2="32" stroke="#888" stroke-width="0.8"/>
  <line x1="33" y1="34" x2="46" y2="34" stroke="#888" stroke-width="0.8"/>
  <!-- forehead crescent moon symbol -->
  <path d="M27 18 Q30 14 33 18 Q30 16 27 18" fill="#FFD700"/>
  <circle cx="30" cy="17" r="3.5" fill="none" stroke="#FFD700" stroke-width="1.2"/>
  <circle cx="31.5" cy="16" r="2.8" fill="#1a1a1a"/>
</svg>`,
      happy:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <!-- body lifted -->
  <ellipse cx="30" cy="50" rx="17" ry="13" fill="#1a1a1a"/>
  <!-- paws raised slightly -->
  <ellipse cx="19" cy="60" rx="7" ry="4" fill="#222222" transform="rotate(-8,19,60)"/>
  <ellipse cx="41" cy="60" rx="7" ry="4" fill="#222222" transform="rotate(8,41,60)"/>
  <ellipse cx="17" cy="61" rx="2.5" ry="1.5" fill="#333"/>
  <ellipse cx="21" cy="62" rx="2.5" ry="1.5" fill="#333"/>
  <ellipse cx="39" cy="61" rx="2.5" ry="1.5" fill="#333"/>
  <ellipse cx="43" cy="62" rx="2.5" ry="1.5" fill="#333"/>
  <!-- tail up -->
  <path d="M47 48 Q60 38 56 26 Q52 22 49 28 Q52 36 44 44" fill="#222222"/>
  <text x="52" y="24" font-size="7" fill="#FFD700">✦</text>
  <!-- head -->
  <ellipse cx="30" cy="28" rx="16" ry="15" fill="#1a1a1a"/>
  <polygon points="16,18 12,4 22,12" fill="#1a1a1a"/>
  <polygon points="44,18 48,4 38,12" fill="#1a1a1a"/>
  <polygon points="16,17 13,7 21,13" fill="#FF88AA"/>
  <polygon points="44,17 47,7 39,13" fill="#FF88AA"/>
  <ellipse cx="30" cy="32" rx="8" ry="6" fill="#2a2a2a"/>
  <!-- happy eyes - wide and bright -->
  <ellipse cx="23" cy="26" rx="5.5" ry="6.5" fill="#FFD700"/>
  <ellipse cx="37" cy="26" rx="5.5" ry="6.5" fill="#FFD700"/>
  <ellipse cx="23" cy="26" rx="3" ry="4" fill="#111100"/>
  <ellipse cx="37" cy="26" rx="3" ry="4" fill="#111100"/>
  <circle cx="22" cy="24" r="1.8" fill="white"/>
  <circle cx="36" cy="24" r="1.8" fill="white"/>
  <!-- big happy mouth -->
  <path d="M26 34 Q30 38 34 34" stroke="#FF6688" stroke-width="1.5" fill="none"/>
  <ellipse cx="30" cy="32" rx="2.2" ry="1.5" fill="#FF6688"/>
  <!-- whiskers spread -->
  <line x1="12" y1="31" x2="27" y2="32" stroke="#888" stroke-width="0.8"/>
  <line x1="12" y1="33" x2="27" y2="33" stroke="#888" stroke-width="0.8"/>
  <line x1="33" y1="32" x2="48" y2="31" stroke="#888" stroke-width="0.8"/>
  <line x1="33" y1="33" x2="48" y2="33" stroke="#888" stroke-width="0.8"/>
  <path d="M27 16 Q30 12 33 16 Q30 14 27 16" fill="#FFD700"/>
  <circle cx="30" cy="15" r="3.5" fill="none" stroke="#FFD700" stroke-width="1.2"/>
  <circle cx="31.5" cy="14" r="2.8" fill="#1a1a1a"/>
  <!-- sparkles -->
  <text x="4" y="16" font-size="9" fill="#FFD700">✦</text>
  <text x="46" y="14" font-size="8" fill="#FF88CC">✦</text>
</svg>`,
      sad:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <!-- body hunched -->
  <ellipse cx="30" cy="54" rx="16" ry="12" fill="#1a1a1a"/>
  <!-- paws tucked -->
  <ellipse cx="22" cy="63" rx="6" ry="3.5" fill="#222222"/>
  <ellipse cx="38" cy="63" rx="6" ry="3.5" fill="#222222"/>
  <ellipse cx="20" cy="64" rx="2" ry="1.2" fill="#333"/>
  <ellipse cx="24" cy="65" rx="2" ry="1.2" fill="#333"/>
  <ellipse cx="36" cy="64" rx="2" ry="1.2" fill="#333"/>
  <ellipse cx="40" cy="65" rx="2" ry="1.2" fill="#333"/>
  <!-- tail drooped -->
  <path d="M46 54 Q54 52 52 60 Q48 64 44 58 Q46 54 42 52" fill="#222222"/>
  <!-- head slightly down -->
  <ellipse cx="30" cy="32" rx="16" ry="15" fill="#1a1a1a"/>
  <polygon points="16,22 13,8 22,16" fill="#1a1a1a" transform="rotate(5,16,22)"/>
  <polygon points="44,22 47,8 38,16" fill="#1a1a1a" transform="rotate(-5,44,22)"/>
  <polygon points="16,21 14,11 21,17" fill="#FF88AA" transform="rotate(5,16,21)"/>
  <polygon points="44,21 46,11 39,17" fill="#FF88AA" transform="rotate(-5,44,21)"/>
  <ellipse cx="30" cy="36" rx="8" ry="6" fill="#2a2a2a"/>
  <!-- sad eyes - half closed -->
  <ellipse cx="23" cy="30" rx="5" ry="5.5" fill="#FFD700"/>
  <ellipse cx="37" cy="30" rx="5" ry="5.5" fill="#FFD700"/>
  <ellipse cx="23" cy="31" rx="3" ry="3.5" fill="#111100"/>
  <ellipse cx="37" cy="31" rx="3" ry="3.5" fill="#111100"/>
  <circle cx="22" cy="29" r="1.2" fill="white"/>
  <circle cx="36" cy="29" r="1.2" fill="white"/>
  <!-- droopy inner brow -->
  <path d="M19 26 Q23 23 27 26" fill="#1a1a1a"/>
  <path d="M33 26 Q37 23 41 26" fill="#1a1a1a"/>
  <ellipse cx="30" cy="35" rx="2.2" ry="1.5" fill="#FF6688"/>
  <path d="M27 37 Q30 35 33 37" stroke="#FF6688" stroke-width="1" fill="none"/>
  <line x1="14" y1="34" x2="27" y2="34" stroke="#666" stroke-width="0.8"/>
  <line x1="33" y1="34" x2="46" y2="34" stroke="#666" stroke-width="0.8"/>
  <path d="M27 20 Q30 16 33 20 Q30 18 27 20" fill="#FFD700" opacity="0.6"/>
  <circle cx="30" cy="19" r="3.5" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.6"/>
  <circle cx="31.5" cy="18" r="2.8" fill="#1a1a1a"/>
</svg>`,
    },
    pet_artemis: {
      idle:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <!-- body - cream white -->
  <ellipse cx="30" cy="52" rx="17" ry="13" fill="#F5F0E8"/>
  <!-- front paws -->
  <ellipse cx="20" cy="62" rx="7" ry="4" fill="#EDE8DC"/>
  <ellipse cx="40" cy="62" rx="7" ry="4" fill="#EDE8DC"/>
  <ellipse cx="18" cy="63" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <ellipse cx="22" cy="64" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <ellipse cx="38" cy="63" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <ellipse cx="42" cy="64" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <!-- tail - fluffy white with tip -->
  <path d="M47 52 Q58 44 55 36 Q52 32 48 36 Q50 42 44 48" fill="#F0EBE0"/>
  <!-- head -->
  <ellipse cx="30" cy="30" rx="16" ry="15" fill="#F5F0E8"/>
  <!-- ears -->
  <polygon points="16,20 12,6 22,14" fill="#F5F0E8"/>
  <polygon points="44,20 48,6 38,14" fill="#F5F0E8"/>
  <polygon points="16,19 13,9 21,15" fill="#FFBBCC"/>
  <polygon points="44,19 47,9 39,15" fill="#FFBBCC"/>
  <!-- face muzzle -->
  <ellipse cx="30" cy="34" rx="8" ry="6" fill="#EEE8DC"/>
  <!-- eyes - vivid blue, Artemis trademark -->
  <ellipse cx="23" cy="28" rx="5" ry="6" fill="#2266FF"/>
  <ellipse cx="37" cy="28" rx="5" ry="6" fill="#2266FF"/>
  <ellipse cx="23" cy="28" rx="3" ry="4" fill="#001166"/>
  <ellipse cx="37" cy="28" rx="3" ry="4" fill="#001166"/>
  <circle cx="22" cy="26" r="1.5" fill="white"/>
  <circle cx="36" cy="26" r="1.5" fill="white"/>
  <!-- blue eye glow ring -->
  <ellipse cx="23" cy="28" rx="5.5" ry="6.5" fill="none" stroke="#88AAFF" stroke-width="0.8" opacity="0.6"/>
  <ellipse cx="37" cy="28" rx="5.5" ry="6.5" fill="none" stroke="#88AAFF" stroke-width="0.8" opacity="0.6"/>
  <ellipse cx="30" cy="33" rx="2.2" ry="1.5" fill="#FF9999"/>
  <path d="M28 35 Q30 37 32 35" stroke="#FF9999" stroke-width="1" fill="none"/>
  <line x1="14" y1="32" x2="27" y2="33" stroke="#CCBBAA" stroke-width="0.8"/>
  <line x1="14" y1="34" x2="27" y2="34" stroke="#CCBBAA" stroke-width="0.8"/>
  <line x1="33" y1="33" x2="46" y2="32" stroke="#CCBBAA" stroke-width="0.8"/>
  <line x1="33" y1="34" x2="46" y2="34" stroke="#CCBBAA" stroke-width="0.8"/>
  <!-- forehead crescent - gold, same as Luna but mirrored -->
  <path d="M27 18 Q30 14 33 18 Q30 16 27 18" fill="#FFD700"/>
  <circle cx="30" cy="17" r="3.5" fill="none" stroke="#FFD700" stroke-width="1.2"/>
  <circle cx="28.5" cy="16" r="2.8" fill="#F5F0E8"/>
</svg>`,
      happy:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="50" rx="17" ry="13" fill="#F5F0E8"/>
  <ellipse cx="19" cy="60" rx="7" ry="4" fill="#EDE8DC" transform="rotate(-8,19,60)"/>
  <ellipse cx="41" cy="60" rx="7" ry="4" fill="#EDE8DC" transform="rotate(8,41,60)"/>
  <ellipse cx="17" cy="61" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <ellipse cx="21" cy="62" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <ellipse cx="39" cy="61" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <ellipse cx="43" cy="62" rx="2.5" ry="1.5" fill="#DDD8CC"/>
  <path d="M47 48 Q60 38 56 26 Q52 22 49 28 Q52 36 44 44" fill="#F0EBE0"/>
  <text x="52" y="24" font-size="7" fill="#88AAFF">✦</text>
  <ellipse cx="30" cy="28" rx="16" ry="15" fill="#F5F0E8"/>
  <polygon points="16,18 12,4 22,12" fill="#F5F0E8"/>
  <polygon points="44,18 48,4 38,12" fill="#F5F0E8"/>
  <polygon points="16,17 13,7 21,13" fill="#FFBBCC"/>
  <polygon points="44,17 47,7 39,13" fill="#FFBBCC"/>
  <ellipse cx="30" cy="32" rx="8" ry="6" fill="#EEE8DC"/>
  <!-- happy eyes arc -->
  <path d="M18 27 Q23 21 28 27" fill="#2266FF"/>
  <path d="M32 27 Q37 21 42 27" fill="#2266FF"/>
  <path d="M26 34 Q30 38 34 34" stroke="#FF9999" stroke-width="1.5" fill="none"/>
  <ellipse cx="30" cy="32" rx="2.2" ry="1.5" fill="#FF9999"/>
  <line x1="12" y1="31" x2="27" y2="32" stroke="#CCBBAA" stroke-width="0.8"/>
  <line x1="33" y1="32" x2="48" y2="31" stroke="#CCBBAA" stroke-width="0.8"/>
  <path d="M27 16 Q30 12 33 16 Q30 14 27 16" fill="#FFD700"/>
  <circle cx="30" cy="15" r="3.5" fill="none" stroke="#FFD700" stroke-width="1.2"/>
  <circle cx="28.5" cy="14" r="2.8" fill="#F5F0E8"/>
  <text x="4" y="16" font-size="9" fill="#2266FF">✦</text>
  <text x="46" y="14" font-size="8" fill="#88AAFF">✦</text>
</svg>`,
      sad:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="54" rx="16" ry="12" fill="#F5F0E8"/>
  <ellipse cx="22" cy="63" rx="6" ry="3.5" fill="#EDE8DC"/>
  <ellipse cx="38" cy="63" rx="6" ry="3.5" fill="#EDE8DC"/>
  <ellipse cx="20" cy="64" rx="2" ry="1.2" fill="#DDD8CC"/>
  <ellipse cx="24" cy="65" rx="2" ry="1.2" fill="#DDD8CC"/>
  <ellipse cx="36" cy="64" rx="2" ry="1.2" fill="#DDD8CC"/>
  <ellipse cx="40" cy="65" rx="2" ry="1.2" fill="#DDD8CC"/>
  <path d="M46 54 Q54 52 52 60 Q48 64 44 58 Q46 54 42 52" fill="#F0EBE0"/>
  <ellipse cx="30" cy="32" rx="16" ry="15" fill="#F5F0E8"/>
  <polygon points="16,22 13,8 22,16" fill="#F5F0E8" transform="rotate(5,16,22)"/>
  <polygon points="44,22 47,8 38,16" fill="#F5F0E8" transform="rotate(-5,44,22)"/>
  <polygon points="16,21 14,11 21,17" fill="#FFBBCC" transform="rotate(5,16,21)"/>
  <polygon points="44,21 46,11 39,17" fill="#FFBBCC" transform="rotate(-5,44,21)"/>
  <ellipse cx="30" cy="36" rx="8" ry="6" fill="#EEE8DC"/>
  <ellipse cx="23" cy="30" rx="5" ry="5.5" fill="#2266FF"/>
  <ellipse cx="37" cy="30" rx="5" ry="5.5" fill="#2266FF"/>
  <ellipse cx="23" cy="31" rx="3" ry="3.5" fill="#001166"/>
  <ellipse cx="37" cy="31" rx="3" ry="3.5" fill="#001166"/>
  <circle cx="22" cy="29" r="1.2" fill="white"/>
  <circle cx="36" cy="29" r="1.2" fill="white"/>
  <path d="M19 26 Q23 23 27 26" fill="#F5F0E8"/>
  <path d="M33 26 Q37 23 41 26" fill="#F5F0E8"/>
  <ellipse cx="30" cy="35" rx="2.2" ry="1.5" fill="#FF9999"/>
  <path d="M27 37 Q30 35 33 37" stroke="#FF9999" stroke-width="1" fill="none"/>
  <line x1="14" y1="34" x2="27" y2="34" stroke="#CCBBAA" stroke-width="0.8"/>
  <line x1="33" y1="34" x2="46" y2="34" stroke="#CCBBAA" stroke-width="0.8"/>
  <path d="M27 20 Q30 16 33 20 Q30 18 27 20" fill="#FFD700" opacity="0.6"/>
  <circle cx="30" cy="19" r="3.5" fill="none" stroke="#FFD700" stroke-width="1" opacity="0.6"/>
  <circle cx="28.5" cy="18" r="2.8" fill="#F5F0E8"/>
</svg>`,
    },
    pet_diana: {
      idle:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <!-- body - soft lavender grey, smaller than parents -->
  <ellipse cx="30" cy="53" rx="15" ry="12" fill="#BBAACC"/>
  <!-- front paws - smaller, rounder, very cute -->
  <ellipse cx="21" cy="63" rx="6" ry="3.5" fill="#AA99BB"/>
  <ellipse cx="39" cy="63" rx="6" ry="3.5" fill="#AA99BB"/>
  <ellipse cx="19" cy="64" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="23" cy="65" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="37" cy="64" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="41" cy="65" rx="2" ry="1.2" fill="#998AAA"/>
  <!-- tail - thin, young cat tail -->
  <path d="M45 53 Q54 47 52 40 Q49 36 46 40 Q48 45 43 49" fill="#BBAACC"/>
  <!-- head - rounder/younger face -->
  <ellipse cx="30" cy="31" rx="15" ry="14" fill="#BBAACC"/>
  <!-- ears - sharper than body suggests, kitten proportioned (bigger relative to head) -->
  <polygon points="17,21 13,7 23,15" fill="#BBAACC"/>
  <polygon points="43,21 47,7 37,15" fill="#BBAACC"/>
  <polygon points="17,20 14,10 22,16" fill="#FFAACC"/>
  <polygon points="43,20 46,10 38,16" fill="#FFAACC"/>
  <!-- face muzzle -->
  <ellipse cx="30" cy="35" rx="7" ry="5.5" fill="#AE9DBF"/>
  <!-- eyes - large violet, younger/wider than parents -->
  <ellipse cx="23" cy="29" rx="5.5" ry="6.5" fill="#9944CC"/>
  <ellipse cx="37" cy="29" rx="5.5" ry="6.5" fill="#9944CC"/>
  <ellipse cx="23" cy="29" rx="3" ry="4.5" fill="#330055"/>
  <ellipse cx="37" cy="29" rx="3" ry="4.5" fill="#330055"/>
  <circle cx="22" cy="27" r="1.8" fill="white"/>
  <circle cx="36" cy="27" r="1.8" fill="white"/>
  <!-- cute sparkle in eyes -->
  <circle cx="25" cy="31" r="0.8" fill="white" opacity="0.7"/>
  <circle cx="39" cy="31" r="0.8" fill="white" opacity="0.7"/>
  <ellipse cx="30" cy="34" rx="2" ry="1.4" fill="#FF88AA"/>
  <path d="M28 36 Q30 38 32 36" stroke="#FF88AA" stroke-width="1" fill="none"/>
  <!-- whiskers - thinner, kitten-like -->
  <line x1="15" y1="33" x2="27" y2="34" stroke="#9988AA" stroke-width="0.7"/>
  <line x1="15" y1="35" x2="27" y2="35" stroke="#9988AA" stroke-width="0.7"/>
  <line x1="33" y1="34" x2="45" y2="33" stroke="#9988AA" stroke-width="0.7"/>
  <line x1="33" y1="35" x2="45" y2="35" stroke="#9988AA" stroke-width="0.7"/>
  <!-- forehead symbol - crescent + star (Diana unique) -->
  <circle cx="30" cy="18" r="3.5" fill="none" stroke="#9944CC" stroke-width="1.2"/>
  <circle cx="31.5" cy="17" r="2.8" fill="#BBAACC"/>
  <!-- small star next to crescent -->
  <text x="26" y="16" font-size="6" fill="#9944CC">✦</text>
</svg>`,
      happy:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="51" rx="15" ry="12" fill="#BBAACC"/>
  <ellipse cx="20" cy="61" rx="6" ry="3.5" fill="#AA99BB" transform="rotate(-10,20,61)"/>
  <ellipse cx="40" cy="61" rx="6" ry="3.5" fill="#AA99BB" transform="rotate(10,40,61)"/>
  <ellipse cx="18" cy="62" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="22" cy="63" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="38" cy="62" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="42" cy="63" rx="2" ry="1.2" fill="#998AAA"/>
  <!-- tail up and curled - kitten excitement -->
  <path d="M45 49 Q56 40 54 28 Q51 24 48 30 Q51 38 43 45" fill="#BBAACC"/>
  <text x="50" y="26" font-size="7" fill="#9944CC">✦</text>
  <ellipse cx="30" cy="29" rx="15" ry="14" fill="#BBAACC"/>
  <polygon points="17,19 13,5 23,13" fill="#BBAACC"/>
  <polygon points="43,19 47,5 37,13" fill="#BBAACC"/>
  <polygon points="17,18 14,8 22,14" fill="#FFAACC"/>
  <polygon points="43,18 46,8 38,14" fill="#FFAACC"/>
  <ellipse cx="30" cy="33" rx="7" ry="5.5" fill="#AE9DBF"/>
  <!-- big happy eyes -->
  <path d="M18 28 Q23 22 28 28" fill="#9944CC"/>
  <path d="M32 28 Q37 22 42 28" fill="#9944CC"/>
  <path d="M26 35 Q30 39 34 35" stroke="#FF88AA" stroke-width="1.5" fill="none"/>
  <ellipse cx="30" cy="33" rx="2" ry="1.4" fill="#FF88AA"/>
  <line x1="13" y1="32" x2="27" y2="33" stroke="#9988AA" stroke-width="0.7"/>
  <line x1="33" y1="33" x2="47" y2="32" stroke="#9988AA" stroke-width="0.7"/>
  <circle cx="30" cy="17" r="3.5" fill="none" stroke="#9944CC" stroke-width="1.2"/>
  <circle cx="31.5" cy="16" r="2.8" fill="#BBAACC"/>
  <text x="26" y="15" font-size="6" fill="#9944CC">✦</text>
  <!-- extra sparkles - kitten energy -->
  <text x="3" y="18" font-size="9" fill="#9944CC">✦</text>
  <text x="46" y="16" font-size="8" fill="#CC88FF">✦</text>
  <text x="8" y="58" font-size="7" fill="#FF88AA">✧</text>
</svg>`,
      sad:`<svg viewBox="0 0 60 70" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="30" cy="55" rx="14" ry="11" fill="#BBAACC"/>
  <ellipse cx="22" cy="64" rx="5.5" ry="3" fill="#AA99BB"/>
  <ellipse cx="38" cy="64" rx="5.5" ry="3" fill="#AA99BB"/>
  <ellipse cx="20" cy="65" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="24" cy="66" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="36" cy="65" rx="2" ry="1.2" fill="#998AAA"/>
  <ellipse cx="40" cy="66" rx="2" ry="1.2" fill="#998AAA"/>
  <!-- sad droopy tail -->
  <path d="M44 55 Q50 56 48 62 Q45 66 42 61 Q43 57 40 54" fill="#BBAACC"/>
  <ellipse cx="30" cy="33" rx="15" ry="14" fill="#BBAACC"/>
  <polygon points="17,23 14,9 23,17" fill="#BBAACC" transform="rotate(6,17,23)"/>
  <polygon points="43,23 46,9 37,17" fill="#BBAACC" transform="rotate(-6,43,23)"/>
  <polygon points="17,22 15,12 22,18" fill="#FFAACC" transform="rotate(6,17,22)"/>
  <polygon points="43,22 45,12 38,18" fill="#FFAACC" transform="rotate(-6,43,22)"/>
  <ellipse cx="30" cy="37" rx="7" ry="5.5" fill="#AE9DBF"/>
  <!-- sad big eyes - very expressive, kitten sad is maximum sad -->
  <ellipse cx="23" cy="31" rx="5.5" ry="6" fill="#9944CC"/>
  <ellipse cx="37" cy="31" rx="5.5" ry="6" fill="#9944CC"/>
  <ellipse cx="23" cy="32" rx="3" ry="4" fill="#330055"/>
  <ellipse cx="37" cy="32" rx="3" ry="4" fill="#330055"/>
  <circle cx="22" cy="30" r="1.5" fill="white"/>
  <circle cx="36" cy="30" r="1.5" fill="white"/>
  <!-- very droopy brows -->
  <path d="M18 26 Q23 22 28 26" fill="#BBAACC"/>
  <path d="M32 26 Q37 22 42 26" fill="#BBAACC"/>
  <!-- tiny tear -->
  <ellipse cx="20" cy="34" rx="1" ry="1.5" fill="#AABBFF" opacity="0.7"/>
  <ellipse cx="30" cy="36" rx="2" ry="1.4" fill="#FF88AA"/>
  <path d="M27 38 Q30 36 33 38" stroke="#FF88AA" stroke-width="1" fill="none"/>
  <line x1="15" y1="35" x2="27" y2="35" stroke="#9988AA" stroke-width="0.7"/>
  <line x1="33" y1="35" x2="45" y2="35" stroke="#9988AA" stroke-width="0.7"/>
  <circle cx="30" cy="20" r="3.5" fill="none" stroke="#9944CC" stroke-width="1" opacity="0.5"/>
  <circle cx="31.5" cy="19" r="2.8" fill="#BBAACC"/>
  <text x="26" y="18" font-size="6" fill="#9944CC" opacity="0.4">✦</text>
</svg>`,
    },
        pet_rabbit: {
      idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="16" rx="4" ry="12" fill="#F0E0FF"/>
        <ellipse cx="38" cy="16" rx="4" ry="12" fill="#F0E0FF"/>
        <ellipse cx="22" cy="16" rx="2" ry="7" fill="#FFB0CC"/>
        <ellipse cx="38" cy="16" rx="2" ry="7" fill="#FFB0CC"/>
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#F0E0FF"/>
        <ellipse cx="30" cy="34" rx="14" ry="13" fill="#F8F0FF"/>
        <ellipse cx="24" cy="32" rx="5" ry="6" fill="#FF4466"/>
        <ellipse cx="36" cy="32" rx="5" ry="6" fill="#FF4466"/>
        <ellipse cx="24" cy="32" rx="2.5" ry="3.5" fill="#880022"/>
        <ellipse cx="36" cy="32" rx="2.5" ry="3.5" fill="#880022"/>
        <circle cx="25" cy="30" r="1.5" fill="white"/>
        <circle cx="37" cy="30" r="1.5" fill="white"/>
        <ellipse cx="30" cy="37" rx="3" ry="2" fill="#FFB0CC"/>
        <path d="M27 39 Q30 42 33 39" stroke="#ddd" stroke-width="1" fill="none"/>
        <circle cx="20" cy="37" r="2" fill="#FFB0CC" opacity="0.6"/>
        <circle cx="24" cy="39" r="2" fill="#FFB0CC" opacity="0.6"/>
        <circle cx="36" cy="37" r="2" fill="#FFB0CC" opacity="0.6"/>
        <circle cx="40" cy="39" r="2" fill="#FFB0CC" opacity="0.6"/>
      </svg>`,
      happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="14" rx="4" ry="12" fill="#F0E0FF"/>
        <ellipse cx="38" cy="14" rx="4" ry="12" fill="#F0E0FF"/>
        <ellipse cx="22" cy="14" rx="2" ry="7" fill="#FFB0CC"/>
        <ellipse cx="38" cy="14" rx="2" ry="7" fill="#FFB0CC"/>
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#F0E0FF"/>
        <ellipse cx="30" cy="34" rx="14" ry="13" fill="#F8F0FF"/>
        <path d="M20 31 Q24 26 28 31" fill="#FF4466"/>
        <path d="M32 31 Q36 26 40 31" fill="#FF4466"/>
        <ellipse cx="30" cy="37" rx="3" ry="2" fill="#FFB0CC"/>
        <path d="M25 39 Q30 44 35 39" stroke="#ddd" stroke-width="1.5" fill="none"/>
        <text x="12" y="12" font-size="8" fill="#AA44FF">✦</text>
        <text x="38" y="10" font-size="8" fill="#FF88CC">✦</text>
      </svg>`,
      sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="22" cy="18" rx="4" ry="12" fill="#F0E0FF" transform="rotate(8,22,18)"/>
        <ellipse cx="38" cy="18" rx="4" ry="12" fill="#F0E0FF" transform="rotate(-8,38,18)"/>
        <ellipse cx="22" cy="18" rx="2" ry="7" fill="#FFB0CC" transform="rotate(8,22,18)"/>
        <ellipse cx="38" cy="18" rx="2" ry="7" fill="#FFB0CC" transform="rotate(-8,38,18)"/>
        <ellipse cx="30" cy="40" rx="18" ry="14" fill="#F0E0FF"/>
        <ellipse cx="30" cy="36" rx="14" ry="12" fill="#F8F0FF"/>
        <path d="M22 33 Q26 36 30 33" fill="none" stroke="#FF4466" stroke-width="2"/>
        <path d="M30 33 Q34 36 38 33" fill="none" stroke="#FF4466" stroke-width="2"/>
        <ellipse cx="30" cy="38" rx="3" ry="2" fill="#FFB0CC"/>
        <path d="M26 41 Q30 38 34 41" stroke="#ddd" stroke-width="1.2" fill="none"/>
      </svg>`,
    },
  };

  // ── Baby Dragon ──────────────────────────────────────────────────────────────
  arts.pet_dragon = {
    idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- wings -->
      <path d="M10 28 Q4 18 14 20 Q10 26 18 28" fill="#66BB66" opacity="0.8"/>
      <path d="M50 28 Q56 18 46 20 Q50 26 42 28" fill="#66BB66" opacity="0.8"/>
      <!-- tail -->
      <path d="M30 48 Q42 52 46 46 Q44 42 38 44" fill="#44AA44"/>
      <!-- body -->
      <ellipse cx="30" cy="36" rx="16" ry="14" fill="#55BB55"/>
      <!-- tummy -->
      <ellipse cx="30" cy="38" rx="9" ry="8" fill="#AADDAA"/>
      <!-- head -->
      <ellipse cx="30" cy="24" rx="13" ry="12" fill="#55BB55"/>
      <!-- horns -->
      <path d="M22 14 Q20 7 24 10" stroke="#44AA44" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M38 14 Q40 7 36 10" stroke="#44AA44" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- eyes -->
      <ellipse cx="24" cy="23" rx="4" ry="4.5" fill="#FFD700"/>
      <ellipse cx="36" cy="23" rx="4" ry="4.5" fill="#FFD700"/>
      <ellipse cx="24" cy="23" rx="2" ry="3" fill="#113300"/>
      <ellipse cx="36" cy="23" rx="2" ry="3" fill="#113300"/>
      <circle cx="24" cy="21" r="1" fill="white"/>
      <circle cx="36" cy="21" r="1" fill="white"/>
      <!-- nostrils -->
      <circle cx="27" cy="29" r="1.2" fill="#33AA33"/>
      <circle cx="33" cy="29" r="1.2" fill="#33AA33"/>
      <!-- mouth -->
      <path d="M26 31 Q30 34 34 31" stroke="#33AA33" stroke-width="1" fill="none"/>
      <!-- sparkle breath -->
      <text x="6" y="44" font-size="7" fill="#FFD700" opacity="0.7">✦</text>
      <text x="2" y="38" font-size="5" fill="#FF88CC" opacity="0.6">✧</text>
    </svg>`,
    happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- wings spread wide -->
      <path d="M8 24 Q0 12 14 16 Q8 22 18 26" fill="#66BB66" opacity="0.9"/>
      <path d="M52 24 Q60 12 46 16 Q52 22 42 26" fill="#66BB66" opacity="0.9"/>
      <!-- tail wagging -->
      <path d="M30 46 Q44 48 50 40 Q48 36 42 40" fill="#44AA44"/>
      <!-- body -->
      <ellipse cx="30" cy="35" rx="16" ry="14" fill="#55BB55"/>
      <ellipse cx="30" cy="37" rx="9" ry="8" fill="#AADDAA"/>
      <!-- head bounced up -->
      <ellipse cx="30" cy="22" rx="13" ry="12" fill="#55BB55"/>
      <path d="M22 12 Q20 5 24 8" stroke="#44AA44" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M38 12 Q40 5 36 8" stroke="#44AA44" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- happy eyes - arcs -->
      <path d="M20 22 Q24 17 28 22" fill="#FFD700"/>
      <path d="M32 22 Q36 17 40 22" fill="#FFD700"/>
      <circle cx="27" cy="28" r="1.2" fill="#33AA33"/>
      <circle cx="33" cy="28" r="1.2" fill="#33AA33"/>
      <path d="M25 30 Q30 34 35 30" stroke="#33AA33" stroke-width="1.5" fill="none"/>
      <!-- sparkles everywhere -->
      <text x="3" y="15" font-size="9" fill="#FFD700">✦</text>
      <text x="46" y="13" font-size="8" fill="#FF88CC">✦</text>
      <text x="8" y="50" font-size="7" fill="#88FFCC">✧</text>
      <text x="46" y="50" font-size="7" fill="#FFD700">✧</text>
    </svg>`,
    sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- wings drooped -->
      <path d="M12 34 Q6 28 14 24 Q12 30 20 32" fill="#449944" opacity="0.7"/>
      <path d="M48 34 Q54 28 46 24 Q48 30 40 32" fill="#449944" opacity="0.7"/>
      <path d="M30 50 Q40 54 44 48 Q42 44 36 46" fill="#44AA44"/>
      <ellipse cx="30" cy="38" rx="16" ry="14" fill="#449944"/>
      <ellipse cx="30" cy="40" rx="9" ry="8" fill="#99CC99"/>
      <ellipse cx="30" cy="26" rx="13" ry="12" fill="#449944"/>
      <path d="M22 16 Q21 10 24 13" stroke="#338833" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M38 16 Q39 10 36 13" stroke="#338833" stroke-width="2" fill="none" stroke-linecap="round"/>
      <!-- sad eyes - droopy -->
      <ellipse cx="24" cy="25" rx="4" ry="4.5" fill="#CCCC44"/>
      <ellipse cx="36" cy="25" rx="4" ry="4.5" fill="#CCCC44"/>
      <ellipse cx="24" cy="26" rx="2" ry="2.5" fill="#113300"/>
      <ellipse cx="36" cy="26" rx="2" ry="2.5" fill="#113300"/>
      <path d="M22 24 Q24 21 26 24" fill="#449944"/>
      <path d="M34 24 Q36 21 38 24" fill="#449944"/>
      <circle cx="27" cy="31" r="1.2" fill="#338833"/>
      <circle cx="33" cy="31" r="1.2" fill="#338833"/>
      <path d="M26 33 Q30 31 34 33" stroke="#338833" stroke-width="1" fill="none"/>
    </svg>`,
  };

  // ── Tiny Fairy ──────────────────────────────────────────────────────────────
  arts.pet_fairy = {
    idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- wings -->
      <ellipse cx="16" cy="26" rx="12" ry="8" fill="#CCEEFF" opacity="0.7" transform="rotate(-20,16,26)"/>
      <ellipse cx="44" cy="26" rx="12" ry="8" fill="#CCEEFF" opacity="0.7" transform="rotate(20,44,26)"/>
      <ellipse cx="14" cy="34" rx="8" ry="5" fill="#DDEEFF" opacity="0.6" transform="rotate(15,14,34)"/>
      <ellipse cx="46" cy="34" rx="8" ry="5" fill="#DDEEFF" opacity="0.6" transform="rotate(-15,46,34)"/>
      <!-- wing shimmer lines -->
      <path d="M16 20 Q12 26 18 30" stroke="white" stroke-width="0.5" fill="none" opacity="0.6"/>
      <path d="M44 20 Q48 26 42 30" stroke="white" stroke-width="0.5" fill="none" opacity="0.6"/>
      <!-- dress/body -->
      <path d="M22 32 Q30 28 38 32 Q40 44 30 46 Q20 44 22 32" fill="#FF88CC"/>
      <!-- skirt sparkle trim -->
      <path d="M21 38 Q30 36 39 38" stroke="#FFD700" stroke-width="1" fill="none" opacity="0.8"/>
      <!-- head -->
      <ellipse cx="30" cy="22" rx="10" ry="10" fill="#FFD9B0"/>
      <!-- hair -->
      <ellipse cx="30" cy="15" rx="10" ry="6" fill="#FFD700"/>
      <path d="M20 18 Q18 10 22 14" fill="#FFD700"/>
      <path d="M40 18 Q42 10 38 14" fill="#FFD700"/>
      <!-- eyes -->
      <ellipse cx="26" cy="22" rx="2.5" ry="3" fill="#4466FF"/>
      <ellipse cx="34" cy="22" rx="2.5" ry="3" fill="#4466FF"/>
      <circle cx="26" cy="21" r="1" fill="white"/>
      <circle cx="34" cy="21" r="1" fill="white"/>
      <!-- mouth -->
      <path d="M27 27 Q30 30 33 27" stroke="#FF6688" stroke-width="1" fill="none"/>
      <!-- wand -->
      <line x1="40" y1="30" x2="48" y2="18" stroke="#FFD700" stroke-width="1.5"/>
      <text x="44" y="16" font-size="8" fill="#FFD700">✦</text>
      <!-- floating sparkles -->
      <text x="6" y="20" font-size="6" fill="#FF88CC" opacity="0.7">✧</text>
      <text x="8" y="44" font-size="5" fill="#AACCFF" opacity="0.6">✦</text>
    </svg>`,
    happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- wings fluttering wider -->
      <ellipse cx="13" cy="23" rx="14" ry="9" fill="#BBDDFF" opacity="0.8" transform="rotate(-25,13,23)"/>
      <ellipse cx="47" cy="23" rx="14" ry="9" fill="#BBDDFF" opacity="0.8" transform="rotate(25,47,23)"/>
      <ellipse cx="11" cy="33" rx="9" ry="6" fill="#CCEEFF" opacity="0.7" transform="rotate(18,11,33)"/>
      <ellipse cx="49" cy="33" rx="9" ry="6" fill="#CCEEFF" opacity="0.7" transform="rotate(-18,49,33)"/>
      <!-- body raised -->
      <path d="M22 30 Q30 26 38 30 Q40 42 30 44 Q20 42 22 30" fill="#FF66BB"/>
      <path d="M21 36 Q30 34 39 36" stroke="#FFD700" stroke-width="1.2" fill="none"/>
      <!-- head -->
      <ellipse cx="30" cy="20" rx="10" ry="10" fill="#FFD9B0"/>
      <ellipse cx="30" cy="13" rx="10" ry="6" fill="#FFCC00"/>
      <path d="M20 16 Q18 8 22 12" fill="#FFCC00"/>
      <path d="M40 16 Q42 8 38 12" fill="#FFCC00"/>
      <!-- happy eyes arcs -->
      <path d="M23 21 Q26 17 29 21" fill="#4466FF"/>
      <path d="M31 21 Q34 17 37 21" fill="#4466FF"/>
      <path d="M27 26 Q30 30 33 26" stroke="#FF6688" stroke-width="1.5" fill="none"/>
      <!-- wand with big star -->
      <line x1="40" y1="28" x2="50" y2="14" stroke="#FFD700" stroke-width="1.5"/>
      <text x="46" y="13" font-size="10" fill="#FFD700">✦</text>
      <!-- lots of sparkles -->
      <text x="2" y="16" font-size="9" fill="#FF88CC">✦</text>
      <text x="46" y="46" font-size="7" fill="#AACCFF">✧</text>
      <text x="4" y="50" font-size="8" fill="#FFD700">✦</text>
      <text x="28" y="56" font-size="6" fill="#FF88CC">✧</text>
    </svg>`,
    sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- wings drooped -->
      <ellipse cx="16" cy="30" rx="10" ry="7" fill="#BBCCDD" opacity="0.5" transform="rotate(10,16,30)"/>
      <ellipse cx="44" cy="30" rx="10" ry="7" fill="#BBCCDD" opacity="0.5" transform="rotate(-10,44,30)"/>
      <ellipse cx="15" cy="38" rx="7" ry="4" fill="#CCDDEE" opacity="0.4" transform="rotate(5,15,38)"/>
      <ellipse cx="45" cy="38" rx="7" ry="4" fill="#CCDDEE" opacity="0.4" transform="rotate(-5,45,38)"/>
      <path d="M22 34 Q30 30 38 34 Q40 46 30 48 Q20 46 22 34" fill="#DD88AA"/>
      <ellipse cx="30" cy="24" rx="10" ry="10" fill="#FFD9B0"/>
      <ellipse cx="30" cy="17" rx="10" ry="6" fill="#DDAA00"/>
      <path d="M20 20 Q18 13 22 16" fill="#DDAA00"/>
      <path d="M40 20 Q42 13 38 16" fill="#DDAA00"/>
      <!-- sad eyes -->
      <ellipse cx="26" cy="24" rx="2.5" ry="3" fill="#3355DD"/>
      <ellipse cx="34" cy="24" rx="2.5" ry="3" fill="#3355DD"/>
      <circle cx="26" cy="23" r="1" fill="white"/>
      <circle cx="34" cy="23" r="1" fill="white"/>
      <!-- eyebrow furrowed -->
      <path d="M23 20 Q26 18 29 20" stroke="#CC6644" stroke-width="1" fill="none"/>
      <path d="M31 20 Q34 18 37 20" stroke="#CC6644" stroke-width="1" fill="none"/>
      <path d="M27 29 Q30 27 33 29" stroke="#FF6688" stroke-width="1" fill="none"/>
      <!-- droopy wand -->
      <line x1="38" y1="32" x2="44" y2="42" stroke="#CCAA00" stroke-width="1.5"/>
      <text x="42" y="44" font-size="7" fill="#CCAA00" opacity="0.5">✦</text>
    </svg>`,
  };

  // ── Celestial Fox ────────────────────────────────────────────────────────────
  arts.pet_fox = {
    idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- tails (3) with cosmic glow -->
      <path d="M30 44 Q48 38 54 28 Q50 24 44 30 Q46 36 36 40" fill="#FF8833" opacity="0.9"/>
      <path d="M30 44 Q50 46 54 38 Q50 36 46 40 Q44 44 36 44" fill="#FFAA44" opacity="0.8"/>
      <path d="M30 44 Q46 52 52 46 Q50 42 44 44 Q42 48 36 46" fill="#FF6622" opacity="0.7"/>
      <!-- tail stars -->
      <text x="44" y="28" font-size="6" fill="#FFD700" opacity="0.9">✦</text>
      <text x="48" y="38" font-size="5" fill="#AADDFF" opacity="0.8">✧</text>
      <text x="44" y="48" font-size="5" fill="#FF88CC" opacity="0.7">✦</text>
      <!-- body -->
      <ellipse cx="26" cy="40" rx="14" ry="12" fill="#FF8833"/>
      <!-- chest fluff -->
      <ellipse cx="26" cy="42" rx="8" ry="7" fill="#FFDDAA"/>
      <!-- head -->
      <ellipse cx="26" cy="26" rx="13" ry="12" fill="#FF8833"/>
      <!-- ears -->
      <path d="M14 18 Q12 6 20 12" fill="#FF8833"/>
      <path d="M38 18 Q40 6 32 12" fill="#FF8833"/>
      <path d="M15 18 Q14 10 19 13" fill="#FFB0B0"/>
      <path d="M37 18 Q38 10 33 13" fill="#FFB0B0"/>
      <!-- cosmic markings on forehead -->
      <path d="M20 18 Q26 14 32 18" stroke="#FFD700" stroke-width="1" fill="none" opacity="0.7"/>
      <circle cx="26" cy="16" r="1.5" fill="#FFD700" opacity="0.8"/>
      <!-- eyes - glowing -->
      <ellipse cx="20" cy="26" rx="4" ry="4.5" fill="#AADDFF"/>
      <ellipse cx="32" cy="26" rx="4" ry="4.5" fill="#AADDFF"/>
      <ellipse cx="20" cy="26" rx="2" ry="3" fill="#113366"/>
      <ellipse cx="32" cy="26" rx="2" ry="3" fill="#113366"/>
      <circle cx="20" cy="24" r="1.2" fill="white"/>
      <circle cx="32" cy="24" r="1.2" fill="white"/>
      <!-- eye glow -->
      <ellipse cx="20" cy="26" rx="4.5" ry="5" fill="#AADDFF" opacity="0.2"/>
      <ellipse cx="32" cy="26" rx="4.5" ry="5" fill="#AADDFF" opacity="0.2"/>
      <!-- nose -->
      <ellipse cx="26" cy="31" rx="2" ry="1.5" fill="#CC4422"/>
      <path d="M24 33 Q26 36 28 33" stroke="#CC4422" stroke-width="1" fill="none"/>
      <!-- whiskers -->
      <line x1="12" y1="30" x2="22" y2="31" stroke="#FFDDAA" stroke-width="0.8"/>
      <line x1="12" y1="32" x2="22" y2="32" stroke="#FFDDAA" stroke-width="0.8"/>
      <line x1="30" y1="31" x2="40" y2="30" stroke="#FFDDAA" stroke-width="0.8"/>
      <line x1="30" y1="32" x2="40" y2="32" stroke="#FFDDAA" stroke-width="0.8"/>
    </svg>`,
    happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- tails fanned out wide -->
      <path d="M30 42 Q50 32 58 20 Q54 16 46 24 Q48 32 36 38" fill="#FF8833"/>
      <path d="M30 42 Q52 44 58 34 Q54 30 48 36 Q46 40 36 42" fill="#FFAA44"/>
      <path d="M30 42 Q50 52 58 46 Q56 40 48 42 Q46 48 36 46" fill="#FF6622"/>
      <text x="50" y="22" font-size="8" fill="#FFD700">✦</text>
      <text x="52" y="36" font-size="7" fill="#AADDFF">✦</text>
      <text x="50" y="50" font-size="6" fill="#FF88CC">✦</text>
      <!-- body -->
      <ellipse cx="26" cy="38" rx="14" ry="12" fill="#FF8833"/>
      <ellipse cx="26" cy="40" rx="8" ry="7" fill="#FFDDAA"/>
      <!-- head -->
      <ellipse cx="26" cy="24" rx="13" ry="12" fill="#FF8833"/>
      <path d="M14 16 Q12 4 20 10" fill="#FF8833"/>
      <path d="M38 16 Q40 4 32 10" fill="#FF8833"/>
      <path d="M15 16 Q14 8 19 11" fill="#FFB0B0"/>
      <path d="M37 16 Q38 8 33 11" fill="#FFB0B0"/>
      <path d="M20 16 Q26 12 32 16" stroke="#FFD700" stroke-width="1.2" fill="none"/>
      <circle cx="26" cy="14" r="2" fill="#FFD700"/>
      <!-- happy eyes -->
      <path d="M16 25 Q20 20 24 25" fill="#AADDFF"/>
      <path d="M28 25 Q32 20 36 25" fill="#AADDFF"/>
      <ellipse cx="26" cy="30" rx="2" ry="1.5" fill="#CC4422"/>
      <path d="M23 32 Q26 36 29 32" stroke="#CC4422" stroke-width="1.5" fill="none"/>
      <line x1="12" y1="29" x2="22" y2="30" stroke="#FFDDAA" stroke-width="0.8"/>
      <line x1="30" y1="30" x2="40" y2="29" stroke="#FFDDAA" stroke-width="0.8"/>
      <!-- sparkles galore -->
      <text x="2" y="18" font-size="9" fill="#FFD700">✦</text>
      <text x="4" y="52" font-size="8" fill="#AADDFF">✧</text>
      <text x="22" y="56" font-size="7" fill="#FF88CC">✦</text>
    </svg>`,
    sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- tails drooped down -->
      <path d="M30 46 Q42 52 46 58 Q42 58 38 54 Q36 50 34 48" fill="#CC6622" opacity="0.8"/>
      <path d="M30 46 Q44 54 46 60 Q42 60 40 56 Q38 52 34 50" fill="#DD8833" opacity="0.7"/>
      <path d="M30 46 Q40 56 42 60 Q38 60 36 58 Q34 54 32 50" fill="#BB5511" opacity="0.6"/>
      <ellipse cx="26" cy="40" rx="14" ry="12" fill="#CC6622"/>
      <ellipse cx="26" cy="42" rx="8" ry="7" fill="#EECCAA"/>
      <ellipse cx="26" cy="26" rx="13" ry="12" fill="#CC6622"/>
      <path d="M14 18 Q12 8 20 12" fill="#CC6622"/>
      <path d="M38 18 Q40 8 32 12" fill="#CC6622"/>
      <path d="M15 18 Q14 10 19 13" fill="#DDAAAA"/>
      <path d="M37 18 Q38 10 33 13" fill="#DDAAAA"/>
      <path d="M20 18 Q26 14 32 18" stroke="#DDAA44" stroke-width="0.8" fill="none" opacity="0.5"/>
      <!-- sad glowing eyes -->
      <ellipse cx="20" cy="26" rx="4" ry="4.5" fill="#88AACC"/>
      <ellipse cx="32" cy="26" rx="4" ry="4.5" fill="#88AACC"/>
      <ellipse cx="20" cy="27" rx="2" ry="2.5" fill="#112244"/>
      <ellipse cx="32" cy="27" rx="2" ry="2.5" fill="#112244"/>
      <path d="M17 23 Q20 20 23 23" fill="#CC6622"/>
      <path d="M29 23 Q32 20 35 23" fill="#CC6622"/>
      <ellipse cx="26" cy="31" rx="2" ry="1.5" fill="#AA3311"/>
      <path d="M24 33 Q26 31 28 33" stroke="#AA3311" stroke-width="1" fill="none"/>
      <line x1="12" y1="30" x2="22" y2="31" stroke="#EECCAA" stroke-width="0.8" opacity="0.6"/>
      <line x1="30" y1="31" x2="40" y2="30" stroke="#EECCAA" stroke-width="0.8" opacity="0.6"/>
    </svg>`,
  };

  // ── Baby Phoenix ─────────────────────────────────────────────────────────────
  arts.pet_phoenix = {
    idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- flame tail feathers -->
      <path d="M30 44 Q20 50 14 58 Q20 54 24 48" fill="#FF4400" opacity="0.8"/>
      <path d="M30 44 Q30 54 28 60 Q32 54 32 46" fill="#FF6600" opacity="0.9"/>
      <path d="M30 44 Q40 50 46 58 Q40 54 36 48" fill="#FF4400" opacity="0.8"/>
      <path d="M30 44 Q16 48 10 56 Q16 50 22 46" fill="#FF2200" opacity="0.7"/>
      <path d="M30 44 Q44 48 50 56 Q44 50 38 46" fill="#FF2200" opacity="0.7"/>
      <!-- body - fluffy chick -->
      <ellipse cx="30" cy="36" rx="16" ry="14" fill="#FF7700"/>
      <!-- wing feathers -->
      <path d="M14 34 Q8 26 14 22 Q16 30 22 32" fill="#FF5500"/>
      <path d="M46 34 Q52 26 46 22 Q44 30 38 32" fill="#FF5500"/>
      <!-- wing tips glow -->
      <path d="M10 24 Q8 20 12 22" fill="#FFD700" opacity="0.7"/>
      <path d="M50 24 Q52 20 48 22" fill="#FFD700" opacity="0.7"/>
      <!-- tummy - lighter -->
      <ellipse cx="30" cy="38" rx="9" ry="8" fill="#FFAA44"/>
      <!-- head -->
      <ellipse cx="30" cy="23" rx="12" ry="11" fill="#FF7700"/>
      <!-- crest feathers on head -->
      <path d="M26 13 Q24 4 28 8" fill="#FF4400"/>
      <path d="M30 12 Q30 3 32 7" fill="#FF6600"/>
      <path d="M34 13 Q36 4 32 8" fill="#FF4400"/>
      <!-- crest tips glow -->
      <circle cx="28" cy="8" r="2" fill="#FFD700" opacity="0.8"/>
      <circle cx="30" cy="6" r="2" fill="#FFEE44" opacity="0.9"/>
      <circle cx="32" cy="8" r="2" fill="#FFD700" opacity="0.8"/>
      <!-- eyes - glowing ember -->
      <ellipse cx="24" cy="23" rx="4" ry="4" fill="#FFD700"/>
      <ellipse cx="36" cy="23" rx="4" ry="4" fill="#FFD700"/>
      <ellipse cx="24" cy="23" rx="2" ry="2.5" fill="#882200"/>
      <ellipse cx="36" cy="23" rx="2" ry="2.5" fill="#882200"/>
      <circle cx="24" cy="21" r="1.2" fill="#FFEE88"/>
      <circle cx="36" cy="21" r="1.2" fill="#FFEE88"/>
      <!-- beak -->
      <path d="M27 29 L30 33 L33 29" fill="#FFD700"/>
      <!-- flame glow aura -->
      <ellipse cx="30" cy="32" rx="18" ry="16" fill="#FF6600" opacity="0.08"/>
      <!-- floating embers -->
      <text x="4" y="26" font-size="6" fill="#FFD700" opacity="0.7">✦</text>
      <text x="48" y="24" font-size="5" fill="#FF8800" opacity="0.7">✧</text>
    </svg>`,
    happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- flame tail fanned out -->
      <path d="M30 42 Q18 46 10 56 Q18 50 24 44" fill="#FF4400"/>
      <path d="M30 42 Q22 50 18 60 Q24 52 28 44" fill="#FF6600"/>
      <path d="M30 42 Q30 52 28 60 Q32 52 32 44" fill="#FF8800"/>
      <path d="M30 42 Q38 50 42 60 Q36 52 32 44" fill="#FF6600"/>
      <path d="M30 42 Q42 46 50 56 Q42 50 36 44" fill="#FF4400"/>
      <!-- body lifted -->
      <ellipse cx="30" cy="33" rx="16" ry="14" fill="#FF7700"/>
      <path d="M12 31 Q6 22 12 18 Q14 26 20 28" fill="#FF5500"/>
      <path d="M48 31 Q54 22 48 18 Q46 26 40 28" fill="#FF5500"/>
      <path d="M8 20 Q6 15 10 18" fill="#FFD700"/>
      <path d="M52 20 Q54 15 50 18" fill="#FFD700"/>
      <ellipse cx="30" cy="35" rx="9" ry="8" fill="#FFAA44"/>
      <ellipse cx="30" cy="20" rx="12" ry="11" fill="#FF7700"/>
      <path d="M26 10 Q24 2 28 6" fill="#FF4400"/>
      <path d="M30 9 Q30 1 32 5" fill="#FF6600"/>
      <path d="M34 10 Q36 2 32 6" fill="#FF4400"/>
      <circle cx="28" cy="6" r="2.5" fill="#FFEE44"/>
      <circle cx="30" cy="4" r="2.5" fill="#FFFFFF" opacity="0.9"/>
      <circle cx="32" cy="6" r="2.5" fill="#FFEE44"/>
      <!-- happy eyes -->
      <path d="M20 22 Q24 17 28 22" fill="#FFD700"/>
      <path d="M32 22 Q36 17 40 22" fill="#FFD700"/>
      <path d="M26 28 L30 32 L34 28" fill="#FFD700"/>
      <!-- embers everywhere -->
      <text x="2" y="16" font-size="9" fill="#FFD700">✦</text>
      <text x="48" y="14" font-size="8" fill="#FF8800">✦</text>
      <text x="4" y="52" font-size="7" fill="#FFCC44">✧</text>
      <text x="48" y="54" font-size="7" fill="#FF6600">✧</text>
      <text x="26" y="58" font-size="6" fill="#FFD700">✦</text>
      <ellipse cx="30" cy="30" rx="20" ry="18" fill="#FF6600" opacity="0.06"/>
    </svg>`,
    sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- tail flames low and dim -->
      <path d="M30 46 Q22 52 18 58 Q22 54 26 48" fill="#AA2200" opacity="0.7"/>
      <path d="M30 46 Q30 54 28 60 Q32 54 32 48" fill="#CC4400" opacity="0.8"/>
      <path d="M30 46 Q38 52 42 58 Q38 54 34 48" fill="#AA2200" opacity="0.7"/>
      <ellipse cx="30" cy="38" rx="16" ry="14" fill="#CC5500"/>
      <path d="M14 36 Q8 28 14 24 Q16 32 22 34" fill="#BB4400" opacity="0.8"/>
      <path d="M46 36 Q52 28 46 24 Q44 32 38 34" fill="#BB4400" opacity="0.8"/>
      <ellipse cx="30" cy="40" rx="9" ry="8" fill="#DD8833"/>
      <ellipse cx="30" cy="25" rx="12" ry="11" fill="#CC5500"/>
      <!-- crest drooped -->
      <path d="M26 15 Q22 8 26 12" fill="#AA2200"/>
      <path d="M30 14 Q28 7 30 11" fill="#CC4400"/>
      <path d="M34 15 Q38 8 34 12" fill="#AA2200"/>
      <circle cx="26" cy="12" r="1.5" fill="#884400" opacity="0.6"/>
      <circle cx="30" cy="10" r="1.5" fill="#AA6600" opacity="0.6"/>
      <circle cx="34" cy="12" r="1.5" fill="#884400" opacity="0.6"/>
      <!-- dim sad eyes -->
      <ellipse cx="24" cy="25" rx="4" ry="4" fill="#CCAA00"/>
      <ellipse cx="36" cy="25" rx="4" ry="4" fill="#CCAA00"/>
      <ellipse cx="24" cy="26" rx="2" ry="2.5" fill="#661100"/>
      <ellipse cx="36" cy="26" rx="2" ry="2.5" fill="#661100"/>
      <!-- furrowed brow -->
      <path d="M21 21 Q24 18 27 21" fill="#CC5500"/>
      <path d="M33 21 Q36 18 39 21" fill="#CC5500"/>
      <path d="M27 29 L30 33 L33 29" fill="#CCAA00"/>
      <!-- dim ember -->
      <text x="6" y="28" font-size="5" fill="#AA6600" opacity="0.4">✦</text>
    </svg>`,
  };

  // Fallback (should never be reached now but kept as safety net)
  const fallback = {
    idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="35" r="20" fill="${col}88"/>
      <circle cx="30" cy="30" r="15" fill="${col}"/>
      <circle cx="24" cy="27" r="4" fill="white"/><circle cx="36" cy="27" r="4" fill="white"/>
      <circle cx="24" cy="27" r="2" fill="#222"/><circle cx="36" cy="27" r="2" fill="#222"/>
      <path d="M24 36 Q30 41 36 36" stroke="white" stroke-width="1.5" fill="none"/>
    </svg>`,
    happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="33" r="20" fill="${col}88"/>
      <circle cx="30" cy="28" r="15" fill="${col}"/>
      <path d="M20 26 Q24 21 28 26" fill="white"/><path d="M32 26 Q36 21 40 26" fill="white"/>
      <path d="M23 34 Q30 40 37 34" stroke="white" stroke-width="2" fill="none"/>
    </svg>`,
    sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="37" r="20" fill="${col}66"/>
      <circle cx="30" cy="32" r="15" fill="${col}aa"/>
      <path d="M22 30 Q26 33 30 30" fill="none" stroke="white" stroke-width="2"/>
      <path d="M30 30 Q34 33 38 30" fill="none" stroke="white" stroke-width="2"/>
      <path d="M25 38 Q30 35 35 38" stroke="white" stroke-width="1.5" fill="none"/>
    </svg>`,
  };

  const petArts = arts[petId] || fallback;
  return petArts[state] || petArts.idle;
}

// ─────────────────────────────────────────────────────────────────────────────
// ALL 16 CHARACTERS  (8 starter + 8 unlockable)
// ─────────────────────────────────────────────────────────────────────────────
const ALL_CHARACTERS = [
  // ── STARTERS (indices 0-7) ────────────────────────────────────────────────
  {
    name:"Sailor Moon", emoji:"🌙", unlockAt:0,
    bg:"linear-gradient(135deg,#fff0fb,#ffe6f7)",
    accent:"#e0379a", softBg:"#ffe0f4", border:"#f7b8e0",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="55" rx="34" ry="38" fill="#FFE84B"/>
      <path d="M28 65 Q5 90 15 120 Q22 135 30 120 Q28 95 35 78" fill="#FFE84B"/>
      <path d="M92 65 Q115 90 105 120 Q98 135 90 120 Q92 95 85 78" fill="#FFE84B"/>
      <circle cx="42" cy="30" r="12" fill="#FFE84B"/><circle cx="78" cy="30" r="12" fill="#FFE84B"/>
      <circle cx="42" cy="30" r="8" fill="#FFD700"/><circle cx="78" cy="30" r="8" fill="#FFD700"/>
      <ellipse cx="60" cy="62" rx="26" ry="28" fill="#FFE4CC"/>
      <ellipse cx="50" cy="60" rx="7" ry="8" fill="#4488FF"/><ellipse cx="70" cy="60" rx="7" ry="8" fill="#4488FF"/>
      <ellipse cx="50" cy="60" rx="4" ry="5" fill="#1144BB"/><ellipse cx="70" cy="60" rx="4" ry="5" fill="#1144BB"/>
      <circle cx="52" cy="57" r="2" fill="white"/><circle cx="72" cy="57" r="2" fill="white"/>
      <ellipse cx="44" cy="68" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <ellipse cx="76" cy="68" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <path d="M54 76 Q60 82 66 76" stroke="#FF88A0" stroke-width="1.5" fill="none"/>
      <path d="M34 88 L60 100 L86 88 L80 95 L60 108 L40 95 Z" fill="#1144BB"/>
      <path d="M34 88 L60 100 L86 88" stroke="white" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="115" rx="22" ry="18" fill="white"/>
      <path d="M50 100 Q60 106 70 100 Q65 112 60 108 Q55 112 50 100Z" fill="#FF3388"/>
      <path d="M56 47 Q60 42 64 47 Q60 50 56 47Z" fill="#FFD700"/>
    </svg>`,
  },
  {
    name:"Cardcaptor Sakura", emoji:"🃏", unlockAt:0,
    bg:"linear-gradient(135deg,#f0fff4,#e0ffe8)",
    accent:"#22aa55", softBg:"#d0f5e0", border:"#90dda8",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="30" ry="32" fill="#3DDC6A"/>
      <path d="M32 55 Q20 75 28 100 Q34 118 42 105 Q36 82 40 68" fill="#3DDC6A"/>
      <path d="M88 55 Q100 75 92 100 Q86 118 78 105 Q84 82 80 68" fill="#3DDC6A"/>
      <ellipse cx="60" cy="65" rx="25" ry="27" fill="#FFE4CC"/>
      <ellipse cx="50" cy="63" rx="7" ry="8" fill="#22CC66"/><ellipse cx="70" cy="63" rx="7" ry="8" fill="#22CC66"/>
      <ellipse cx="50" cy="63" rx="4" ry="5" fill="#116633"/><ellipse cx="70" cy="63" rx="4" ry="5" fill="#116633"/>
      <circle cx="52" cy="60" r="2" fill="white"/><circle cx="72" cy="60" r="2" fill="white"/>
      <ellipse cx="44" cy="70" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <ellipse cx="76" cy="70" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <path d="M54 78 Q60 84 66 78" stroke="#FF88A0" stroke-width="1.5" fill="none"/>
      <ellipse cx="60" cy="115" rx="22" ry="18" fill="white"/>
      <path d="M38 90 L60 98 L82 90 L82 105 L60 115 L38 105Z" fill="#FF6699"/>
      <path d="M38 90 L60 98 L82 90" stroke="white" stroke-width="2" fill="none"/>
      <line x1="85" y1="70" x2="100" y2="50" stroke="#FFD700" stroke-width="3"/>
      <circle cx="100" cy="44" r="6" fill="#FF99CC"/><circle cx="100" cy="44" r="3" fill="#FFD700"/>
    </svg>`,
  },
  {
    name:"Cure Star", emoji:"⭐", unlockAt:0,
    bg:"linear-gradient(135deg,#fff0f6,#ffe4f0)",
    accent:"#cc2277", softBg:"#ffd6ea", border:"#ffaad0",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="50" rx="36" ry="40" fill="#FF88BB"/>
      <path d="M25 55 Q8 80 18 115 Q25 130 34 115 Q30 88 38 72" fill="#FF88BB"/>
      <path d="M95 55 Q112 80 102 115 Q95 130 86 115 Q90 88 82 72" fill="#FF88BB"/>
      <ellipse cx="52" cy="35" rx="8" ry="12" fill="#FFAAD0" opacity="0.5"/>
      <ellipse cx="60" cy="65" rx="24" ry="26" fill="#FFE8D5"/>
      <ellipse cx="50" cy="62" rx="7" ry="9" fill="#FF66AA"/><ellipse cx="70" cy="62" rx="7" ry="9" fill="#FF66AA"/>
      <ellipse cx="50" cy="63" rx="4" ry="5.5" fill="#CC2277"/><ellipse cx="70" cy="63" rx="4" ry="5.5" fill="#CC2277"/>
      <circle cx="52" cy="59" r="2" fill="white"/><circle cx="72" cy="59" r="2" fill="white"/>
      <ellipse cx="43" cy="70" rx="7" ry="4" fill="#FFB0C8" opacity="0.7"/>
      <ellipse cx="77" cy="70" rx="7" ry="4" fill="#FFB0C8" opacity="0.7"/>
      <path d="M53 76 Q60 83 67 76" stroke="#FF7799" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M36 91 L60 100 L84 91 L84 108 L60 120 L36 108Z" fill="#FF66AA"/>
      <path d="M36 91 L60 100 L84 91" stroke="white" stroke-width="2.5" fill="none"/>
      <line x1="84" y1="85" x2="104" y2="62" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <polygon points="104,55 107,64 116,64 109,70 112,79 104,73 96,79 99,70 92,64 101,64" fill="#FFD700" transform="scale(0.6) translate(68,42)"/>
    </svg>`,
  },
  {
    name:"Luna the Moon Bunny", emoji:"🐰", unlockAt:0,
    bg:"linear-gradient(135deg,#f4f0ff,#ede4ff)",
    accent:"#7744cc", softBg:"#e4d8ff", border:"#c4aaee",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="44" cy="22" rx="8" ry="18" fill="white" transform="rotate(-10,44,22)"/>
      <ellipse cx="76" cy="22" rx="8" ry="18" fill="white" transform="rotate(10,76,22)"/>
      <ellipse cx="44" cy="22" rx="4" ry="13" fill="#FFB0D0" transform="rotate(-10,44,22)"/>
      <ellipse cx="76" cy="22" rx="4" ry="13" fill="#FFB0D0" transform="rotate(10,76,22)"/>
      <ellipse cx="60" cy="60" rx="30" ry="33" fill="#E8DDFF"/>
      <path d="M32 65 Q18 88 27 112 Q33 128 41 112 Q37 88 42 72" fill="#E8DDFF"/>
      <path d="M88 65 Q102 88 93 112 Q87 128 79 112 Q83 88 78 72" fill="#E8DDFF"/>
      <ellipse cx="60" cy="68" rx="24" ry="25" fill="#FFF0E8"/>
      <ellipse cx="50" cy="66" rx="7" ry="8" fill="#FF4466"/><ellipse cx="70" cy="66" rx="7" ry="8" fill="#FF4466"/>
      <ellipse cx="50" cy="67" rx="4" ry="5" fill="#AA1133"/><ellipse cx="70" cy="67" rx="4" ry="5" fill="#AA1133"/>
      <circle cx="52" cy="63" r="2" fill="white"/><circle cx="72" cy="63" r="2" fill="white"/>
      <circle cx="42" cy="73" r="2.5" fill="#FFB0C0" opacity="0.8"/><circle cx="46" cy="75" r="2.5" fill="#FFB0C0" opacity="0.8"/>
      <circle cx="74" cy="73" r="2.5" fill="#FFB0C0" opacity="0.8"/><circle cx="78" cy="75" r="2.5" fill="#FFB0C0" opacity="0.8"/>
      <path d="M54 78 Q60 85 66 78" stroke="#FF7799" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M38 92 L60 102 L82 92 L82 110 L60 122 L38 110Z" fill="#AADDFF"/>
      <path d="M38 92 L60 102 L82 92" stroke="white" stroke-width="2" fill="none"/>
    </svg>`,
  },
  {
    name:"Sailor Mercury", emoji:"💙", unlockAt:0,
    bg:"linear-gradient(135deg,#eef8ff,#ddf0ff)",
    accent:"#1177cc", softBg:"#d0ecff", border:"#88ccee",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="28" ry="32" fill="#88CCFF"/>
      <path d="M33 60 Q18 82 26 110 Q32 126 40 110 Q36 86 40 70" fill="#88CCFF"/>
      <path d="M87 60 Q102 82 94 110 Q88 126 80 110 Q84 86 80 70" fill="#88CCFF"/>
      <ellipse cx="60" cy="65" rx="24" ry="26" fill="#E8F4FF"/>
      <ellipse cx="50" cy="63" rx="7" ry="8" fill="#2299EE"/><ellipse cx="70" cy="63" rx="7" ry="8" fill="#2299EE"/>
      <ellipse cx="50" cy="64" rx="4" ry="5" fill="#0055AA"/><ellipse cx="70" cy="64" rx="4" ry="5" fill="#0055AA"/>
      <circle cx="52" cy="60" r="2" fill="white"/><circle cx="72" cy="60" r="2" fill="white"/>
      <ellipse cx="44" cy="70" rx="6" ry="3" fill="#AADDFF" opacity="0.7"/>
      <ellipse cx="76" cy="70" rx="6" ry="3" fill="#AADDFF" opacity="0.7"/>
      <path d="M54 76 Q60 82 66 76" stroke="#6699CC" stroke-width="1.5" fill="none"/>
      <path d="M36 90 L60 100 L84 90 L80 96 L60 108 L40 96 Z" fill="#1144BB"/>
      <path d="M36 90 L60 100 L84 90" stroke="white" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="115" rx="22" ry="18" fill="white"/>
      <path d="M50 100 Q60 106 70 100 Q65 112 60 108 Q55 112 50 100Z" fill="#2299EE"/>
    </svg>`,
  },
  {
    name:"Galaxy Mage", emoji:"🔮", unlockAt:0,
    bg:"linear-gradient(135deg,#f0eaff,#e8e0ff)",
    accent:"#7733dd", softBg:"#ddd0ff", border:"#bb99ee",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="gh" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#7744FF"/>
        <stop offset="50%" style="stop-color:#FF44BB"/>
        <stop offset="100%" style="stop-color:#44CCFF"/>
      </linearGradient></defs>
      <ellipse cx="60" cy="52" rx="34" ry="38" fill="url(#gh)"/>
      <path d="M26 60 Q10 85 22 115 Q28 132 38 116 Q32 90 38 73" fill="url(#gh)"/>
      <path d="M94 60 Q110 85 98 115 Q92 132 82 116 Q88 90 82 73" fill="url(#gh)"/>
      <circle cx="35" cy="40" r="2" fill="white" opacity="0.9"/><circle cx="82" cy="35" r="1.5" fill="white" opacity="0.9"/>
      <circle cx="60" cy="28" r="2" fill="white" opacity="0.9"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#FFF0E8"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#9955FF"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#9955FF"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#5522AA"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#5522AA"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="43" cy="71" rx="7" ry="3.5" fill="#FFB0D8" opacity="0.7"/>
      <ellipse cx="77" cy="71" rx="7" ry="3.5" fill="#FFB0D8" opacity="0.7"/>
      <path d="M53 78 Q60 85 67 78" stroke="#FF66AA" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M36 92 L60 102 L84 92 L84 110 L60 122 L36 110Z" fill="#7744FF"/>
      <path d="M36 92 L60 102 L84 92" stroke="#44CCFF" stroke-width="2" fill="none"/>
      <line x1="83" y1="88" x2="102" y2="65" stroke="#FFD700" stroke-width="3" stroke-linecap="round"/>
      <circle cx="104" cy="62" r="7" fill="#7744FF" opacity="0.8"/>
      <circle cx="104" cy="62" r="4" fill="#FF44BB"/>
      <circle cx="104" cy="62" r="2" fill="white"/>
    </svg>`,
  },
  {
    name:"Cure Bloom", emoji:"🌸", unlockAt:0,
    bg:"linear-gradient(135deg,#fff5f0,#ffe8e0)",
    accent:"#dd5522", softBg:"#ffd8c8", border:"#ffb8a0",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="50" rx="32" ry="36" fill="#FFB347"/>
      <path d="M28 58 Q12 80 22 112 Q28 128 36 112 Q32 88 38 70" fill="#FFB347"/>
      <path d="M92 58 Q108 80 98 112 Q92 128 84 112 Q88 88 82 70" fill="#FFB347"/>
      <circle cx="42" cy="28" r="9" fill="#FF8C00"/><circle cx="78" cy="28" r="9" fill="#FF8C00"/>
      <ellipse cx="60" cy="65" rx="25" ry="27" fill="#FFE4CC"/>
      <ellipse cx="50" cy="63" rx="7" ry="8" fill="#FF7722"/><ellipse cx="70" cy="63" rx="7" ry="8" fill="#FF7722"/>
      <ellipse cx="50" cy="64" rx="4" ry="5" fill="#AA3300"/><ellipse cx="70" cy="64" rx="4" ry="5" fill="#AA3300"/>
      <circle cx="52" cy="60" r="2" fill="white"/><circle cx="72" cy="60" r="2" fill="white"/>
      <ellipse cx="44" cy="71" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <ellipse cx="76" cy="71" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <path d="M54 77 Q60 83 66 77" stroke="#FF8877" stroke-width="1.5" fill="none"/>
      <path d="M36 90 L60 100 L84 90 L84 108 L60 120 L36 108Z" fill="#FF7722"/>
      <path d="M36 90 L60 100 L84 90" stroke="#FFD700" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="115" rx="22" ry="18" fill="#FFEECC"/>
    </svg>`,
  },
  {
    name:"Sailor Venus", emoji:"💛", unlockAt:0,
    bg:"linear-gradient(135deg,#fffbea,#fff5cc)",
    accent:"#cc8800", softBg:"#fff0b0", border:"#ffd966",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="55" rx="34" ry="38" fill="#FFD700"/>
      <path d="M28 65 Q5 90 15 120 Q22 135 30 120 Q28 95 35 78" fill="#FFD700"/>
      <path d="M92 65 Q115 90 105 120 Q98 135 90 120 Q92 95 85 78" fill="#FFD700"/>
      <ellipse cx="60" cy="62" rx="26" ry="28" fill="#FFE4CC"/>
      <ellipse cx="50" cy="60" rx="7" ry="8" fill="#2255DD"/><ellipse cx="70" cy="60" rx="7" ry="8" fill="#2255DD"/>
      <ellipse cx="50" cy="60" rx="4" ry="5" fill="#0033AA"/><ellipse cx="70" cy="60" rx="4" ry="5" fill="#0033AA"/>
      <circle cx="52" cy="57" r="2" fill="white"/><circle cx="72" cy="57" r="2" fill="white"/>
      <ellipse cx="44" cy="68" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <ellipse cx="76" cy="68" rx="6" ry="3" fill="#FFB0B0" opacity="0.6"/>
      <path d="M54 76 Q60 82 66 76" stroke="#FF88A0" stroke-width="1.5" fill="none"/>
      <path d="M34 88 L60 100 L86 88 L80 95 L60 108 L40 95 Z" fill="#0033AA"/>
      <path d="M34 88 L60 100 L86 88" stroke="white" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="115" rx="22" ry="18" fill="white"/>
      <path d="M50 100 Q60 106 70 100 Q65 112 60 108 Q55 112 50 100Z" fill="#FF8800"/>
      <path d="M44 52 Q60 44 76 52" stroke="#FF8800" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`,
  },

  // ── UNLOCKABLES (indices 8-15) ────────────────────────────────────────────
  {
    name:"Cure Black", emoji:"🖤", unlockAt:25,
    unlockMsg:"Cure Black has joined your team! Dark power, bright heart! 🖤",
    bg:"linear-gradient(135deg,#1a1a2e,#16213e)",
    accent:"#cc44ff", softBg:"#2d2d4e", border:"#7744aa",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="30" ry="34" fill="#222244"/>
      <path d="M30 60 Q15 82 25 112 Q32 130 40 112 Q36 88 40 70" fill="#222244"/>
      <path d="M90 60 Q105 82 95 112 Q88 130 80 112 Q84 88 80 70" fill="#222244"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#FFE8D8"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#cc44ff"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#cc44ff"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#7700bb"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#7700bb"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#FFB0D8" opacity="0.6"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#FFB0D8" opacity="0.6"/>
      <path d="M54 78 Q60 84 66 78" stroke="#cc44ff" stroke-width="1.5" fill="none"/>
      <path d="M36 91 L60 101 L84 91 L84 109 L60 121 L36 109Z" fill="#1a0033"/>
      <path d="M36 91 L60 101 L84 91" stroke="#cc44ff" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="#2a0044"/>
      <circle cx="55" cy="42" r="4" fill="#cc44ff" opacity="0.8"/>
      <circle cx="65" cy="40" r="3" fill="#cc44ff" opacity="0.6"/>
    </svg>`,
  },
  {
    name:"Sailor Mars", emoji:"🔥", unlockAt:60,
    unlockMsg:"Sailor Mars blazes onto the scene! Fire Soul! 🔥",
    bg:"linear-gradient(135deg,#fff0ea,#ffe0d0)",
    accent:"#cc2200", softBg:"#ffd0c0", border:"#ffaa88",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="28" ry="32" fill="#CC2200"/>
      <path d="M33 60 Q18 82 26 110 Q32 126 40 110 Q36 86 40 70" fill="#CC2200"/>
      <path d="M87 60 Q102 82 94 110 Q88 126 80 110 Q84 86 80 70" fill="#CC2200"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#FFE8D0"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#882200"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#882200"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#440000"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#440000"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#FFB0A0" opacity="0.7"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#FFB0A0" opacity="0.7"/>
      <path d="M54 78 Q60 84 66 78" stroke="#FF4400" stroke-width="1.5" fill="none"/>
      <path d="M36 91 L60 101 L84 91 L80 97 L60 109 L40 97Z" fill="#880000"/>
      <path d="M36 91 L60 101 L84 91" stroke="#FF6600" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="white"/>
      <path d="M50 101 Q60 107 70 101 Q65 113 60 109 Q55 113 50 101Z" fill="#FF4400"/>
      <path d="M52 48 Q60 38 68 48 Q64 54 60 52 Q56 54 52 48Z" fill="#FF6600"/>
    </svg>`,
  },
  {
    name:"Cure White", emoji:"🤍", unlockAt:110,
    unlockMsg:"Cure White's pure power is yours! Marble Screw! 🤍",
    bg:"linear-gradient(135deg,#f8f8ff,#f0f0ff)",
    accent:"#8888cc", softBg:"#e8e8ff", border:"#ccccee",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="30" ry="34" fill="#EEEEFF"/>
      <path d="M30 60 Q15 82 25 112 Q32 130 40 112 Q36 88 40 70" fill="#EEEEFF"/>
      <path d="M90 60 Q105 82 95 112 Q88 130 80 112 Q84 88 80 70" fill="#EEEEFF"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#FFF8F0"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#8888cc"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#8888cc"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#4444aa"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#4444aa"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#FFD0E8" opacity="0.6"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#FFD0E8" opacity="0.6"/>
      <path d="M54 78 Q60 84 66 78" stroke="#aaaadd" stroke-width="1.5" fill="none"/>
      <path d="M36 91 L60 101 L84 91 L84 109 L60 121 L36 109Z" fill="#DDDDFF"/>
      <path d="M36 91 L60 101 L84 91" stroke="white" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="white"/>
      <circle cx="60" cy="44" r="6" fill="white" opacity="0.9"/>
      <circle cx="60" cy="44" r="3" fill="#8888cc"/>
    </svg>`,
  },
  {
    name:"Sailor Jupiter", emoji:"⚡", unlockAt:175,
    unlockMsg:"Sailor Jupiter's thunder joins you! Supreme Thunder! ⚡",
    bg:"linear-gradient(135deg,#f0fff0,#e0ffe0)",
    accent:"#227722", softBg:"#c8f0c8", border:"#88cc88",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="28" ry="32" fill="#558B2F"/>
      <path d="M33 60 Q18 82 26 110 Q32 126 40 110 Q36 86 40 70" fill="#558B2F"/>
      <path d="M87 60 Q102 82 94 110 Q88 126 80 110 Q84 86 80 70" fill="#558B2F"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#FFE8CC"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#338833"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#338833"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#115511"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#115511"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#FFB0A0" opacity="0.7"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#FFB0A0" opacity="0.7"/>
      <path d="M54 78 Q60 84 66 78" stroke="#55aa55" stroke-width="1.5" fill="none"/>
      <path d="M36 91 L60 101 L84 91 L80 97 L60 109 L40 97Z" fill="#2E7D32"/>
      <path d="M36 91 L60 101 L84 91" stroke="#CCFF00" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="white"/>
      <path d="M57 44 L61 52 L65 44 L62 50 L66 44Z" fill="#FFFF00" opacity="0.9"/>
    </svg>`,
  },
  {
    name:"Madoka", emoji:"🎀", unlockAt:250,
    unlockMsg:"Madoka's gentle magic is with you! I'll become a magical girl! 🎀",
    bg:"linear-gradient(135deg,#fff0f8,#ffe8f4)",
    accent:"#ff66aa", softBg:"#ffd8ee", border:"#ffaacc",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="50" rx="32" ry="36" fill="#FFB6C1"/>
      <path d="M28 58 Q12 80 22 112 Q28 128 36 112 Q32 88 38 70" fill="#FFB6C1"/>
      <path d="M92 58 Q108 80 98 112 Q92 128 84 112 Q88 88 82 70" fill="#FFB6C1"/>
      <circle cx="42" cy="26" r="10" fill="#FF88AA"/><circle cx="78" cy="26" r="10" fill="#FF88AA"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#FFF0E8"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#FF66AA"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#FF66AA"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#CC1177"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#CC1177"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#FFB0C8" opacity="0.8"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#FFB0C8" opacity="0.8"/>
      <path d="M54 78 Q60 85 66 78" stroke="#FF66AA" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M36 91 L60 101 L84 91 L84 109 L60 121 L36 109Z" fill="#FF88BB"/>
      <path d="M36 91 L60 101 L84 91" stroke="white" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="white"/>
      <path d="M48 100 Q60 107 72 100 Q67 113 60 109 Q53 113 48 100Z" fill="#FF66AA"/>
    </svg>`,
  },
  {
    name:"Cure Moonlight", emoji:"🌛", unlockAt:340,
    unlockMsg:"Cure Moonlight's silver power awakens! Fleur de Lumière! 🌛",
    bg:"linear-gradient(135deg,#f0f0ff,#e8e8f8)",
    accent:"#556699", softBg:"#d8d8f0", border:"#aaaacc",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="30" ry="34" fill="#778899"/>
      <path d="M30 60 Q15 82 25 112 Q32 130 40 112 Q36 88 40 70" fill="#778899"/>
      <path d="M90 60 Q105 82 95 112 Q88 130 80 112 Q84 88 80 70" fill="#778899"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#F0F0FF"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#9999BB"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#9999BB"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#445577"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#445577"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#CCCCEE" opacity="0.7"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#CCCCEE" opacity="0.7"/>
      <path d="M54 78 Q60 84 66 78" stroke="#aaaacc" stroke-width="1.5" fill="none"/>
      <path d="M36 91 L60 101 L84 91 L84 109 L60 121 L36 109Z" fill="#445566"/>
      <path d="M36 91 L60 101 L84 91" stroke="#AACCFF" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="#DDDDFF"/>
      <path d="M55 42 Q60 36 65 42 Q62 47 60 45 Q58 47 55 42Z" fill="#CCDDFF"/>
    </svg>`,
  },
  {
    name:"Homura", emoji:"⏳", unlockAt:450,
    unlockMsg:"Homura steps through time to join you! Just this once... ⏳",
    bg:"linear-gradient(135deg,#1a1a2e,#0f0f1e)",
    accent:"#aa44cc", softBg:"#2a1a3e", border:"#664488",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="52" rx="28" ry="32" fill="#1a0033"/>
      <path d="M33 60 Q18 82 26 110 Q32 126 40 110 Q36 86 40 70" fill="#1a0033"/>
      <path d="M87 60 Q102 82 94 110 Q88 126 80 110 Q84 86 80 70" fill="#1a0033"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#FFE8F0"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#aa44cc"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#aa44cc"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#550077"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#550077"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#DDC0EE" opacity="0.6"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#DDC0EE" opacity="0.6"/>
      <path d="M54 78 Q60 84 66 78" stroke="#aa44cc" stroke-width="1.5" fill="none"/>
      <path d="M36 91 L60 101 L84 91 L84 109 L60 121 L36 109Z" fill="#0a0022"/>
      <path d="M36 91 L60 101 L84 91" stroke="#aa44cc" stroke-width="2" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="#0a0022"/>
      <circle cx="60" cy="116" r="8" fill="#aa44cc" opacity="0.3"/>
      <circle cx="60" cy="116" r="4" fill="#aa44cc" opacity="0.6"/>
    </svg>`,
  },
  {
    name:"Sailor Saturn", emoji:"🪐", unlockAt:575,
    unlockMsg:"SAILOR SATURN! The ultimate guardian awakens! Silence Glaive! 🪐",
    bg:"linear-gradient(135deg,#0d0d1a,#1a0d2e)",
    accent:"#9933cc", softBg:"#1a0d33", border:"#550077",
    art:`<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sat" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#220033"/>
        <stop offset="100%" style="stop-color:#550066"/>
      </linearGradient></defs>
      <ellipse cx="60" cy="52" rx="28" ry="32" fill="url(#sat)"/>
      <path d="M33 60 Q18 82 26 110 Q32 126 40 110 Q36 86 40 70" fill="url(#sat)"/>
      <path d="M87 60 Q102 82 94 110 Q88 126 80 110 Q84 86 80 70" fill="url(#sat)"/>
      <ellipse cx="60" cy="66" rx="25" ry="27" fill="#F8E8FF"/>
      <ellipse cx="50" cy="64" rx="7" ry="8" fill="#9933cc"/><ellipse cx="70" cy="64" rx="7" ry="8" fill="#9933cc"/>
      <ellipse cx="50" cy="65" rx="4" ry="5" fill="#550077"/><ellipse cx="70" cy="65" rx="4" ry="5" fill="#550077"/>
      <circle cx="52" cy="61" r="2" fill="white"/><circle cx="72" cy="61" r="2" fill="white"/>
      <ellipse cx="44" cy="72" rx="6" ry="3" fill="#DDB0EE" opacity="0.6"/>
      <ellipse cx="76" cy="72" rx="6" ry="3" fill="#DDB0EE" opacity="0.6"/>
      <path d="M54 78 Q60 84 66 78" stroke="#9933cc" stroke-width="2" fill="none"/>
      <path d="M36 91 L60 101 L84 91 L84 109 L60 121 L36 109Z" fill="#110022"/>
      <path d="M36 91 L60 101 L84 91" stroke="#9933cc" stroke-width="2.5" fill="none"/>
      <ellipse cx="60" cy="116" rx="22" ry="18" fill="#110022"/>
      <line x1="90" y1="30" x2="100" y2="15" stroke="#9933cc" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="95" cy="22" rx="12" ry="4" fill="none" stroke="#9933cc" stroke-width="2" transform="rotate(-30,95,22)"/>
      <circle cx="35" cy="35" r="2" fill="#9933cc" opacity="0.8"/>
      <circle cx="82" cy="28" r="1.5" fill="#cc66ff" opacity="0.9"/>
      <circle cx="25" cy="55" r="1" fill="#9933cc" opacity="0.7"/>
    </svg>`,
  },
];

const STARTER_CHARS = ALL_CHARACTERS.filter(c => c.unlockAt === 0);
const UNLOCK_CHARS  = ALL_CHARACTERS.filter(c => c.unlockAt > 0);

// ─────────────────────────────────────────────────────────────────────────────
// DIFFICULTY CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const DIFF_CONFIG = {
  easy:   { label:"Easy",   emoji:"🌱", nums:[2,3,4,5,6,7,8,9,10,12,15,16,18,20], maxProduct:30, maxSum:30 },
  medium: { label:"Medium", emoji:"⭐", nums:[3,4,5,6,7,8,9,12,15,16,18,20,24,25], maxProduct:63, maxSum:60 },
  hard:   { label:"Hard",   emoji:"🔥", nums:[4,5,6,7,8,9,12,15,16,18,20,24,25,27,32,36], maxProduct:90, maxSum:99 },
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERATE PROBLEMS VIA CLAUDE API
// ─────────────────────────────────────────────────────────────────────────────
async function generateProblems(count, difficulty, weakSpots, unlockedCount) {
  const available = ALL_CHARACTERS.slice(0, unlockedCount);
  const charNames  = available.map(c => c.name).join(", ");
  const diff       = DIFF_CONFIG[difficulty];

  const weakDesc = Object.entries(weakSpots)
    .filter(([,v]) => v > 0)
    .sort((a,b) => b[1]-a[1])
    .map(([k,v]) => `${k}(missed ${v}x)`)
    .join(", ");

  const systemPrompt = `You are a 3rd grade math teacher creating fun two-part word problems with a magical girl theme.

DIFFICULTY: ${diff.label}
- Use whole numbers only, no decimals ever
- Numbers to use: ${diff.nums.join(", ")}
- Max product/quotient: ${diff.maxProduct}, Max sum/difference: ${diff.maxSum}
- Division must divide EVENLY (no remainders) OR if remainder problem: Part A = "how many full groups?" Part B = "how many left over?" — never both in one part

WEAK SPOTS TO EMPHASIZE: ${weakDesc || "none yet — mix all operations evenly"}

CHARACTERS AVAILABLE (use index within this list): ${charNames}

RULES:
- Each part has exactly ONE numerical answer
- Stories are magical, imaginative, fun for a 3rd grade girl
- Vary operations: +, -, ×, ÷, some remainders
- Part B is independently solvable (doesn't require Part A's answer)
- No decimals, no fractions, no negative answers

Return ONLY valid JSON array, no markdown:
[{"characterIndex":0,"story":"...","partA":{"question":"...","equation":"a × b = c","hint":"...","answer":12,"explanation":"..."},"partB":{"question":"...","equation":"a - b = c","hint":"...","answer":5,"explanation":"..."}}]`;

  const response = await fetch("/.netlify/functions/generate", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      system: systemPrompt,
      user: `Generate ${count} unique magical girl math problems. Spread across all ${available.length} available characters. Make every story different and delightful.`,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Proxy error:", JSON.stringify(data));
    throw new Error(data.error || "Request failed: "+response.status);
  }
  const clean = data.result.replace(/```json|```/g,"").trim();
  return JSON.parse(clean);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFETTI
// ─────────────────────────────────────────────────────────────────────────────
function Confetti() {
  const pieces = Array.from({length:60},(_,i)=>({
    id:i,
    x:Math.random()*100,
    color:["#FF66AA","#FFD700","#AA88FF","#44CCFF","#FF88CC","#88FF88"][i%6],
    size:6+Math.random()*8,
    delay:Math.random()*0.8,
    dur:2+Math.random()*1.5,
    spin:Math.random()*720,
  }));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:999,overflow:"hidden"}}>
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"-20px",
          width:p.size, height:p.size, background:p.color, borderRadius:"2px",
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
        }}/>
      ))}
      <style>{`@keyframes confettiFall{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(110vh) rotate(${360}deg);opacity:0}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPARKLES (background)
// ─────────────────────────────────────────────────────────────────────────────
function Sparkles({accent, sparkleId="sparkle_default"}) {
  const cfg = SPARKLE_CONFIGS[sparkleId] || SPARKLE_CONFIGS.sparkle_default;
  const colors = cfg.colors;
  const sparks = cfg.chars;
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
      {Array.from({length:16}).map((_,i)=>(
        <div key={i} style={{
          position:"absolute",
          left:`${(i*61+17)%100}%`,top:`${(i*47+11)%100}%`,
          fontSize:`${9+(i%4)*4}px`,color:colors[i%colors.length],
          opacity:0.12+(i%4)*0.04,
          animation:`float${i%3} ${4+i%5}s ease-in-out infinite`,
          animationDelay:`${i*0.35}s`,
        }}>{sparks[i%sparks.length]}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UNLOCK POPUP
// ─────────────────────────────────────────────────────────────────────────────
function UnlockPopup({char, onClose}) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:500,
      display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{
        background:`linear-gradient(135deg,${char.accent}dd,${char.accent}88)`,
        borderRadius:28,padding:"32px 28px",maxWidth:360,width:"100%",
        textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,0.4)",
        border:"3px solid white",animation:"popIn 0.5s ease",
      }}>
        <div style={{fontSize:50,marginBottom:8}}>🎉✨🎉</div>
        <div style={{fontSize:14,color:"white",opacity:0.85,letterSpacing:2,
          textTransform:"uppercase",marginBottom:8}}>New Character Unlocked!</div>
        <div style={{width:110,height:130,margin:"0 auto 12px",
          filter:"drop-shadow(0 4px 20px rgba(0,0,0,0.4))"}}>
          <div dangerouslySetInnerHTML={{__html:char.art}}/>
        </div>
        <div style={{fontSize:22,fontWeight:900,color:"white",marginBottom:8}}>{char.name} {char.emoji}</div>
        <div style={{fontSize:14,color:"white",opacity:0.9,lineHeight:1.6,marginBottom:20}}>
          {char.unlockMsg}
        </div>
        <button onClick={onClose} style={{
          padding:"12px 32px",background:"white",border:"none",borderRadius:16,
          fontSize:16,fontWeight:800,color:char.accent,cursor:"pointer",
        }}>Let's go! ✨</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANSWER INPUT
// ─────────────────────────────────────────────────────────────────────────────
function AnswerInput({value,onChange,correct,submitted}) {
  let border="2.5px solid #ddd0ee",bg="white",shadow="none";
  if(submitted&&correct===true) {border="2.5px solid #44cc77";bg="#efffee";shadow="0 0 12px #44cc7744";}
  if(submitted&&correct===false){border="2.5px solid #ff4466";bg="#fff0f2";shadow="0 0 12px #ff446644";}
  return (
    <input type="number" value={value} onChange={e=>onChange(e.target.value)}
      disabled={submitted&&correct===true} placeholder="?"
      style={{width:80,padding:"9px 10px",fontSize:24,fontWeight:800,
        border,borderRadius:14,background:bg,color:"#330044",outline:"none",
        textAlign:"center",fontFamily:"'Georgia',serif",transition:"all 0.2s",boxShadow:shadow}}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PART SECTION
// ─────────────────────────────────────────────────────────────────────────────
function PartSection({label,accent,softBg,border,question,equation,hint,
  showHint,onToggleHint,answer,onAnswer,submitted,correct,
  onCheck,onRetry,tries,explanation,correctAnswer,difficulty}) {
  const canCheck = answer!==""&&!isNaN(parseInt(answer));
  return (
    <div>
      <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
        <span style={{background:accent,color:"white",fontWeight:800,fontSize:12,
          padding:"4px 14px",borderRadius:20,letterSpacing:1,whiteSpace:"nowrap",marginTop:2}}>{label}</span>
        <span style={{fontSize:15,color:"#330044",fontWeight:700,lineHeight:1.45}}>{question}</span>
      </div>
      {/* Equation: always show on easy (answer stripped), show after correct on medium/hard */}
      {(difficulty==="easy" || correct===true) && (()=>{
        const displayEq = difficulty==="easy" && correct!==true
          ? equation.replace(/=\s*[\d]+/,"= ___").replace(/=\s*[\d]+\s*r\s*[\d]+/,"= ___")
          : equation;
        return (
          <div style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#9977BB",marginBottom:4,letterSpacing:2,textTransform:"uppercase"}}>
              {correct===true?"✅ Equation:":"Equation:"}
            </div>
            <div style={{background:softBg,border:`2px dashed ${border}`,borderRadius:12,
              padding:"9px 16px",display:"inline-block",
              fontFamily:"'Courier New',monospace",fontSize:19,color:"#440066",fontWeight:700}}>{displayEq}</div>
          </div>
        );
      })()}
      <button onClick={onToggleHint} style={{background:"none",border:`1.5px dashed ${accent}88`,
        borderRadius:8,color:accent,fontSize:13,padding:"4px 14px",
        cursor:"pointer",marginBottom:showHint?8:0,fontFamily:"Georgia,serif"}}>
        {showHint?"Hide hint 🙈":"Need a hint? 💡"}
      </button>
      {showHint&&(
        <div style={{background:"#f8f4ff",border:`1px solid ${accent}44`,borderRadius:10,
          padding:"9px 14px",fontSize:14,color:"#442266",marginTop:6,marginBottom:8,lineHeight:1.5}}>
          💡 {hint}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,flexWrap:"wrap"}}>
        <span style={{fontSize:15,color:"#550066",fontWeight:600}}>Answer:</span>
        <AnswerInput value={answer} onChange={onAnswer} correct={correct} submitted={submitted}/>
        {!submitted&&(
          <button onClick={onCheck} disabled={!canCheck} style={{
            padding:"10px 22px",
            background:canCheck?`linear-gradient(135deg,${accent},${accent}bb)`:"#ccc",
            border:"none",borderRadius:12,color:"white",fontWeight:800,fontSize:15,
            cursor:canCheck?"pointer":"not-allowed",fontFamily:"Georgia,serif",
            boxShadow:canCheck?`0 4px 14px ${accent}55`:"none",transition:"all 0.2s"}}>Check ✓</button>
        )}
        {submitted&&correct===false&&tries<2&&(
          <button onClick={onRetry} style={{padding:"10px 16px",
            background:"linear-gradient(135deg,#ff6699,#ff3366)",border:"none",borderRadius:12,
            color:"white",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"Georgia,serif",
            boxShadow:"0 4px 12px #ff336655"}}>Try again 🔄</button>
        )}
      </div>
      {submitted&&correct===true&&(
        <div style={{marginTop:10,color:"#228833",fontWeight:800,fontSize:16,animation:"popIn 0.3s ease"}}>
          ✅ Correct! Magical! ⭐
        </div>
      )}
      {submitted&&correct===false&&(
        <div style={{marginTop:10}}>
          <div style={{color:"#cc1144",fontWeight:800,fontSize:15}}>
            {tries<2?"❌ Not quite — try again!":`❌ The answer is ${correctAnswer}.`}
          </div>
          {tries>=2&&(
            <div style={{marginTop:8,background:"#fff4e8",border:"1.5px solid #ffbb66",
              borderRadius:10,padding:"9px 14px",fontSize:13,color:"#663300",lineHeight:1.5}}>
              📖 {explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// START SCREEN
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// PET COMPANION
// ─────────────────────────────────────────────────────────────────────────────
function PetCompanion({petId, state, accentColor}) {
  const art = getPetArt(petId, state, accentColor);
  const anim = state==="happy" ? "petHappy 0.5s ease 3" :
               state==="sad"   ? "petSad 0.6s ease 2" :
               "petIdle 3s ease-in-out infinite";
  return (
    <div style={{
      position:"absolute", bottom:20, right:16, zIndex:50,
      width:64, height:64,
      filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.2))",
      animation:anim,
      transformOrigin:"bottom center",
      cursor:"default",
    }}>
      <div dangerouslySetInnerHTML={{__html:art}}/>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CRYSTAL SHOP
// ─────────────────────────────────────────────────────────────────────────────
function CrystalShop({appData, updateData, onClose}) {
  const [tab, setTab] = useState("pets");
  const {crystals, ownedItems, activePet, activeBg, activeSparkle, activeBorder} = appData;

  const tabs = [
    {id:"pets",        label:"Pets",       emoji:"🐾"},
    {id:"backgrounds", label:"Backgrounds",emoji:"🎨"},
    {id:"sparkles",    label:"Sparkles",   emoji:"✨"},
    {id:"borders",     label:"Borders",    emoji:"💎"},
  ];

  const buy = (item) => {
    if(ownedItems.includes(item.id)) return;
    if(crystals < item.cost) return;
    updateData(prev=>({
      crystals: prev.crystals - item.cost,
      ownedItems: [...prev.ownedItems, item.id],
    }));
  };

  const equip = (item, category) => {
    const field = category==="pets"?"activePet":category==="backgrounds"?"activeBg":
                  category==="sparkles"?"activeSparkle":"activeBorder";
    updateData({[field]: item.id});
  };

  const items = SHOP_ITEMS[tab] || [];

  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#0d0d1a,#1a0d2e)",
      zIndex:400,overflowY:"auto",fontFamily:"Georgia,serif"}}>

      {/* Header */}
      <div style={{position:"sticky",top:0,background:"rgba(13,13,26,0.95)",
        backdropFilter:"blur(8px)",padding:"14px 18px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        borderBottom:"1px solid #441166",zIndex:1}}>
        <div>
          <div style={{fontSize:20,fontWeight:900,color:"white"}}>💎 Crystal Shop</div>
          <div style={{fontSize:13,color:"#cc88ff",marginTop:2,fontWeight:700}}>
            💎 {crystals} crystals
          </div>
        </div>
        <button onClick={onClose} style={{background:"#331155",border:"1.5px solid #7733dd",
          borderRadius:12,color:"white",fontSize:14,fontWeight:700,
          padding:"8px 16px",cursor:"pointer"}}>← Back</button>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,padding:"14px 16px 0",maxWidth:600,margin:"0 auto"}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1,padding:"10px 4px",
            background:tab===t.id?"linear-gradient(135deg,#7733dd,#e0379a)":"#1a0d33",
            border:`1.5px solid ${tab===t.id?"#9955ff":"#441166"}`,
            borderRadius:12,color:"white",fontSize:11,fontWeight:700,
            cursor:"pointer",fontFamily:"Georgia,serif",lineHeight:1.4,
          }}>
            <div style={{fontSize:18}}>{t.emoji}</div>
            <div>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Items grid */}
      <div style={{padding:"16px",display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",
        gap:12,maxWidth:600,margin:"0 auto"}}>
        {items.map(item=>{
          const owned = ownedItems.includes(item.id);
          const active = activePet===item.id || activeBg===item.id ||
                         activeSparkle===item.id || activeBorder===item.id;
          const canAfford = crystals >= item.cost;
          const isFree = item.cost === 0;

          return (
            <div key={item.id} style={{
              background: owned ? "#1a0d3e" : "#120820",
              border:`2px solid ${active?"#FFD700":owned?"#7733dd":"#331144"}`,
              borderRadius:18,padding:"16px 12px",textAlign:"center",
              position:"relative",transition:"all 0.2s",
            }}>
              {active&&(
                <div style={{position:"absolute",top:-8,left:"50%",transform:"translateX(-50%)",
                  background:"#FFD700",color:"#330044",fontSize:9,fontWeight:900,
                  padding:"2px 10px",borderRadius:10,whiteSpace:"nowrap"}}>✓ ACTIVE</div>
              )}

              {/* Pet preview, SVG scene, or emoji fallback */}
              {tab==="pets" ? (
                <div style={{width:64,height:72,margin:"0 auto 6px"}}>
                  <div dangerouslySetInnerHTML={{__html:getPetArt(item.id,"idle","#9933cc")}}/>
                </div>
              ) : SHOP_PREVIEWS[item.id] ? (
                <div style={{width:"100%",height:48,margin:"0 auto 8px",borderRadius:8,
                  overflow:"hidden",border:"1px solid #441166",opacity:owned?1:0.72}}>
                  <div dangerouslySetInnerHTML={{__html:SHOP_PREVIEWS[item.id]}}
                    style={{width:"100%",height:"100%",display:"block"}}/>
                </div>
              ) : (
                <div style={{fontSize:32,marginBottom:8}}>{item.emoji||"✦"}</div>
              )}

              <div style={{fontSize:12,fontWeight:800,color:"white",marginBottom:4,lineHeight:1.3}}>
                {item.name}
              </div>
              <div style={{fontSize:10,color:"#9977BB",marginBottom:10,lineHeight:1.4,minHeight:28}}>
                {item.desc}
              </div>

              {owned ? (
                <button onClick={()=>equip(item,tab)} style={{
                  width:"100%",padding:"7px 0",
                  background:active?"#332200":"linear-gradient(135deg,#7733dd,#e0379a)",
                  border:"none",borderRadius:10,color:"white",fontSize:12,
                  fontWeight:800,cursor:active?"default":"pointer",fontFamily:"Georgia,serif",
                }}>
                  {active ? "✓ Equipped" : "Equip"}
                </button>
              ) : (
                <button onClick={()=>buy(item)} disabled={!canAfford} style={{
                  width:"100%",padding:"7px 0",
                  background:canAfford?"linear-gradient(135deg,#7733dd,#e0379a)":"#221133",
                  border:`1.5px solid ${canAfford?"#9955ff":"#441166"}`,
                  borderRadius:10,color:canAfford?"white":"#664488",
                  fontSize:12,fontWeight:800,
                  cursor:canAfford?"pointer":"not-allowed",fontFamily:"Georgia,serif",
                }}>
                  {isFree ? "Free! Get it" : `💎 ${item.cost}`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      <div style={{height:30}}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHARACTER GALLERY
// ─────────────────────────────────────────────────────────────────────────────
function CharacterGallery({unlockedCount, totalStars, onClose}) {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{position:"fixed",inset:0,background:"linear-gradient(135deg,#0d0d1a,#1a0d2e)",
      zIndex:400,overflowY:"auto",fontFamily:"Georgia,serif"}}>

      {/* Header */}
      <div style={{position:"sticky",top:0,background:"rgba(13,13,26,0.95)",
        backdropFilter:"blur(8px)",padding:"16px 20px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        borderBottom:"1px solid #441166",zIndex:1}}>
        <div>
          <div style={{fontSize:20,fontWeight:900,color:"white"}}>✨ Character Gallery</div>
          <div style={{fontSize:12,color:"#9977BB",marginTop:2}}>
            {unlockedCount} / {ALL_CHARACTERS.length} unlocked · 🌟 {totalStars} total stars
          </div>
        </div>
        <button onClick={onClose} style={{background:"#331155",border:"1.5px solid #7733dd",
          borderRadius:12,color:"white",fontSize:14,fontWeight:700,
          padding:"8px 16px",cursor:"pointer"}}>← Back</button>
      </div>

      {/* Grid */}
      <div style={{padding:"20px 16px",display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:14,maxWidth:600,margin:"0 auto"}}>
        {ALL_CHARACTERS.map((char, i) => {
          const unlocked = i < unlockedCount;
          return (
            <div key={i} onClick={()=>unlocked&&setSelected(char)}
              style={{
                background:unlocked?`linear-gradient(135deg,${char.accent}33,${char.accent}11)`:"#1a1a2e",
                border:`2px solid ${unlocked?char.accent:"#332244"}`,
                borderRadius:20,padding:"16px 12px",textAlign:"center",
                cursor:unlocked?"pointer":"default",
                transition:"transform 0.2s,box-shadow 0.2s",
                position:"relative",overflow:"hidden",
              }}
              onMouseEnter={e=>{if(unlocked){e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow=`0 8px 24px ${char.accent}44`;}}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="none";}}>

              {unlocked ? (
                <>
                  {/* Character art */}
                  <div style={{width:80,height:94,margin:"0 auto 8px",
                    filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.4))"}}>
                    <div dangerouslySetInnerHTML={{__html:char.art}}/>
                  </div>
                  <div style={{fontSize:18,marginBottom:4}}>{char.emoji}</div>
                  <div style={{fontSize:12,fontWeight:800,color:"white",lineHeight:1.3}}>{char.name}</div>
                  {char.unlockAt>0&&(
                    <div style={{fontSize:10,color:`${char.accent}`,marginTop:4,fontWeight:600}}>
                      Unlocked at {char.unlockAt} ⭐
                    </div>
                  )}
                  {char.unlockAt===0&&(
                    <div style={{fontSize:10,color:"#9977BB",marginTop:4}}>Starter</div>
                  )}
                </>
              ) : (
                <>
                  {/* Silhouette */}
                  <div style={{width:80,height:94,margin:"0 auto 8px",
                    filter:"brightness(0) opacity(0.15)"}}>
                    <div dangerouslySetInnerHTML={{__html:char.art}}/>
                  </div>
                  <div style={{fontSize:24,marginBottom:4}}>🔒</div>
                  <div style={{fontSize:11,fontWeight:700,color:"#664488"}}>???</div>
                  <div style={{fontSize:10,color:"#553366",marginTop:4}}>
                    Unlock at {char.unlockAt} ⭐
                  </div>
                  <div style={{fontSize:10,color:"#442255",marginTop:2}}>
                    {char.unlockAt-totalStars} more to go!
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Character profile modal */}
      {selected&&(
        <div onClick={()=>setSelected(null)} style={{
          position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",
          zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div onClick={e=>e.stopPropagation()} style={{
            background:`linear-gradient(135deg,${selected.accent}dd,${selected.accent}88)`,
            borderRadius:28,padding:"28px 24px",maxWidth:320,width:"100%",
            textAlign:"center",border:"3px solid white",animation:"popIn 0.3s ease",
            boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}}>
            <div style={{width:100,height:118,margin:"0 auto 12px",
              filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.4))"}}>
              <div dangerouslySetInnerHTML={{__html:selected.art}}/>
            </div>
            <div style={{fontSize:28,marginBottom:6}}>{selected.emoji}</div>
            <div style={{fontSize:22,fontWeight:900,color:"white",marginBottom:6}}>{selected.name}</div>
            {selected.unlockMsg&&(
              <div style={{fontSize:13,color:"white",opacity:0.9,lineHeight:1.6,marginBottom:16}}>
                {selected.unlockMsg}
              </div>
            )}
            {selected.unlockAt===0&&(
              <div style={{fontSize:13,color:"white",opacity:0.85,marginBottom:16}}>
                A founding magical girl — here from the very beginning! ✨
              </div>
            )}
            <button onClick={()=>setSelected(null)} style={{
              padding:"10px 28px",background:"white",border:"none",borderRadius:14,
              fontSize:15,fontWeight:800,color:selected.accent,cursor:"pointer"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE SPLASH
// ─────────────────────────────────────────────────────────────────────────────
function UpdateSplash({onDismiss, onViewHistory}) {
  const latest = CHANGELOG[0];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(10,0,30,0.88)",
      zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",
      padding:20,fontFamily:"Georgia,serif"}}>
      <div style={{
        background:"linear-gradient(135deg,#1a0033,#330066)",
        border:"2px solid #9955ff",borderRadius:28,padding:"28px 24px",
        maxWidth:380,width:"100%",textAlign:"center",
        boxShadow:"0 20px 60px rgba(100,0,255,0.3)",
        animation:"popIn 0.4s ease",
      }}>
        <div style={{fontSize:38,marginBottom:6}}>{latest.emoji}</div>
        <div style={{fontSize:11,letterSpacing:3,color:"#cc88ff",textTransform:"uppercase",
          fontWeight:700,marginBottom:4}}>What's New</div>
        <div style={{fontSize:22,fontWeight:900,color:"white",marginBottom:4}}>
          v{latest.version} — {latest.label}
        </div>
        <div style={{fontSize:11,color:"#9977BB",marginBottom:16}}>{latest.date}</div>

        {/* Change list */}
        <div style={{background:"rgba(255,255,255,0.06)",borderRadius:16,
          padding:"14px 16px",marginBottom:20,textAlign:"left"}}>
          {latest.changes.map((c,i)=>(
            <div key={i} style={{display:"flex",gap:8,marginBottom:i<latest.changes.length-1?8:0}}>
              <span style={{color:"#cc88ff",flexShrink:0,marginTop:1}}>✦</span>
              <span style={{fontSize:13,color:"#e0d0ff",lineHeight:1.5}}>{c}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <button onClick={onViewHistory} style={{
            padding:"10px 18px",background:"transparent",
            border:"1.5px solid #7733dd",borderRadius:14,
            color:"#cc88ff",fontSize:13,fontWeight:700,
            cursor:"pointer",fontFamily:"Georgia,serif",
          }}>
            📋 Full History
          </button>
          <button onClick={onDismiss} style={{
            padding:"10px 24px",
            background:"linear-gradient(135deg,#e0379a,#7733dd)",
            border:"none",borderRadius:14,
            color:"white",fontSize:14,fontWeight:900,
            cursor:"pointer",fontFamily:"Georgia,serif",
            boxShadow:"0 4px 16px #7733dd44",
          }}>
            Let's Play! ✨
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHANGELOG HISTORY
// ─────────────────────────────────────────────────────────────────────────────
function ChangelogHistory({onClose}) {
  const labelColor = (v) => {
    if(v.endsWith(".0") || v === "1.0") return {bg:"#FFD700",text:"#330000",label:"MAJOR"};
    if(v.endsWith(".5")) return {bg:"#e0379a",text:"white",label:"SIGNIFICANT"};
    const parts = v.split(".");
    if(parts.length===3) return {bg:"#4488FF",text:"white",label:"PATCH"};
    return {bg:"#7733dd",text:"white",label:"UPDATE"};
  };
  return (
    <div style={{position:"fixed",inset:0,
      background:"linear-gradient(135deg,#0d0d1a,#1a0d2e)",
      zIndex:600,overflowY:"auto",fontFamily:"Georgia,serif"}}>

      {/* Header */}
      <div style={{position:"sticky",top:0,
        background:"rgba(13,13,26,0.97)",backdropFilter:"blur(8px)",
        padding:"16px 20px",borderBottom:"1px solid #441166",
        display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:1}}>
        <div>
          <div style={{fontSize:20,fontWeight:900,color:"white"}}>📋 Version History</div>
          <div style={{fontSize:12,color:"#9977BB",marginTop:2}}>
            Current version: <strong style={{color:"#cc88ff"}}>v{CURRENT_VERSION}</strong>
          </div>
        </div>
        <button onClick={onClose} style={{
          background:"#331155",border:"1.5px solid #7733dd",
          borderRadius:12,color:"white",fontSize:14,fontWeight:700,
          padding:"8px 16px",cursor:"pointer"}}>← Back</button>
      </div>

      {/* Version entries */}
      <div style={{maxWidth:560,margin:"0 auto",padding:"20px 16px 40px"}}>
        {CHANGELOG.map((entry, i)=>{
          const badge = labelColor(entry.version);
          return (
            <div key={i} style={{
              background:i===0?"linear-gradient(135deg,#1a0044,#2a0066)":"rgba(255,255,255,0.04)",
              border:`1.5px solid ${i===0?"#9955ff":"#331144"}`,
              borderRadius:20,padding:"18px 20px",marginBottom:14,
              position:"relative",
            }}>
              {i===0&&(
                <div style={{position:"absolute",top:-10,left:20,
                  background:"linear-gradient(135deg,#e0379a,#7733dd)",
                  color:"white",fontSize:10,fontWeight:900,letterSpacing:2,
                  padding:"3px 12px",borderRadius:10,textTransform:"uppercase"}}>
                  ✦ Latest
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
                <span style={{fontSize:22}}>{entry.emoji}</span>
                <span style={{fontSize:18,fontWeight:900,color:"white"}}>v{entry.version}</span>
                <span style={{fontSize:14,fontWeight:700,color:"#cc88ff"}}>{entry.label}</span>
                <span style={{
                  background:badge.bg,color:badge.text,
                  fontSize:9,fontWeight:900,letterSpacing:1.5,
                  padding:"2px 8px",borderRadius:8,textTransform:"uppercase",marginLeft:"auto",
                }}>{badge.label}</span>
              </div>
              <div style={{fontSize:11,color:"#664488",marginBottom:10,marginTop:-6}}>{entry.date}</div>
              {entry.changes.map((c,j)=>(
                <div key={j} style={{display:"flex",gap:8,
                  marginBottom:j<entry.changes.length-1?6:0}}>
                  <span style={{color:"#7733dd",flexShrink:0,marginTop:1,fontSize:12}}>✦</span>
                  <span style={{fontSize:13,color:"#c0a8e0",lineHeight:1.5}}>{c}</span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StartScreen({difficulty, onDiffChange, onStart, totalStars, unlockedCount, crystals, appData, updateData}) {
  const [showGallery, setShowGallery] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const diff = DIFF_CONFIG[difficulty];
  const nextUnlock = ALL_CHARACTERS.find(c=>c.unlockAt>totalStars&&c.unlockAt>0);
  if(showGallery) return (
    <CharacterGallery unlockedCount={unlockedCount} totalStars={totalStars} onClose={()=>setShowGallery(false)}/>
  );
  if(showShop) return (
    <CrystalShop appData={appData} updateData={updateData} onClose={()=>setShowShop(false)}/>
  );
  if(showChangelog) return (
    <ChangelogHistory onClose={()=>setShowChangelog(false)}/>
  );
  return (
    <><GlobalStyle/><div style={{minHeight:"100dvh",width:"100%",boxSizing:"border-box",background:"linear-gradient(135deg,#fff0fb,#f0eaff)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      fontFamily:"Georgia,serif",padding:24,gap:20,textAlign:"center"}}>
      <div style={{fontSize:52,animation:"float0 2s ease-in-out infinite"}}>✨</div>
      <h1 style={{fontSize:30,fontWeight:900,color:"#7733dd",margin:0,lineHeight:1.2}}>
        Magical Math<br/>Adventure!
      </h1>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        {ALL_CHARACTERS.slice(0,unlockedCount).slice(-6).map((c,i)=>(
          <div key={i} style={{fontSize:28,animation:`float${i%3} ${2+i*0.3}s ease-in-out infinite`,
            animationDelay:`${i*0.2}s`}}>{c.emoji}</div>
        ))}
      </div>
      {totalStars>0&&(
        <div style={{background:"white",borderRadius:16,padding:"10px 22px",
          border:"2px solid #ddd0ff",fontSize:15,color:"#550066",fontWeight:600}}>
          🌟 {totalStars} total stars — {unlockedCount} / {ALL_CHARACTERS.length} characters unlocked!
        </div>
      )}
      <div>
        <div style={{fontSize:13,color:"#9977BB",marginBottom:10,letterSpacing:1,textTransform:"uppercase",fontWeight:700}}>
          Choose difficulty
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          {Object.entries(DIFF_CONFIG).map(([key,d])=>(
            <button key={key} onClick={()=>onDiffChange(key)} style={{
              padding:"12px 20px",
              border:`2px solid ${difficulty===key?"#7733dd":"#ddd0ee"}`,
              borderRadius:16,
              background:difficulty===key?"linear-gradient(135deg,#e0379a,#7733dd)":"white",
              color:difficulty===key?"white":"#7733dd",
              fontWeight:800,fontSize:15,cursor:"pointer",fontFamily:"Georgia,serif",
              boxShadow:difficulty===key?"0 4px 16px #7733dd44":"none",
              transition:"all 0.2s",
            }}>
              {d.emoji}<br/><span style={{fontSize:12}}>{d.label}</span>
            </button>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:13,color:"#9977BB",fontStyle:"italic"}}>
          {difficulty==="easy"?"Numbers stay small — equations shown to help 🌱":
           difficulty==="medium"?"Mid-range numbers — figure out the equation ⭐":
           "Big numbers — no equation hints! 🔥"}
        </div>
      </div>
      {nextUnlock&&(
        <div style={{background:"white",borderRadius:14,padding:"10px 18px",
          border:"2px dashed #e0379a",fontSize:13,color:"#cc2277",maxWidth:280}}>
          🔓 Next unlock: <strong>{nextUnlock.name} {nextUnlock.emoji}</strong> at {nextUnlock.unlockAt} ⭐
          <div style={{fontSize:11,color:"#9977BB",marginTop:3}}>{nextUnlock.unlockAt-totalStars} stars to go!</div>
        </div>
      )}
      <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={()=>setShowGallery(true)} style={{
          padding:"12px 20px",background:"white",
          border:"2px solid #ddd0ee",borderRadius:16,
          fontSize:14,fontWeight:700,color:"#7733dd",cursor:"pointer",
          fontFamily:"Georgia,serif",
        }}>
          👯 Gallery ({unlockedCount}/{ALL_CHARACTERS.length})
        </button>
        <button onClick={()=>setShowShop(true)} style={{
          padding:"12px 20px",
          background:"linear-gradient(135deg,#330066,#550099)",
          border:"2px solid #7733dd",borderRadius:16,
          fontSize:14,fontWeight:700,color:"white",cursor:"pointer",
          fontFamily:"Georgia,serif",
        }}>
          💎 Shop ({crystals} crystals)
        </button>
      </div>
      <button onClick={()=>setShowChangelog(true)} style={{
        padding:"8px 20px",background:"transparent",
        border:"1.5px solid #ddd0ee",borderRadius:12,
        fontSize:12,fontWeight:600,color:"#9977BB",cursor:"pointer",
        fontFamily:"Georgia,serif",
      }}>
        📋 v{CURRENT_VERSION} — What's New
      </button>
      <button onClick={onStart} style={{
        padding:"18px 48px",
        background:"linear-gradient(135deg,#e0379a,#7733dd)",
        border:"none",borderRadius:22,fontSize:20,fontWeight:900,
        color:"white",cursor:"pointer",
        boxShadow:"0 8px 28px #7733dd44",
        animation:"float1 2.5s ease-in-out infinite",
      }}>
        ✨ Start Adventure!
      </button>
      <style>{`
        @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
      `}</style>
    </div></>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function LoadingScreen({difficulty}) {
  const [dots,setDots]=useState(".");
  useEffect(()=>{
    const t=setInterval(()=>setDots(d=>d.length>=3?".":d+"."),500);
    return ()=>clearInterval(t);
  },[]);
  const diff=DIFF_CONFIG[difficulty];
  return (
    <><GlobalStyle/><div style={{minHeight:"100dvh",width:"100%",boxSizing:"border-box",background:"linear-gradient(135deg,#fff0fb,#f0eaff)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      fontFamily:"Georgia,serif",gap:20,padding:24}}>
      <div style={{fontSize:60,animation:"float0 2s ease-in-out infinite"}}>✨</div>
      <div style={{fontSize:22,fontWeight:800,color:"#7733dd",textAlign:"center"}}>
        Summoning your problems{dots}
      </div>
      <div style={{background:"white",borderRadius:16,padding:"8px 20px",
        border:"2px solid #ddd0ff",fontSize:15,color:"#7733dd",fontWeight:700}}>
        {diff.emoji} {diff.label} mode
      </div>
      <div style={{fontSize:14,color:"#9977BB",maxWidth:280,textAlign:"center",lineHeight:1.6}}>
        The magical girls are preparing 20 brand new adventures just for you!
      </div>
      <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap",justifyContent:"center"}}>
        {STARTER_CHARS.slice(0,6).map((c,i)=>(
          <div key={i} style={{fontSize:24,animation:`float${i%3} ${2+i*0.3}s ease-in-out infinite`,
            animationDelay:`${i*0.2}s`}}>{c.emoji}</div>
        ))}
      </div>
    </div></>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION COMPLETE
// ─────────────────────────────────────────────────────────────────────────────
function SessionComplete({stars,total,totalStars,nextUnlock,onNewSession,difficulty,onDiffChange,appData,updateData,crystalsEarned}) {
  const [showGallery, setShowGallery] = useState(false);
  const [showShop, setShowShop] = useState(false);
  if(showGallery) return <CharacterGallery unlockedCount={ALL_CHARACTERS.length} totalStars={totalStars} onClose={()=>setShowGallery(false)}/>;
  if(showShop) return <CrystalShop appData={appData} updateData={updateData} onClose={()=>setShowShop(false)}/>;
  const pct=Math.round((stars/total)*100);
  const diff=DIFF_CONFIG[difficulty];
  return (
    <div style={{minHeight:"100dvh",width:"100%",boxSizing:"border-box",background:"linear-gradient(135deg,#fff0fb,#f0eaff)",
      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      fontFamily:"Georgia,serif",padding:24,gap:14,textAlign:"center"}}>
      <div style={{fontSize:52}}>🌟✨🎉✨🌟</div>
      <h1 style={{fontSize:28,fontWeight:900,color:"#7733dd",margin:0}}>Session Complete!</h1>
      <div style={{fontSize:18,color:"#550066",fontWeight:700}}>
        {stars} / {total} stars this session
      </div>
      <div style={{width:260,background:"#e8e0ff",borderRadius:20,height:24,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",
          background:"linear-gradient(90deg,#e0379a,#7733dd)",borderRadius:20,
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"white",fontSize:12,fontWeight:800,transition:"width 1s ease"}}>
          {pct>15?`${pct}%`:""}
        </div>
      </div>
      <div style={{fontSize:22,marginTop:4}}>
        {pct===100?"🏆 Perfect score! You're a math wizard!":
         pct>=80?"🌟 Amazing work, magical girl!":
         pct>=60?"⭐ Great job, keep practicing!":
         "💪 Good effort! You're getting stronger!"}
      </div>
      <div style={{background:"white",borderRadius:16,padding:"12px 20px",
        border:"2px solid #ddd0ff",fontSize:15,color:"#550066",fontWeight:600}}>
        ⭐ Total stars ever: <strong style={{color:"#7733dd"}}>{totalStars}</strong>
      </div>
      {crystalsEarned>0&&(
        <div style={{background:"linear-gradient(135deg,#1a0033,#330066)",
          borderRadius:16,padding:"12px 20px",border:"2px solid #7733dd",
          fontSize:15,color:"white",fontWeight:700,animation:"popIn 0.5s ease"}}>
          💎 +{crystalsEarned} magic crystals earned this session!
          <div style={{fontSize:12,color:"#cc88ff",marginTop:4}}>Total: {appData?.crystals||0} 💎</div>
        </div>
      )}
      {nextUnlock&&(
        <div style={{background:"linear-gradient(135deg,#fff0fb,#f0eaff)",
          borderRadius:16,padding:"12px 20px",border:"2px dashed #e0379a",
          fontSize:14,color:"#cc2277",maxWidth:300}}>
          🔓 Next unlock: <strong>{nextUnlock.name} {nextUnlock.emoji}</strong> at {nextUnlock.unlockAt} stars!
          <div style={{fontSize:12,marginTop:4,color:"#9977BB"}}>
            {nextUnlock.unlockAt - totalStars} more stars to go!
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:8,marginTop:4}}>
        {Object.entries(DIFF_CONFIG).map(([key,d])=>(
          <button key={key} onClick={()=>onDiffChange(key)} style={{
            padding:"8px 16px",border:`2px solid ${difficulty===key?"#7733dd":"#ddd0ee"}`,
            borderRadius:12,background:difficulty===key?"#7733dd":"white",
            color:difficulty===key?"white":"#7733dd",fontWeight:700,fontSize:13,
            cursor:"pointer",fontFamily:"Georgia,serif"}}>
            {d.emoji} {d.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
        <button onClick={()=>setShowGallery(true)} style={{
          padding:"10px 18px",background:"white",border:"2px solid #ddd0ee",
          borderRadius:14,fontSize:13,fontWeight:700,color:"#7733dd",
          cursor:"pointer",fontFamily:"Georgia,serif"}}>
          👯 Gallery
        </button>
        <button onClick={()=>setShowShop(true)} style={{
          padding:"10px 18px",
          background:"linear-gradient(135deg,#330066,#550099)",
          border:"2px solid #7733dd",
          borderRadius:14,fontSize:13,fontWeight:700,color:"white",
          cursor:"pointer",fontFamily:"Georgia,serif"}}>
          💎 Shop ({appData?.crystals||0} 💎)
        </button>
      </div>
      <button onClick={onNewSession} style={{marginTop:4,padding:"16px 40px",
        background:"linear-gradient(135deg,#e0379a,#7733dd)",border:"none",borderRadius:20,
        fontSize:18,fontWeight:900,color:"white",cursor:"pointer",
        boxShadow:"0 6px 24px #7733dd44"}}>
        ✨ New Session — 20 More Problems!
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  // Persistent data
  const [appData,setAppData]       = useState(()=>({...defaultData(),...(loadData()||{})}));
  // Screen: 'start' | 'loading' | 'playing' | 'done'
  const [screen,setScreen]           = useState('start');
  // Session state
  const [problems,setProblems]     = useState(null);
  const [error,setError]           = useState(null);
  const [idx,setIdx]               = useState(0);
  const [answerA,setAnswerA]       = useState("");
  const [answerB,setAnswerB]       = useState("");
  const [submittedA,setSubmittedA] = useState(false);
  const [submittedB,setSubmittedB] = useState(false);
  const [correctA,setCorrectA]     = useState(null);
  const [correctB,setCorrectB]     = useState(null);
  const [showHintA,setShowHintA]   = useState(false);
  const [showHintB,setShowHintB]   = useState(false);
  const [sessionStars,setSessionStars] = useState(0);
  const [streak,setStreak]         = useState(0);
  const [celebrate,setCelebrate]   = useState(false);
  const [showConfetti,setShowConfetti] = useState(false);
  const [triesA,setTriesA]         = useState(0);
  const [triesB,setTriesB]         = useState(0);
  const [unlockPopup,setUnlockPopup]   = useState(null);
  const [streakFlash,setStreakFlash]   = useState(false);
  const [petState,setPetState]         = useState("idle");
  const [showUpdateSplash,setShowUpdateSplash] = useState(false);
  const [showUpdateHistory,setShowUpdateHistory] = useState(false);
  const [sessionCrystals,setSessionCrystals] = useState(0);
  const [hintsThisSession,setHintsThisSession] = useState(0);
  const [crystalPopup,setCrystalPopup] = useState(null);

  const muted = appData.muted;

  // Save appData whenever it changes
  useEffect(()=>{ saveData(appData); },[appData]);

  // Check for update on mount — show splash if version is new
  useEffect(()=>{
    if(appData.lastSeenVersion !== CURRENT_VERSION) {
      setShowUpdateSplash(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const updateData = useCallback((updates) => {
    setAppData(prev=>{
      const next={...prev,...(typeof updates==="function"?updates(prev):updates)};
      return next;
    });
  },[]);

  const loadProblems = useCallback(async (diff=null) => {
    const difficulty = diff || appData.difficulty;
    setScreen('loading'); setError(null); setProblems(null);
    setIdx(0); setSessionStars(0); setStreak(0);
    setSessionCrystals(0); setHintsThisSession(0);
    setPetState("idle");
    resetProblem();
    try {
      const data = await generateProblems(20, difficulty, appData.weakSpots, appData.unlockedCount);
      setProblems(data);
      setScreen('playing');
    } catch(e) {
      console.error(e);
      setError("Couldn't summon the problems! Check your API key. 🌙\n"+e.message);
      setScreen('start');
    }
  },[appData.difficulty, appData.weakSpots, appData.unlockedCount]);

  const resetProblem = () => {
    setAnswerA(""); setAnswerB("");
    setSubmittedA(false); setSubmittedB(false);
    setCorrectA(null); setCorrectB(null);
    setShowHintA(false); setShowHintB(false);
    setTriesA(0); setTriesB(0); setCelebrate(false);
  };

  // Detect operation type from equation string
  const detectOp = (eq="") => {
    if(eq.includes("÷")||eq.includes("/")||eq.includes("div")) return "div";
    if(eq.includes("×")||eq.includes("*")) return "mul";
    if(eq.includes("+")||eq.includes("add")) return "add";
    if(eq.includes("−")||eq.includes("-")) return "sub";
    if(eq.toLowerCase().includes("remainder")) return "rem";
    return "add";
  };

  const handleCorrect = (isA) => {
    const newStars = sessionStars + 1;
    const newTotal = appData.totalStars + 1;
    const newStreak = streak + 1;
    setSessionStars(newStars);
    setStreak(newStreak);

    SOUNDS.correct(muted);
    setPetState("happy");
    setTimeout(()=>setPetState("idle"),1500);
    if(newStreak>0&&newStreak%3===0) {
      SOUNDS.streak(muted);
      setStreakFlash(true);
      setTimeout(()=>setStreakFlash(false),1200);
    }

    // Check for new unlocks
    const nextUnlock = UNLOCK_CHARS.find(c=>c.unlockAt===newTotal||
      (newTotal>=c.unlockAt && appData.unlockedCount < ALL_CHARACTERS.indexOf(c)+1));

    updateData(prev=>{
      const newUnlockedCount = Math.max(prev.unlockedCount,
        ...ALL_CHARACTERS.map((c,i)=>newTotal>=c.unlockAt?i+1:prev.unlockedCount));
      const newData = {
        totalStars: newTotal,
        sessionBest: Math.max(prev.sessionBest, newStars),
        unlockedCount: newUnlockedCount,
      };
      // Trigger unlock popup
      if(newUnlockedCount > prev.unlockedCount && !prev.seenUnlockAt.includes(newTotal)) {
        const newChar = ALL_CHARACTERS[newUnlockedCount-1];
        if(newChar && newChar.unlockAt>0) {
          setTimeout(()=>{
            SOUNDS.unlock(muted);
            setUnlockPopup(newChar);
          },600);
          newData.seenUnlockAt=[...prev.seenUnlockAt,newTotal];
        }
      }
      return newData;
    });
  };

  const handleWrong = (opType) => {
    SOUNDS.wrong(muted);
    setPetState("sad");
    setTimeout(()=>setPetState("idle"),1500);
    setStreak(0);
    updateData(prev=>({
      weakSpots:{...prev.weakSpots,[opType]:(prev.weakSpots[opType]||0)+1}
    }));
  };

  const checkA = () => {
    const ok = parseInt(answerA)===problems[idx].partA.answer;
    const op = detectOp(problems[idx].partA.equation);
    setCorrectA(ok); setSubmittedA(true); setTriesA(t=>t+1);
    if(ok) handleCorrect(true);
    else if(triesA>=1) handleWrong(op);
  };

  const checkB = () => {
    const ok = parseInt(answerB)===problems[idx].partB.answer;
    const op = detectOp(problems[idx].partB.equation);
    setCorrectB(ok); setSubmittedB(true); setTriesB(t=>t+1);
    if(ok) {
      handleCorrect(false);
      if(correctA) {
        setCelebrate(true);
        SOUNDS.celebrate(muted);
      }
    } else if(triesB>=1) handleWrong(op);
  };

  const retryA=()=>{setAnswerA("");setSubmittedA(false);setCorrectA(null);};
  const retryB=()=>{setAnswerB("");setSubmittedB(false);setCorrectB(null);};

  const awardCrystals = (finalStars, totalProblems, hintsUsed, currentStreak, difficulty) => {
    let earned = 0;
    const perfect = finalStars === totalProblems * 2;
    const pct = finalStars / (totalProblems * 2);

    if(perfect) earned += 15;
    if(hintsUsed === 0 && finalStars > 0) earned += 10;
    if(currentStreak >= 15) earned += 10;
    else if(currentStreak >= 10) earned += 6;
    else if(currentStreak >= 5) earned += 3;

    // First hard complete bonus
    if(difficulty==="hard" && !appData.firstHardComplete && finalStars > 0) {
      earned += 20;
      updateData({firstHardComplete:true});
    }
    // First perfect by difficulty
    if(perfect && !appData.perfectByDiff?.[difficulty]) {
      earned += 15;
      updateData(prev=>({perfectByDiff:{...prev.perfectByDiff,[difficulty]:true}}));
    }

    if(earned > 0) {
      setSessionCrystals(earned);
      updateData(prev=>({
        crystals: prev.crystals + earned,
        totalCrystalsEarned: (prev.totalCrystalsEarned||0) + earned,
      }));
    }
    return earned;
  };

  const next=()=>{
    if(idx+1>=problems.length){
      if(sessionStars>=problems.length*2*0.9){
        setShowConfetti(true);
        SOUNDS.celebrate(muted);
        setTimeout(()=>setShowConfetti(false),4000);
      }
      awardCrystals(sessionStars, problems.length, hintsThisSession, streak, appData.difficulty);
      setScreen('done');
      return;
    }
    setIdx(i=>i+1);
    resetProblem();
  };

  const changeDifficulty=(diff)=>{
    updateData({difficulty:diff});
    loadProblems(diff);
  };

  // Determine character for current problem
  const getChar = () => {
    if(!problems) return ALL_CHARACTERS[0];
    const raw = problems[idx];
    const available = ALL_CHARACTERS.slice(0,appData.unlockedCount);
    return available[raw.characterIndex % available.length];
  };

  // Next unlock info
  const nextUnlock = UNLOCK_CHARS.find(c=>c.unlockAt>appData.totalStars);

  const dismissUpdateSplash = () => {
    setShowUpdateSplash(false);
    updateData({lastSeenVersion: CURRENT_VERSION});
  };

  if(screen==='start') return (
    <>
      <StartScreen
        difficulty={appData.difficulty}
        onDiffChange={diff=>updateData({difficulty:diff})}
        onStart={()=>loadProblems()}
        totalStars={appData.totalStars}
        unlockedCount={appData.unlockedCount}
        crystals={appData.crystals||0}
        appData={appData}
        updateData={updateData}
      />
      {showUpdateHistory && <ChangelogHistory onClose={()=>setShowUpdateHistory(false)}/>}
      {showUpdateSplash && !showUpdateHistory && (
        <UpdateSplash
          onDismiss={dismissUpdateSplash}
          onViewHistory={()=>setShowUpdateHistory(true)}
        />
      )}
    </>
  );

  if(screen==='loading') return <LoadingScreen difficulty={appData.difficulty}/>;

  if(error) return (
    <div style={{minHeight:"100dvh",width:"100%",boxSizing:"border-box",display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",fontFamily:"Georgia,serif",gap:16,background:"#fff0fb",
      padding:24,textAlign:"center"}}>
      <div style={{fontSize:40}}>😢</div>
      <div style={{fontSize:16,color:"#cc1144",fontWeight:700,maxWidth:340,lineHeight:1.5}}>{error}</div>
      <button onClick={()=>setScreen('start')} style={{padding:"12px 32px",background:"#e0379a",
        border:"none",borderRadius:14,color:"white",fontSize:16,fontWeight:800,cursor:"pointer"}}>
        Back to Start ✨
      </button>
    </div>
  );

  if(screen==='done') return (
    <>
      {showConfetti&&<Confetti/>}
      <SessionComplete
        stars={sessionStars} total={problems.length*2}
        totalStars={appData.totalStars} nextUnlock={nextUnlock}
        difficulty={appData.difficulty}
        onDiffChange={changeDifficulty}
        onNewSession={()=>loadProblems()}
        appData={appData}
        updateData={updateData}
        crystalsEarned={sessionCrystals}
      />
    </>
  );

  if(!problems) return null;

  const p = getChar();
  const raw = problems[idx];

  return (
    <><GlobalStyle/><div style={{minHeight:"100dvh",width:"100%",boxSizing:"border-box",position:"relative",overflow:"hidden",
      background:BG_THEMES[appData.activeBg||'bg_default']||p.bg,fontFamily:"'Georgia',serif",transition:"background 0.7s ease"}}>
      <Sparkles accent={p.accent} sparkleId={appData.activeSparkle||'sparkle_default'}/>
      {unlockPopup&&<UnlockPopup char={unlockPopup} onClose={()=>setUnlockPopup(null)}/>}
      <PetCompanion petId={appData.activePet||"pet_luna"} state={petState} accentColor={p.accent}/>
      {sessionCrystals>0&&screen==='done'&&(
        <div style={{position:"absolute",top:20,left:"50%",transform:"translateX(-50%)",
          background:"linear-gradient(135deg,#330066,#550099)",
          border:"2px solid #9955ff",borderRadius:16,padding:"10px 20px",
          color:"white",fontWeight:800,fontSize:15,zIndex:200,
          animation:"popIn 0.4s ease",whiteSpace:"nowrap"}}>
          💎 +{sessionCrystals} crystals earned!
        </div>
      )}

      {/* Header */}
      <div style={{textAlign:"center",padding:"16px 16px 0",position:"relative",zIndex:1}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          maxWidth:540,margin:"0 auto",marginBottom:8}}>
          {/* Left buttons: home + mute */}
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>{
              if(window.confirm("Go back to the home screen? Your progress this session will be lost.")) {
                setScreen('start');
              }
            }} style={{
              background:"white",border:`1.5px solid ${p.border}`,borderRadius:12,
              width:38,height:38,cursor:"pointer",fontSize:18,display:"flex",
              alignItems:"center",justifyContent:"center"}}>
              🏠
            </button>
            <button onClick={()=>updateData({muted:!muted})} style={{
              background:"white",border:`1.5px solid ${p.border}`,borderRadius:12,
              width:38,height:38,cursor:"pointer",fontSize:18,display:"flex",
              alignItems:"center",justifyContent:"center"}}>
              {muted?"🔇":"🔊"}
            </button>
          </div>

          {/* Title */}
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:10,letterSpacing:4,color:p.accent,textTransform:"uppercase",fontWeight:700}}>
              ✨ Magical Math ✨
            </div>
            <div style={{fontSize:13,color:"#330044",fontWeight:800}}>Two-Part Problems</div>
          </div>

          {/* Difficulty toggle — confirms + regenerates if changing */}
          <div style={{display:"flex",gap:4}}>
            {Object.entries(DIFF_CONFIG).map(([key,d])=>(
              <button key={key} onClick={()=>{
                SOUNDS.click(muted);
                if(key===appData.difficulty) return;
                if(window.confirm(`Switch to ${d.label} mode? This will generate 20 new problems.`)) {
                  changeDifficulty(key);
                }
              }} title={d.label} style={{
                width:32,height:32,border:`1.5px solid ${appData.difficulty===key?p.accent:p.border}`,
                borderRadius:10,background:appData.difficulty===key?p.accent:"white",
                cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {d.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Stars + streak row */}
        <div style={{display:"inline-flex",alignItems:"center",gap:12,
          background:"white",border:`1.5px solid ${p.border}`,
          borderRadius:20,padding:"5px 18px",fontSize:14,color:p.accent,fontWeight:700}}>
          <span>⭐ {sessionStars} this session</span>
          <span style={{width:1,height:14,background:p.border}}/>
          <span style={{color:"#9977BB",fontSize:12}}>🌟 {appData.totalStars} total</span>
          {streak>=3&&(
            <span style={{
              color:"#ff6600",fontWeight:900,fontSize:13,
              animation:streakFlash?"streakPop 0.4s ease":"none",
            }}>🔥 {streak} streak!</span>
          )}
          <span style={{width:1,height:14,background:p.border}}/>
          <span style={{color:"#9977BB",fontSize:12}}>💎 {appData.crystals||0}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{maxWidth:540,margin:"10px auto 0",padding:"0 14px",position:"relative",zIndex:1}}>
        <div style={{background:p.softBg,borderRadius:10,height:7,overflow:"hidden"}}>
          <div style={{width:`${(idx/problems.length)*100}%`,height:"100%",
            background:`linear-gradient(90deg,${p.accent},${p.accent}88)`,
            borderRadius:10,transition:"width 0.5s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,
          color:"#9977BB",marginTop:3,padding:"0 2px"}}>
          <span>Problem {idx+1} / {problems.length}</span>
          <span>{DIFF_CONFIG[appData.difficulty].emoji} {DIFF_CONFIG[appData.difficulty].label}</span>
        </div>
      </div>

      {/* Card */}
      <div style={{maxWidth:540,margin:"12px auto 0",padding:"0 14px 50px",position:"relative",zIndex:1}}>
        <div style={{background:"white",borderRadius:26,
          boxShadow:`0 10px 50px ${p.accent}22,0 2px 16px ${p.accent}18`,
          border:`2px solid ${p.border}`,overflow:"hidden"}}>

          {/* Character banner */}
          <div style={{background:`linear-gradient(135deg,${p.accent}ee,${p.accent}88)`,
            padding:"16px 18px",display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:88,height:104,flexShrink:0,
              filter:"drop-shadow(0 4px 16px rgba(0,0,0,0.3))"}}>
              <div dangerouslySetInnerHTML={{__html:p.art}}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"white",opacity:0.85,letterSpacing:2,
                textTransform:"uppercase",marginBottom:5}}>{p.name} {p.emoji}</div>
              <div style={{fontSize:14,fontWeight:700,color:"white",lineHeight:1.55,
                textShadow:"0 1px 4px rgba(0,0,0,0.25)"}}>{raw.story}</div>
            </div>
          </div>

          {/* Problem body */}
          <div style={{padding:"20px 20px 24px"}}>
            <PartSection
              label="Part A" accent={p.accent} softBg={p.softBg} border={p.border}
              question={raw.partA.question} equation={raw.partA.equation} hint={raw.partA.hint}
              showHint={showHintA} onToggleHint={()=>{if(!showHintA)setHintsThisSession(h=>h+1);setShowHintA(h=>!h);}}
              answer={answerA} onAnswer={setAnswerA}
              submitted={submittedA} correct={correctA}
              onCheck={checkA} onRetry={retryA} tries={triesA}
              explanation={raw.partA.explanation} correctAnswer={raw.partA.answer}
              difficulty={appData.difficulty}
            />
            <div style={{height:1,background:p.border,margin:"20px 0",opacity:0.5}}/>
            <PartSection
              label="Part B" accent={p.accent} softBg={p.softBg} border={p.border}
              question={raw.partB.question} equation={raw.partB.equation} hint={raw.partB.hint}
              showHint={showHintB} onToggleHint={()=>{if(!showHintB)setHintsThisSession(h=>h+1);setShowHintB(h=>!h);}}
              answer={answerB} onAnswer={setAnswerB}
              submitted={submittedB} correct={correctB}
              onCheck={checkB} onRetry={retryB} tries={triesB}
              explanation={raw.partB.explanation} correctAnswer={raw.partB.answer}
              difficulty={appData.difficulty}
            />

            {celebrate&&(
              <div style={{marginTop:18,textAlign:"center",
                background:`linear-gradient(135deg,${p.softBg},white)`,
                border:`2px solid ${p.border}`,borderRadius:18,padding:"16px",
                animation:"popIn 0.4s ease"}}>
                <div style={{fontSize:34}}>🌟✨🎉✨🌟</div>
                <div style={{fontWeight:900,fontSize:18,color:p.accent,marginTop:6}}>
                  Both parts correct! You're magical! 💖
                </div>
              </div>
            )}

            {submittedA&&submittedB&&(
              <button onClick={next} style={{marginTop:16,width:"100%",padding:"14px 0",
                background:`linear-gradient(135deg,${p.accent},${p.accent}bb)`,
                border:"none",borderRadius:16,fontSize:17,fontWeight:900,
                color:"white",cursor:"pointer",boxShadow:`0 6px 22px ${p.accent}44`,
                transition:"transform 0.15s"}}
                onMouseDown={e=>e.currentTarget.style.transform="scale(0.97)"}
                onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}>
                {idx+1>=problems.length?"See my score! 🏆":"Next Adventure → ✨"}
              </button>
            )}
          </div>
        </div>

        {/* Next unlock teaser */}
        {nextUnlock&&(
          <div style={{marginTop:12,textAlign:"center",fontSize:12,color:"#9977BB"}}>
            🔓 {nextUnlock.unlockAt-appData.totalStars} more stars to unlock {nextUnlock.name} {nextUnlock.emoji}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes streakPop{0%{transform:scale(1)}50%{transform:scale(1.4)}100%{transform:scale(1)}}
        @keyframes petIdle{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-8px) rotate(2deg)}}
        @keyframes petHappy{0%{transform:scale(1) rotate(0deg)}25%{transform:scale(1.3) rotate(-15deg)}50%{transform:scale(1.3) rotate(15deg)}75%{transform:scale(1.2) rotate(-8deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes petSad{0%{transform:translateY(0)}30%{transform:translateY(6px) rotate(-5deg)}60%{transform:translateY(4px) rotate(5deg)}100%{transform:translateY(0)}}
        input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
        input[type=number]{-moz-appearance:textfield}
      `}</style>
    </div></>
  );
}
