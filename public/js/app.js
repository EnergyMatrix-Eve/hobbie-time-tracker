// =============================================================
// Hobbies Time Tracker — front-end logic (boilerplate)
//
// What works now:  calls every API endpoint and renders the
//                  placeholder data the server sends back.
// Coming next:     real timer (start / pause / stop), saving
//                  sessions, hobby animations, encouragement.
// =============================================================

// ---------- DOM references ----------
const apiStatus      = document.querySelector('#api-status');
const entrantList    = document.querySelector('#entrant-list');
const entrantForm    = document.querySelector('#entrant-form');
const entrantInput   = document.querySelector('#entrant-name');
const hobbySelect    = document.querySelector('#hobby-select');
const hobbyForm      = document.querySelector('#hobby-form');
const hobbyInput     = document.querySelector('#hobby-name');
const hobbyEmoji     = document.querySelector('.hobby-emoji');
const timerDisplay   = document.querySelector('#timer-display');
const encouragement  = document.querySelector('#encouragement');
const totalsBody     = document.querySelector('#totals-body');
const finishDialog   = document.querySelector('#finish-dialog');
const finishTime     = document.querySelector('#finish-time');
const btnStart       = document.querySelector('#btn-start');
const btnPause       = document.querySelector('#btn-pause');
const btnStop        = document.querySelector('#btn-stop');

// Placeholder emoji per hobby — will become the "hobby animation".
const HOBBY_EMOJI = { Guitar: '🎸', Painting: '🎨', Running: '🏃', Reading: '📚' };

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

function showMessage(text) {
  encouragement.textContent = text;
}

// ---------- Loaders (GET) ----------

async function checkHealth() {
  try {
    const health = await api('/api/health');
    apiStatus.textContent = `Server OK · DB tables: ${health.tables.join(', ')}`;
    apiStatus.className = 'status-badge ok';
  } catch (error) {
    apiStatus.textContent = 'Server not reachable';
    apiStatus.className = 'status-badge error';
    console.error(error);
  }
}

async function loadEntrants() {
  const entrants = await api('/api/entrants');
  entrantList.replaceChildren(
    ...entrants.map((entrant) => {
      const li = document.createElement('li');
      li.textContent = entrant.name; // textContent (not innerHTML) keeps user input from being run as HTML
      li.dataset.id = entrant.id;
      return li;
    }),
  );
}

async function loadTotals() {
  const totals = await api('/api/time');
  totalsBody.replaceChildren(
    ...totals.map((row) => {
      const tr = document.createElement('tr');
      for (const value of [row.entrant, row.hobby, formatDuration(row.total_seconds)]) {
        const td = document.createElement('td');
        td.textContent = value;
        tr.append(td);
      }
      return tr;
    }),
  );
}

// ---------- Event handlers ----------

// Click an entrant to select it.
entrantList.addEventListener('click', (event) => {
  const li = event.target.closest('li');
  if (!li) return;
  entrantList.querySelectorAll('li').forEach((item) => item.classList.remove('selected'));
  li.classList.add('selected');
});

entrantForm.addEventListener('submit', async (event) => {
  event.preventDefault(); // stop the browser reloading the page
  const result = await api('/api/entrants', {
    method: 'POST',
    body: JSON.stringify({ name: entrantInput.value.trim() }),
  });
  console.log('POST /api/entrants →', result);
  showMessage(result.message);
  entrantInput.value = '';
});

hobbyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const result = await api('/api/hobbie', {
    method: 'POST',
    body: JSON.stringify({ name: hobbyInput.value.trim() }),
  });
  console.log('POST /api/hobbie →', result);
  showMessage(result.message);
  hobbyInput.value = '';
});

hobbySelect.addEventListener('change', () => {
  hobbyEmoji.textContent = HOBBY_EMOJI[hobbySelect.value] ?? '✨';
});

// TODO: real timer logic (setInterval, pause/resume, POST the finished session).
btnStart.addEventListener('click', () => {
  showMessage('Placeholder: the timer will start here ▶');
});

btnPause.addEventListener('click', () => {
  showMessage('Placeholder: the timer will pause here ⏸');
});

btnStop.addEventListener('click', () => {
  finishTime.textContent = timerDisplay.textContent;
  finishDialog.showModal(); // preview of the "cool finish display"
});

// ---------- Start-up ----------
checkHealth();
loadEntrants().catch(console.error);
loadTotals().catch(console.error);
