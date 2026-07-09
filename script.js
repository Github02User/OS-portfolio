// ── BOOT ──
const bootMessages = [
  'Loading kernel...', 'Mounting filesystem...', 'Initializing UI...',
  'Loading portfolio data...', 'Starting HammadOS...'
];
let bootProgress = 0;
const bootBar = document.getElementById('bootBar');
const bootStatus = document.getElementById('bootStatus');

function bootStep() {
  if (bootProgress >= 100) {
    document.getElementById('boot').style.opacity = '0';
    setTimeout(() => {
      document.getElementById('boot').style.display = 'none';
      showWelcomeNotif();
      // Auto-open about window
      setTimeout(() => openWindow('about'), 400);
      setTimeout(() => openWindow('terminal'), 800);
    }, 500);
    return;
  }
  bootProgress += Math.random() * 18 + 4;
  bootProgress = Math.min(bootProgress, 100);
  bootBar.style.width = bootProgress + '%';
  const msgIdx = Math.floor((bootProgress / 100) * bootMessages.length);
  bootStatus.textContent = bootMessages[Math.min(msgIdx, bootMessages.length - 1)];
  setTimeout(bootStep, 120 + Math.random() * 100);
}

// called after all functions defined below

function showWelcomeNotif() {
  notify('👋', 'Welcome to HammadOS!', 'Double-click icons or use the taskbar to explore.');
}

// ── WINDOW MANAGEMENT ──
let zCounter = 200;
const windowState = { about: false, projects: false, skills: false, experience: false, terminal: false };
const windowSaved = {};

function openWindow(name) {
  const win = document.getElementById('win-' + name);
  if (!win) return;
  win.style.display = 'flex';
  win.classList.remove('minimized');
  bringToFront(win);
  windowState[name] = true;
  updateTaskbar(name, true);

  if (name === 'skills') setTimeout(animateSkillBars, 150);
  if (name === 'terminal') setTimeout(runTerminal, 150);
}

function closeWindow(name) {
  const win = document.getElementById('win-' + name);
  if (!win) return;
  win.style.display = 'none';
  windowState[name] = false;
  updateTaskbar(name, false);
}

function minimizeWindow(name) {
  const win = document.getElementById('win-' + name);
  if (!win) return;
  win.style.display = 'none';
  updateTaskbar(name, false);
}

function maximizeWindow(name) {
  const win = document.getElementById('win-' + name);
  if (!win) return;
  if (win.dataset.maximized === 'true') {
    const s = windowSaved[name];
    if (s) { win.style.left = s.left; win.style.top = s.top; win.style.width = s.width; win.style.height = s.height; }
    win.dataset.maximized = 'false';
  } else {
    windowSaved[name] = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height };
    win.style.left = '0px'; win.style.top = '0px';
    win.style.width = '100vw'; win.style.height = 'calc(100vh - 48px)';
    win.dataset.maximized = 'true';
  }
}

function toggleWindow(name) {
  const win = document.getElementById('win-' + name);
  if (!win) return;
  if (!win.style.display || win.style.display === 'none') {
    openWindow(name);
  } else {
    minimizeWindow(name);
  }
}

function bringToFront(win) {
  if (!win) return;
  zCounter++;
  win.style.zIndex = zCounter;
  document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
  win.classList.add('active');
}

function updateTaskbar(name, isOpen) {
  const tb = document.getElementById('tb-' + name);
  if (!tb) return;
  tb.classList.toggle('open', isOpen);
}

function openAllWindows() {
  ['about', 'projects', 'skills', 'experience', 'terminal'].forEach((n, i) => {
    setTimeout(() => openWindow(n), i * 150);
  });
  hideContextMenu();
}

function closeAllWindows() {
  ['about', 'projects', 'skills', 'experience', 'terminal'].forEach(n => closeWindow(n));
  hideContextMenu();
}

// Click on desktop closes context menu, deselects icons
document.getElementById('desktop').addEventListener('click', () => {
  hideContextMenu();
  document.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('selected'));
});

document.getElementById('desktop').addEventListener('dblclick', hideContextMenu);

// ── DRAG ──
let dragging = null, dragOffX = 0, dragOffY = 0;

function startDrag(e, name) {
  if (e.target.classList.contains('win-btn')) return;
  const win = document.getElementById('win-' + name);
  if (!win) return;
  bringToFront(win);
  dragging = win;
  const rect = win.getBoundingClientRect();
  dragOffX = e.clientX - rect.left;
  dragOffY = e.clientY - rect.top;
  e.preventDefault();
}

document.addEventListener('mousemove', e => {
  if (dragging) {
    let x = e.clientX - dragOffX;
    let y = e.clientY - dragOffY;
    x = Math.max(0, Math.min(x, window.innerWidth - dragging.offsetWidth));
    y = Math.max(0, Math.min(y, window.innerHeight - 48 - dragging.offsetHeight));
    dragging.style.left = x + 'px';
    dragging.style.top = y + 'px';
  }
  if (resizing) {
    const w = Math.max(320, e.clientX - resizing.getBoundingClientRect().left);
    const h = Math.max(200, e.clientY - resizing.getBoundingClientRect().top);
    resizing.style.width = w + 'px';
    resizing.style.height = h + 'px';
  }
});

document.addEventListener('mouseup', () => { dragging = null; resizing = null; });

// ── RESIZE ──
let resizing = null;
function startResize(e, name) {
  resizing = document.getElementById('win-' + name);
  e.preventDefault();
  e.stopPropagation();
}

// ── ICON SELECT ──
function selectIcon(el) {
  document.querySelectorAll('.desk-icon').forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
}

// ── CONTEXT MENU ──
document.getElementById('desktop').addEventListener('contextmenu', e => {
  e.preventDefault();
  const menu = document.getElementById('contextMenu');
  menu.style.display = 'block';
  menu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
  menu.style.top = Math.min(e.clientY, window.innerHeight - 130) + 'px';
});

function hideContextMenu() {
  document.getElementById('contextMenu').style.display = 'none';
}

document.addEventListener('click', hideContextMenu);

// ── CLOCK ──
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${h}:${m}`;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('clockDate').textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
}
updateClock();
setInterval(updateClock, 30000);

// ── SKILL BARS ──
let barsAnimated = false;
function animateSkillBars() {
  if (barsAnimated) return;
  barsAnimated = true;
  setTimeout(() => {
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.pct + '%';
    });
  }, 100);
}

// ── NOTIFICATIONS ──
let notifTimeout;
function notify(icon, title, msg) {
  const existing = document.querySelector('.notif');
  if (existing) existing.remove();

  const n = document.createElement('div');
  n.className = 'notif';
  n.innerHTML = `<div class="notif-icon">${icon}</div><div><div class="notif-title">${title}</div><div class="notif-msg">${msg}</div></div>`;
  document.body.appendChild(n);

  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => { if (n.parentNode) n.remove(); }, 3000);
}

// ── TERMINAL ──
let terminalDone = false;

function runTerminal() {
  if (terminalDone) return;
  terminalDone = true;

  const content = document.getElementById('term-content');
  content.innerHTML = '';

  const lines = [
    { delay: 0,    type: 'prompt', text: 'hammad@portfolioOS:~$ ', cmd: 'whoami' },
    { delay: 600,  type: 'output', text: 'Hammad Abdul Ghaffar — Web Developer & CS Student' },
    { delay: 1200, type: 'prompt', text: 'hammad@portfolioOS:~$ ', cmd: 'cat skills.txt' },
    { delay: 1800, type: 'highlight', text: '→ Frontend: HTML, CSS, JS, Bootstrap' },
    { delay: 2000, type: 'highlight', text: '→ Backend:  PHP, AJAX' },
    { delay: 2200, type: 'highlight', text: '→ Database: MySQL' },
    { delay: 2400, type: 'highlight', text: '→ Tools:    Git, XAMPP, VS Code' },
    { delay: 3000, type: 'prompt', text: 'hammad@portfolioOS:~$ ', cmd: 'ls projects/' },
    { delay: 3600, type: 'success', text: 'ReadRover/    PortfolioOS/    WeatherApp/    TodoList/' },
    { delay: 4200, type: 'prompt', text: 'hammad@portfolioOS:~$ ', cmd: 'echo $STATUS' },
    { delay: 4800, type: 'success', text: '✓ Open to opportunities · Based in Karachi, PK' },
    { delay: 5400, type: 'prompt', text: 'hammad@portfolioOS:~$ ', cmd: '' },
    { delay: 5400, type: 'cursor', text: '' },
  ];

  lines.forEach(line => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'term-line';

      if (line.type === 'prompt') {
        div.innerHTML = `<span class="term-prompt">${line.text}</span><span class="term-cmd">${line.cmd}</span>`;
      } else if (line.type === 'output') {
        div.innerHTML = `<span class="term-output">${line.text}</span>`;
      } else if (line.type === 'highlight') {
        div.innerHTML = `<span class="term-highlight">${line.text}</span>`;
      } else if (line.type === 'success') {
        div.innerHTML = `<span class="term-success">${line.text}</span>`;
      } else if (line.type === 'cursor') {
        div.innerHTML = `<span class="term-prompt">hammad@portfolioOS:~$ </span><span class="term-cursor"></span>`;
      }

      content.appendChild(div);
      const body = document.getElementById('term-body');
      body.scrollTop = body.scrollHeight;
    }, line.delay);
  });
}

// bring window to front on click
document.querySelectorAll('.window').forEach(win => {
  if (win) win.addEventListener('mousedown', () => bringToFront(win));
});
document.addEventListener('touchmove', e => {
  const touch = e.touches[0];
  // same logic as mousemove using touch.clientX/clientY
}, { passive: false });
// Start boot
setTimeout(bootStep, 200);
