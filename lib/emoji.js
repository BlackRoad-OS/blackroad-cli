// BlackRoad OS Emoji Language 🗣️
// Teaching computers to speak emoji fluently

export const emoji = {
  // Status & Health
  healthy: '💚',      // all good, vibin
  degraded: '💛',     // struggling but trying
  down: '💔',         // ded, RIP

  // Speed & Performance
  fast: '⚡',         // zoom zoom
  medium: '🐢',       // chuggin along
  slow: '🦥',         // uh oh

  // Actions
  deploy: '🚀',       // ship it!
  shipped: '🚢',      // it's out there
  building: '🔨',     // under construction
  checking: '🔍',     // investigating
  healing: '🩹',      // fixing boo-boos

  // Platforms
  railway: '🚂',      // choo choo
  cloudflare: '☁️',   // fluffy cloud
  github: '🐙',       // octopus friend

  // Outcomes
  success: '✅',      // nailed it
  fail: '💥',         // boom
  error: '😭',        // sad times
  warning: '⚠️',      // heads up

  // Health Check
  hospital: '🏥',     // health check time
  stethoscope: '🩺',  // listening closely
  strong: '💪',       // healthy boi
  sick: '🤒',         // not feeling great
  dead: '☠️',         // totally gone
  syringe: '💉',      // auto-heal time
  pill: '💊',         // medicine
  dna: '🧬',          // genetic healing

  // Misc
  sparkle: '✨',      // magic
  party: '🎉',        // celebration
  target: '🎯',       // hit the mark
  eyes: '👀',         // watching
  shrug: '🤷',        // idk
  fire: '🔥',         // either hot or burning down
  clock: '⏳',        // waiting
  refresh: '🔄',      // try again
  list: '📋',         // showing options
  package: '📦',      // bundled up
  send: '📤',         // uploading
  receive: '📥',      // downloading
  link: '🔗',         // connected
  lock: '🔐',         // secure
  key: '🔑',          // authentication
  robot: '🤖',        // automation
  brain: '🧠',        // AI/thinking
  lightning: '⚡',    // power/speed
  moon: '🌙',         // night mode
  sun: '☀️',          // day mode
  rainbow: '🌈',      // everything working
  skull: '💀',        // very dead
  hundred: '💯',      // perfect score
};

// Emoji sentences for fun
export const phrases = {
  allGood: '✨ 💚 🚀 💯',           // sparkling, healthy, launched, perfect
  deploying: '📦 ➡️ 🚂 ➡️ 🌐',      // package -> railway -> world
  buildFailed: '🔨 💥 😭',          // building exploded, sad
  healing: '🩹 💉 🧬 ✨',           // bandaid, shot, dna, magic
  investigating: '🔍 🤔 💭',        // searching, thinking, thought
  celebration: '🎉 🚀 💯 ✨',       // party, launched, perfect, sparkles
};

// Fun status messages
export const statusMessages = {
  healthy: [
    '💚 vibin',
    '✨ chillin',
    '🚀 cruisin',
    '💪 flexin',
  ],
  degraded: [
    '💛 struggling',
    '🐢 slow but alive',
    '😰 sweating',
    '🔧 needs help',
  ],
  down: [
    '💔 ded',
    '☠️ RIP',
    '🪦 gone',
    '💀 totally cooked',
  ],
};

// Random status message
export const getRandomStatus = (status) => {
  const messages = statusMessages[status] || statusMessages.healthy;
  return messages[Math.floor(Math.random() * messages.length)];
};
