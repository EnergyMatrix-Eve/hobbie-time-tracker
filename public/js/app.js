// =============================================================
// Hobbies Time Tracker — front-end logic
//
// Flow:  Welcome screen (enter your name)  →  Tracker screen
//
// What works now:  name entry, typewriter dialogue, circle-wipe
//                  screen transitions, hobby picker, placeholder
//                  API data (health check + hobby log).
// Coming next:     real timer (start / pause / stop), saving the
//                  player and sessions to the database.
// =============================================================

// ---------- DOM references ----------
const $ = (selector) => document.querySelector(selector);

const welcomeScreen  = $('#screen-welcome');
const trackerScreen  = $('#screen-tracker');
const dialogue       = $('.dialogue');
const welcomeLine    = $('#welcome-line');
const welcomeLineSr  = $('#welcome-line-sr');
const nameForm       = $('#name-form');
const nameInput      = $('#player-name');
const nameButton     = $('#name-form button');
const curtain        = $('#transition');

const apiStatus      = $('#api-status');
const btnSwitch      = $('#btn-switch');
const greeting       = $('#greeting');
const playerGreeting = $('#player-greeting');
const hobbySelect    = $('#hobby-select');
const hobbyForm      = $('#hobby-form');
const hobbyInput     = $('#hobby-name');
const hobbyEmoji     = $('.hobby-emoji');
const stageCaption   = $('#stage-caption');
const timerDisplay   = $('#timer-display');
const encouragement  = $('#encouragement');
const totalsBody     = $('#totals-body');
const finishDialog   = $('#finish-dialog');
const finishName     = $('#finish-name');
const finishTime     = $('#finish-time');
const btnStart       = $('#btn-start');
const btnPause       = $('#btn-pause');
const btnStop        = $('#btn-stop');

// Live check of the OS "reduce motion" setting
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Emoji shown on the island for each hobby (custom hobbies get a star)
const HOBBY_EMOJI = { Guitar: '🎸', Painting: '🎨', Running: '🏃', Reading: '📚' };

// ---------- App state ----------
const player = { name: '' };

// ---------- Helpers ----------

// fetch() wrapper: sends/receives JSON and throws on HTTP errors.
async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? `Request failed: ${response.status}`);
  return data;
}

// 3725 → "01:02:05"
function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Centre point of an element, used as the starting point of the circle wipe.
function centerOf(element) {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

function showMessage(text) {
  encouragement.textContent = text;
}

// ---------- Typewriter dialogue ----------
// Each call to say() bumps `typingRun`; an older line still typing sees
// the number change and stops, so lines never overlap.
let typingRun = 0;

async function say(text, { speed = 28 } = {}) {
  const run = ++typingRun;
  welcomeLineSr.textContent = text; // screen readers get the full line at once

  if (reduceMotion.matches) {
    welcomeLine.textContent = text;
    return;
  }

  const chars = Array.from(text); // splits by character, safe for emoji and non-Latin names
  for (let i = 1; i <= chars.length; i++) {
    if (run !== typingRun) return;
    welcomeLine.textContent = chars.slice(0, i).join('');
    // Pause a little longer after punctuation, like a game character talking
    await wait('.!?…,'.includes(chars[i - 1]) ? speed * 6 : speed);
  }
}

function shake(element) {
  if (reduceMotion.matches) return;
  element.animate(
    [{ translate: '0 0' }, { translate: '-12px 0' }, { translate: '10px 0' },
     { translate: '-6px 0' }, { translate: '4px 0' }, { translate: '0 0' }],
    { duration: 450, easing: 'ease-in-out' },
  );
}

// ---------- Screen transition (circle wipe) ----------
// 1. A green circle grows from `origin` until it covers the screen.
// 2. Behind it, the screens swap.
// 3. The circle shrinks into the centre, revealing the new screen.
const WIPE = { duration: 650, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' };

async function switchScreen(from, to, origin) {
  if (reduceMotion.matches) {
    from.hidden = true;
    to.hidden = false;
    return;
  }

  const { x, y } = origin ?? { x: innerWidth / 2, y: innerHeight / 2 };
  curtain.classList.add('is-active');

  const cover = curtain.animate(
    [{ clipPath: `circle(0% at ${x}px ${y}px)` }, { clipPath: `circle(150% at ${x}px ${y}px)` }],
    WIPE,
  );
  await cover.finished;

  from.hidden = true;
  to.hidden = false;
  window.scrollTo(0, 0);
  await wait(200);

  const reveal = curtain.animate(
    [{ clipPath: 'circle(150% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }],
    WIPE,
  );
  await reveal.finished;

  // Tidy up so finished animations don't pile up on the element
  cover.cancel();
  reveal.cancel();
  curtain.classList.remove('is-active');
}

// ---------- Welcome screen ----------

function setNameFormEnabled(enabled) {
  nameInput.disabled = !enabled;
  nameButton.disabled = !enabled;
}

nameForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the browser reloading the page

  const name = nameInput.value.trim().replace(/\s+/g, ' ');
  if (!name) {
    shake(dialogue);
    say("Hmm? I didn't quite catch that… What's your name?");
    nameInput.focus();
    return;
  }

  player.name = name;
  // TODO (API step): POST /api/entrants { name } to create or find this player.

  setNameFormEnabled(false);
  await say(`${name}! What a lovely name. Let's go track some hobbies!`);
  await wait(800);

  playerGreeting.textContent = name;
  finishName.textContent = name;
  showMessage(`Pick a hobby and press Start, ${name}. I'll cheer you on!`);

  await switchScreen(welcomeScreen, trackerScreen, centerOf(nameButton));
  greeting.focus(); // move keyboard/screen-reader focus to the new screen
});

btnSwitch.addEventListener('click', async () => {
  btnSwitch.disabled = true; // ignore double-clicks while the wipe runs
  player.name = '';
  nameInput.value = '';
  setNameFormEnabled(true);
  welcomeLine.textContent = '';

  await switchScreen(trackerScreen, welcomeScreen, centerOf(btnSwitch));
  btnSwitch.disabled = false;
  nameInput.focus();
  say("Welcome back! Who's tracking time now?");
});

// ---------- Tracker screen ----------

hobbySelect.addEventListener('change', () => {
  const hobby = hobbySelect.value;
  hobbyEmoji.textContent = hobby ? (HOBBY_EMOJI[hobby] ?? '⭐') : '🌱';
  stageCaption.textContent = hobby ? `${hobby} time!` : 'Pick a hobby to begin';

  if (!reduceMotion.matches) {
    hobbyEmoji.animate([{ scale: 0.3 }, { scale: 1.25 }, { scale: 1 }], { duration: 450, easing: 'ease-out' });
  }
});

hobbyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = hobbyInput.value.trim();
  if (!name) {
    hobbyInput.focus();
    return;
  }

  try {
    const result = await api('/api/hobbie', { method: 'POST', body: JSON.stringify({ name }) });
    console.log('POST /api/hobbie →', result);
  } catch (error) {
    console.error(error);
    showMessage("Oops, I couldn't reach the island server. Is it running?");
    return;
  }

  // Add it to the dropdown (unless it's already there) and select it.
  const existing = [...hobbySelect.options].find((o) => o.value.toLowerCase() === name.toLowerCase());
  if (!existing) hobbySelect.add(new Option(name, name));
  hobbySelect.value = existing?.value ?? name;
  hobbySelect.dispatchEvent(new Event('change'));

  showMessage(`Ooh, ${name}! Great choice. (Placeholder: not saved to the database yet.)`);
  hobbyInput.value = '';
});

// TODO (timer step): real timer logic with setInterval, pause/resume, and POST the finished session.
btnStart.addEventListener('click', () => {
  showMessage(`Placeholder: the timer will start here. You've got this, ${player.name}!`);
});

btnPause.addEventListener('click', () => {
  showMessage('Placeholder: the timer will pause here. Take a breather!');
});

btnStop.addEventListener('click', () => {
  finishTime.textContent = timerDisplay.textContent;
  finishDialog.showModal(); // preview of the "cool finish display"
});

// ---------- Loaders (GET) ----------

async function checkHealth() {
  try {
    const health = await api('/api/health');
    apiStatus.textContent = 'Island server online';
    apiStatus.title = `Database tables: ${health.tables.join(', ')}`;
    apiStatus.className = 'status-pill ok';
  } catch (error) {
    apiStatus.textContent = 'Island server offline';
    apiStatus.className = 'status-pill error';
    console.error(error);
  }
}

async function loadTotals() {
  const totals = await api('/api/time');
  totalsBody.replaceChildren(
    ...totals.map((row) => {
      const tr = document.createElement('tr');
      for (const value of [row.entrant, row.hobby, formatDuration(row.total_seconds)]) {
        const td = document.createElement('td');
        td.textContent = value; // textContent (not innerHTML) keeps user input from being run as HTML
        tr.append(td);
      }
      return tr;
    }),
  );
}

// ---------- Start-up ----------
checkHealth();
loadTotals().catch(console.error);

// Let the dialogue box pop up before the guide starts talking
// (skip the intro if the player already submitted a name in the meantime).
await wait(reduceMotion.matches ? 0 : 700);
if (typingRun === 0) {
  say("Oh! Hello there, and welcome to Hobby Island! Before we begin… what's your name?");
}
