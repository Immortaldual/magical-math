/*
CHANGELOG
---------
v1.6 - 2026-03-10
- Added: Full custom SVG art for Baby Dragon, Tiny Fairy, Celestial Fox, Baby Phoenix (all 3 states each)
- Fixed: No more placeholder circle art for any pet


- Fixed: Sparkles now contained inside app (position absolute, no longer leaking outside on iPad)
- Fixed: Pet companion now contained inside app (position absolute)
- Fixed: Crystal earned popup no longer uses fixed positioning

v1.4 - 2026-03-10
- Fixed: Loading screen now fills full width on all devices
- Added: Home button (🏠) on playing screen to return to start screen

v1.3 - 2026-03-10
- Added: Crystal shop with Pets, Backgrounds, Sparkles, Borders tabs
- Added: Luna pet companion with idle/happy/sad animations (bottom-right of playing screen)
- Added: Magic crystal economy — earned for no-hint sessions, streaks, perfect scores, first hard clear
- Added: 8 purchasable pets including Artemis, Diana, Moon Rabbit, Baby Phoenix
- Added: Background themes, sparkle effects, card border cosmetics
- Added: Crystal balance shown in playing screen header and start screen shop button
- Fixed: All screens now fill full width on iPad and iPhone (100dvh + width:100%)
- Fixed: Sparkle effects now use active cosmetic selection

v1.2 - 2026-03-10
- Added: Character gallery accessible from start screen and session complete
- Fixed: Mid-session unlocks now appear immediately without restarting

v1.1 - 2026-03-10
- Added: Netlify function proxy — API key now hidden server-side
- Added: Rate limiting (10 sessions/IP/hour)
*/
import { useState, useEffect, useRef, useCallback } from "react";

// Ensure full-width rendering
const GlobalStyle = () => (
  <style>{`
    html, body, #root { width: 100%; min-height: 100dvh; margin: 0; padding: 0; }
    * { box-sizing: border-box; }
  `}</style>
);

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
  };
}


// ─────────────────────────────────────────────────────────────────────────────
// SHOP ITEMS
// ─────────────────────────────────────────────────────────────────────────────
const SHOP_ITEMS = {
  pets: [
    { id:"pet_luna",    name:"Luna",          emoji:"🖤", cost:0,   desc:"Your faithful black cat companion!", art:"luna" },
    { id:"pet_artemis", name:"Artemis",        emoji:"🤍", cost:150, desc:"Luna's wise white cat partner!" },
    { id:"pet_diana",   name:"Diana",          emoji:"💜", cost:400, desc:"Their precious grey kitten daughter!" },
    { id:"pet_dragon",  name:"Baby Dragon",    emoji:"🐉", cost:200, desc:"A tiny dragon who breathes sparkles!" },
    { id:"pet_fairy",   name:"Tiny Fairy",     emoji:"✨", cost:250, desc:"A magical fairy that matches your character!" },
    { id:"pet_fox",     name:"Celestial Fox",  emoji:"🦊", cost:300, desc:"A fox surrounded by cosmic energy!" },
    { id:"pet_rabbit",  name:"Moon Rabbit",    emoji:"🐰", cost:50,  desc:"A gentle bunny from the moon!" },
    { id:"pet_phoenix", name:"Baby Phoenix",   emoji:"🔥", cost:500, desc:"The rarest companion — a phoenix of pure magic!" },
  ],
  backgrounds: [
    { id:"bg_default",    name:"Magical Garden",   emoji:"🌸", cost:0,  desc:"The classic magical backdrop" },
    { id:"bg_starry",     name:"Starry Night",      emoji:"🌟", cost:20, desc:"A dreamy night sky full of stars" },
    { id:"bg_cherry",     name:"Cherry Blossom",    emoji:"🌸", cost:20, desc:"Soft pink petals falling gently" },
    { id:"bg_forest",     name:"Enchanted Forest",  emoji:"🌿", cost:25, desc:"A mysterious magical forest" },
    { id:"bg_ocean",      name:"Underwater Kingdom",emoji:"🌊", cost:25, desc:"Deep beneath the sparkling sea" },
    { id:"bg_galaxy",     name:"Galaxy",            emoji:"🔮", cost:30, desc:"Drift through the cosmos itself" },
  ],
  sparkles: [
    { id:"sparkle_default", name:"Magic Stars",    emoji:"✦", cost:0,  desc:"Classic magical sparkles" },
    { id:"sparkle_rainbow", name:"Rainbow",        emoji:"🌈", cost:15, desc:"All the colors of the rainbow!" },
    { id:"sparkle_hearts",  name:"Hearts",         emoji:"💕", cost:15, desc:"Floating hearts everywhere!" },
    { id:"sparkle_shoots",  name:"Shooting Stars", emoji:"💫", cost:20, desc:"Stars streaking across the screen" },
    { id:"sparkle_blossom", name:"Blossoms",       emoji:"🌸", cost:20, desc:"Soft petals drifting by" },
    { id:"sparkle_galaxy",  name:"Galaxy Dust",    emoji:"🌌", cost:25, desc:"Cosmic dust from distant stars" },
  ],
  borders: [
    { id:"border_default", name:"Simple",        emoji:"⬜", cost:0,  desc:"Clean and simple" },
    { id:"border_floral",  name:"Floral Vine",   emoji:"🌿", cost:20, desc:"Delicate vines and flowers" },
    { id:"border_starburst",name:"Star Burst",   emoji:"⭐", cost:20, desc:"Radiating star energy" },
    { id:"border_moon",    name:"Moon & Stars",  emoji:"🌙", cost:25, desc:"Crescent moons and twinkling stars" },
    { id:"border_crystal", name:"Crystal Gems",  emoji:"💎", cost:30, desc:"Sparkling crystal gems" },
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
      idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#222222"/>
        <ellipse cx="21" cy="20" rx="5" ry="9" fill="#222222"/>
        <ellipse cx="39" cy="20" rx="5" ry="9" fill="#222222"/>
        <ellipse cx="21" cy="20" rx="2.5" ry="5" fill="#FF88AA"/>
        <ellipse cx="39" cy="20" rx="2.5" ry="5" fill="#FF88AA"/>
        <ellipse cx="30" cy="32" rx="14" ry="14" fill="#333333"/>
        <ellipse cx="24" cy="30" rx="5" ry="6" fill="#FFD700"/>
        <ellipse cx="36" cy="30" rx="5" ry="6" fill="#FFD700"/>
        <ellipse cx="24" cy="30" rx="2.5" ry="4" fill="#222200"/>
        <ellipse cx="36" cy="30" rx="2.5" ry="4" fill="#222200"/>
        <circle cx="25" cy="28" r="1.5" fill="white"/>
        <circle cx="37" cy="28" r="1.5" fill="white"/>
        <ellipse cx="30" cy="36" rx="3" ry="2" fill="#FF8888"/>
        <path d="M27 38 Q30 41 33 38" stroke="#555" stroke-width="1" fill="none"/>
        <line x1="18" y1="34" x2="8" y2="32" stroke="#888" stroke-width="1"/>
        <line x1="18" y1="36" x2="8" y2="36" stroke="#888" stroke-width="1"/>
        <line x1="42" y1="34" x2="52" y2="32" stroke="#888" stroke-width="1"/>
        <line x1="42" y1="36" x2="52" y2="36" stroke="#888" stroke-width="1"/>
        <circle cx="30" cy="22" r="4" fill="#FFD700" opacity="0.9"/>
      </svg>`,
      happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#222222"/>
        <ellipse cx="21" cy="18" rx="5" ry="9" fill="#222222"/>
        <ellipse cx="39" cy="18" rx="5" ry="9" fill="#222222"/>
        <ellipse cx="21" cy="18" rx="2.5" ry="5" fill="#FF88AA"/>
        <ellipse cx="39" cy="18" rx="2.5" ry="5" fill="#FF88AA"/>
        <ellipse cx="30" cy="32" rx="14" ry="14" fill="#333333"/>
        <path d="M20 29 Q24 24 28 29" fill="#FFD700"/>
        <path d="M32 29 Q36 24 40 29" fill="#FFD700"/>
        <ellipse cx="30" cy="36" rx="3" ry="2" fill="#FF8888"/>
        <path d="M25 38 Q30 43 35 38" stroke="#555" stroke-width="1.5" fill="none"/>
        <line x1="18" y1="33" x2="6" y2="28" stroke="#888" stroke-width="1"/>
        <line x1="18" y1="35" x2="6" y2="35" stroke="#888" stroke-width="1"/>
        <line x1="42" y1="33" x2="54" y2="28" stroke="#888" stroke-width="1"/>
        <line x1="42" y1="35" x2="54" y2="35" stroke="#888" stroke-width="1"/>
        <circle cx="30" cy="21" r="4" fill="#FFD700" opacity="0.9"/>
        <text x="15" y="12" font-size="8" fill="#FFD700">✦</text>
        <text x="38" y="10" font-size="8" fill="#FF88CC">✦</text>
      </svg>`,
      sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="40" rx="18" ry="14" fill="#222222"/>
        <ellipse cx="21" cy="22" rx="5" ry="9" fill="#222222" transform="rotate(10,21,22)"/>
        <ellipse cx="39" cy="22" rx="5" ry="9" fill="#222222" transform="rotate(-10,39,22)"/>
        <ellipse cx="21" cy="22" rx="2.5" ry="5" fill="#FF88AA" transform="rotate(10,21,22)"/>
        <ellipse cx="39" cy="22" rx="2.5" ry="5" fill="#FF88AA" transform="rotate(-10,39,22)"/>
        <ellipse cx="30" cy="34" rx="14" ry="13" fill="#333333"/>
        <path d="M22 31 Q26 34 30 31" fill="none" stroke="#FFD700" stroke-width="2"/>
        <path d="M30 31 Q34 34 38 31" fill="none" stroke="#FFD700" stroke-width="2"/>
        <ellipse cx="30" cy="37" rx="3" ry="2" fill="#FF8888"/>
        <path d="M26 40 Q30 37 34 40" stroke="#555" stroke-width="1.5" fill="none"/>
        <circle cx="30" cy="22" r="4" fill="#FFD700" opacity="0.5"/>
      </svg>`,
    },
    pet_artemis: {
      idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#EEEEEE"/>
        <ellipse cx="21" cy="20" rx="5" ry="9" fill="#EEEEEE"/>
        <ellipse cx="39" cy="20" rx="5" ry="9" fill="#EEEEEE"/>
        <ellipse cx="21" cy="20" rx="2.5" ry="5" fill="#FFB0CC"/>
        <ellipse cx="39" cy="20" rx="2.5" ry="5" fill="#FFB0CC"/>
        <ellipse cx="30" cy="32" rx="14" ry="14" fill="#F5F5F5"/>
        <ellipse cx="24" cy="30" rx="5" ry="6" fill="#4488FF"/>
        <ellipse cx="36" cy="30" rx="5" ry="6" fill="#4488FF"/>
        <ellipse cx="24" cy="30" rx="2.5" ry="4" fill="#112266"/>
        <ellipse cx="36" cy="30" rx="2.5" ry="4" fill="#112266"/>
        <circle cx="25" cy="28" r="1.5" fill="white"/>
        <circle cx="37" cy="28" r="1.5" fill="white"/>
        <ellipse cx="30" cy="36" rx="3" ry="2" fill="#FFB0B0"/>
        <path d="M27 38 Q30 41 33 38" stroke="#ccc" stroke-width="1" fill="none"/>
        <line x1="18" y1="34" x2="8" y2="32" stroke="#ccc" stroke-width="1"/>
        <line x1="18" y1="36" x2="8" y2="36" stroke="#ccc" stroke-width="1"/>
        <line x1="42" y1="34" x2="52" y2="32" stroke="#ccc" stroke-width="1"/>
        <line x1="42" y1="36" x2="52" y2="36" stroke="#ccc" stroke-width="1"/>
      </svg>`,
      happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="38" rx="18" ry="16" fill="#EEEEEE"/>
        <ellipse cx="21" cy="18" rx="5" ry="9" fill="#EEEEEE"/>
        <ellipse cx="39" cy="18" rx="5" ry="9" fill="#EEEEEE"/>
        <ellipse cx="21" cy="18" rx="2.5" ry="5" fill="#FFB0CC"/>
        <ellipse cx="39" cy="18" rx="2.5" ry="5" fill="#FFB0CC"/>
        <ellipse cx="30" cy="32" rx="14" ry="14" fill="#F5F5F5"/>
        <path d="M20 29 Q24 24 28 29" fill="#4488FF"/>
        <path d="M32 29 Q36 24 40 29" fill="#4488FF"/>
        <ellipse cx="30" cy="36" rx="3" ry="2" fill="#FFB0B0"/>
        <path d="M25 38 Q30 43 35 38" stroke="#ccc" stroke-width="1.5" fill="none"/>
        <text x="14" y="12" font-size="8" fill="#4488FF">✦</text>
        <text x="38" y="10" font-size="8" fill="#88CCFF">✦</text>
      </svg>`,
      sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="40" rx="18" ry="14" fill="#EEEEEE"/>
        <ellipse cx="21" cy="22" rx="5" ry="9" fill="#EEEEEE" transform="rotate(10,21,22)"/>
        <ellipse cx="39" cy="22" rx="5" ry="9" fill="#EEEEEE" transform="rotate(-10,39,22)"/>
        <ellipse cx="21" cy="22" rx="2.5" ry="5" fill="#FFB0CC" transform="rotate(10,21,22)"/>
        <ellipse cx="39" cy="22" rx="2.5" ry="5" fill="#FFB0CC" transform="rotate(-10,39,22)"/>
        <ellipse cx="30" cy="34" rx="14" ry="13" fill="#F5F5F5"/>
        <path d="M22 31 Q26 34 30 31" fill="none" stroke="#4488FF" stroke-width="2"/>
        <path d="M30 31 Q34 34 38 31" fill="none" stroke="#4488FF" stroke-width="2"/>
        <ellipse cx="30" cy="37" rx="3" ry="2" fill="#FFB0B0"/>
        <path d="M26 40 Q30 37 34 40" stroke="#ccc" stroke-width="1.5" fill="none"/>
      </svg>`,
    },
    pet_diana: {
      idle:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="38" rx="16" ry="14" fill="#AAAAAA"/>
        <ellipse cx="21" cy="22" rx="4" ry="8" fill="#AAAAAA"/>
        <ellipse cx="39" cy="22" rx="4" ry="8" fill="#AAAAAA"/>
        <ellipse cx="21" cy="22" rx="2" ry="4.5" fill="#FFB0CC"/>
        <ellipse cx="39" cy="22" rx="2" ry="4.5" fill="#FFB0CC"/>
        <ellipse cx="30" cy="33" rx="12" ry="12" fill="#BBBBBB"/>
        <ellipse cx="25" cy="31" rx="4.5" ry="5" fill="#AA44FF"/>
        <ellipse cx="35" cy="31" rx="4.5" ry="5" fill="#AA44FF"/>
        <ellipse cx="25" cy="31" rx="2" ry="3.5" fill="#330066"/>
        <ellipse cx="35" cy="31" rx="2" ry="3.5" fill="#330066"/>
        <circle cx="26" cy="29" r="1.2" fill="white"/>
        <circle cx="36" cy="29" r="1.2" fill="white"/>
        <ellipse cx="30" cy="36" rx="2.5" ry="1.8" fill="#FFB0B0"/>
        <path d="M27 38 Q30 41 33 38" stroke="#999" stroke-width="1" fill="none"/>
        <line x1="19" y1="34" x2="10" y2="32" stroke="#aaa" stroke-width="0.8"/>
        <line x1="19" y1="36" x2="10" y2="36" stroke="#aaa" stroke-width="0.8"/>
        <line x1="41" y1="34" x2="50" y2="32" stroke="#aaa" stroke-width="0.8"/>
        <line x1="41" y1="36" x2="50" y2="36" stroke="#aaa" stroke-width="0.8"/>
        <circle cx="30" cy="22" r="3" fill="#AA44FF" opacity="0.8"/>
      </svg>`,
      happy:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="38" rx="16" ry="14" fill="#AAAAAA"/>
        <ellipse cx="21" cy="19" rx="4" ry="8" fill="#AAAAAA"/>
        <ellipse cx="39" cy="19" rx="4" ry="8" fill="#AAAAAA"/>
        <ellipse cx="21" cy="19" rx="2" ry="4.5" fill="#FFB0CC"/>
        <ellipse cx="39" cy="19" rx="2" ry="4.5" fill="#FFB0CC"/>
        <ellipse cx="30" cy="33" rx="12" ry="12" fill="#BBBBBB"/>
        <path d="M21 30 Q25 25 29 30" fill="#AA44FF"/>
        <path d="M31 30 Q35 25 39 30" fill="#AA44FF"/>
        <ellipse cx="30" cy="36" rx="2.5" ry="1.8" fill="#FFB0B0"/>
        <path d="M25 38 Q30 43 35 38" stroke="#999" stroke-width="1.5" fill="none"/>
        <circle cx="30" cy="21" r="3" fill="#AA44FF" opacity="0.9"/>
        <text x="13" y="13" font-size="7" fill="#AA44FF">✦</text>
        <text x="39" y="11" font-size="7" fill="#CC88FF">✦</text>
      </svg>`,
      sad:`<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="30" cy="40" rx="16" ry="13" fill="#AAAAAA"/>
        <ellipse cx="21" cy="23" rx="4" ry="8" fill="#AAAAAA" transform="rotate(10,21,23)"/>
        <ellipse cx="39" cy="23" rx="4" ry="8" fill="#AAAAAA" transform="rotate(-10,39,23)"/>
        <ellipse cx="21" cy="23" rx="2" ry="4.5" fill="#FFB0CC" transform="rotate(10,21,23)"/>
        <ellipse cx="39" cy="23" rx="2" ry="4.5" fill="#FFB0CC" transform="rotate(-10,39,23)"/>
        <ellipse cx="30" cy="34" rx="12" ry="12" fill="#BBBBBB"/>
        <path d="M23 31 Q27 34 31 31" fill="none" stroke="#AA44FF" stroke-width="1.5"/>
        <path d="M29 31 Q33 34 37 31" fill="none" stroke="#AA44FF" stroke-width="1.5"/>
        <ellipse cx="30" cy="37" rx="2.5" ry="1.8" fill="#FFB0B0"/>
        <path d="M26 40 Q30 37 34 40" stroke="#999" stroke-width="1.2" fill="none"/>
        <circle cx="30" cy="22" r="3" fill="#AA44FF" opacity="0.4"/>
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

              {/* Pet preview or emoji */}
              {tab==="pets" ? (
                <div style={{width:56,height:56,margin:"0 auto 8px"}}>
                  <div dangerouslySetInnerHTML={{__html:getPetArt(item.id,"idle","#9933cc")}}/>
                </div>
              ) : (
                <div style={{fontSize:32,marginBottom:8}}>{item.emoji}</div>
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

function StartScreen({difficulty, onDiffChange, onStart, totalStars, unlockedCount, crystals, appData, updateData}) {
  const [showGallery, setShowGallery] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const diff = DIFF_CONFIG[difficulty];
  const nextUnlock = ALL_CHARACTERS.find(c=>c.unlockAt>totalStars&&c.unlockAt>0);
  if(showGallery) return (
    <CharacterGallery unlockedCount={unlockedCount} totalStars={totalStars} onClose={()=>setShowGallery(false)}/>
  );
  if(showShop) return (
    <CrystalShop appData={appData} updateData={updateData} onClose={()=>setShowShop(false)}/>
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
  const [sessionCrystals,setSessionCrystals] = useState(0);
  const [hintsThisSession,setHintsThisSession] = useState(0);
  const [crystalPopup,setCrystalPopup] = useState(null);

  const muted = appData.muted;

  // Save appData whenever it changes
  useEffect(()=>{ saveData(appData); },[appData]);

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

  if(screen==='start') return (
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
