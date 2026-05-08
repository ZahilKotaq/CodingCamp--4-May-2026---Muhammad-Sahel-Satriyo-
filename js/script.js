/* ════════════════════════════════
   THEME TOGGLE (LIGHT / DARK)
════════════════════════════════ */
function toggleTheme() {
  document.body.classList.toggle('light-mode');
  const isLight = document.body.classList.contains('light-mode');
  localStorage.setItem('dashboard_theme', isLight ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
}

// Cek tema yang tersimpan saat halaman dimuat
if (localStorage.getItem('dashboard_theme') === 'light') {
  document.body.classList.add('light-mode');
  document.getElementById('theme-toggle').textContent = '🌙 Dark Mode';
}
/* ════════════════════════════════
     CLOCK
  ════════════════════════════════ */
  const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    document.getElementById('time').textContent = `${h}:${m}:${s}`;
    document.getElementById('date').textContent =
      `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

    const hr = now.getHours();
    let greet = hr < 12 ? '☀️ Good morning!' : hr < 17 ? '🌤 Good afternoon!' : '🌙 Good evening!';
    document.getElementById('greeting').textContent = greet;
  }

  setInterval(updateClock, 1000);
  updateClock();


  /* ════════════════════════════════
     TO-DO LIST
  ════════════════════════════════ */
/* ════════════════════════════════
     TO-DO LIST
  ════════════════════════════════ */
  let todos = JSON.parse(localStorage.getItem('dashboard_todos') || '[]');

  function saveTodos() {
    localStorage.setItem('dashboard_todos', JSON.stringify(todos));
  }

  function renderTodos() {
    const list = document.getElementById('todo-list');
    const sortSelect = document.getElementById('todo-sort');
    const sortValue = sortSelect ? sortSelect.value : 'all'; // Mengambil nilai urutan
    list.innerHTML = '';

    // Kita menggunakan perulangan biasa agar 'index' aslinya tidak berubah
    todos.forEach((t, index) => {
      // Fitur 3: Menyaring tugas dengan cara menyembunyikan yang tidak sesuai
      if (sortValue === 'pending' && t.done) return; // Abaikan yang sudah selesai
      if (sortValue === 'done' && !t.done) return;   // Abaikan yang belum selesai

      const li = document.createElement('li');
      li.className = 'todo-item' + (t.done ? ' done' : '');

      const check = document.createElement('div');
      check.className = 'todo-check';
      check.title = t.done ? 'Mark undone' : 'Mark done';
      check.onclick = () => toggleTodo(index); // Menggunakan index asli yang aman

      const span = document.createElement('span');
      span.className = 'todo-text';
      span.textContent = t.text;

      const del = document.createElement('button');
      del.className = 'btn btn-sm btn-danger';
      del.textContent = '✕';
      del.title = 'Delete';
      del.onclick = () => deleteTodo(index); // Menggunakan index asli yang aman

      li.appendChild(check);
      li.appendChild(span);
      li.appendChild(del);
      list.appendChild(li);
    });

    const total = todos.length;
    const done  = todos.filter(t => t.done).length;
    document.getElementById('todo-count').textContent =
      total === 0 ? 'No tasks yet' : `${done}/${total} done`;
  }

  function addTodo() {
    const input = document.getElementById('todo-input');
    const text  = input.value.trim();
    if (!text) return;

    // Fitur 2: Mencegah Duplikat Tugas
    const isDuplicate = todos.some(t => t.text.toLowerCase() === text.toLowerCase());
    if (isDuplicate) {
      alert('Tugas ini sudah ada di daftarmu! Coba masukkan tugas yang lain.');
      return;
    }

    todos.unshift({ text, done: false });
    saveTodos();
    renderTodos();
    input.value = '';
    input.focus();
  }

  function toggleTodo(i) {
    todos[i].done = !todos[i].done;
    saveTodos();
    renderTodos();
  }

  function deleteTodo(i) {
    todos.splice(i, 1);
    saveTodos();
    renderTodos();
  }

  function clearDone() {
    todos = todos.filter(t => !t.done);
    saveTodos();
    renderTodos();
  }

  document.getElementById('todo-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTodo();
  });

  renderTodos();
  /* ════════════════════════════════
     FOCUS TIMER
  ════════════════════════════════ */
  let timerTotal    = 25 * 60;   // seconds
  let timerLeft     = timerTotal;
  let timerRunning  = false;
  let timerInterval = null;
  let timerLabelText = 'Focus session';

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  }

  function updateTimerUI() {
    const el = document.getElementById('timer-time');
    el.textContent = formatTime(timerLeft);

    // Color based on label
    el.className = '';
    if (timerLabelText.toLowerCase().includes('break')) el.classList.add('break');
    else if (timerLeft === 0) el.classList.add('overtime');

    // Progress bar
    const pct = timerTotal > 0 ? (timerLeft / timerTotal) * 100 : 0;
    document.getElementById('timer-progress').style.width = pct + '%';
    document.getElementById('timer-label').textContent = timerLabelText;
  }

  function timerToggle() {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('timer-start-btn').textContent = '▶ Resume';
    } else {
      if (timerLeft === 0) timerReset();
      timerRunning = true;
      document.getElementById('timer-start-btn').textContent = '⏸ Pause';
      timerInterval = setInterval(() => {
        if (timerLeft > 0) {
          timerLeft--;
          updateTimerUI();
        } else {
          clearInterval(timerInterval);
          timerRunning = false;
          document.getElementById('timer-start-btn').textContent = '▶ Start';
          document.title = '⏰ Time\'s up! — Life Dashboard';
          // Simple beep via AudioContext
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [0, 0.3, 0.6].forEach(delay => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain); gain.connect(ctx.destination);
              osc.frequency.value = 880;
              gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
              osc.start(ctx.currentTime + delay);
              osc.stop(ctx.currentTime + delay + 0.25);
            });
          } catch(e) {}
          setTimeout(() => { document.title = 'Life Dashboard'; }, 5000);
        }
      }, 1000);
    }
  }

  function timerReset() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerLeft = timerTotal;
    document.getElementById('timer-start-btn').textContent = '▶ Start';
    updateTimerUI();
  }

  function setPreset(minutes, label, btn) {
    timerTotal = minutes * 60;
    timerLabelText = label;
    timerReset();
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  updateTimerUI();


  /* ════════════════════════════════
     QUICK LINKS
  ════════════════════════════════ */
  const DEFAULT_LINKS = [
    { name: 'Google',   url: 'https://google.com' },
    { name: 'GitHub',   url: 'https://github.com' },
    { name: 'YouTube',  url: 'https://youtube.com' },
    { name: 'Gmail',    url: 'https://mail.google.com' },
    { name: 'Calendar', url: 'https://calendar.google.com' },
  ];

  let links = JSON.parse(localStorage.getItem('dashboard_links') || 'null');
  if (!links) links = DEFAULT_LINKS;

  function saveLinks() {
    localStorage.setItem('dashboard_links', JSON.stringify(links));
  }

  function getFaviconUrl(url) {
    try {
      const domain = new URL(url).origin;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch { return ''; }
  }

  function renderLinks() {
    const grid = document.getElementById('links-grid');
    grid.innerHTML = '';
    links.forEach((l, i) => {
      const a = document.createElement('a');
      a.className = 'link-item';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';

      const img = document.createElement('img');
      img.className = 'link-favicon';
      img.src = getFaviconUrl(l.url);
      img.alt = '';
      img.onerror = () => { img.style.display = 'none'; };

      const name = document.createElement('span');
      name.textContent = l.name;

      const del = document.createElement('button');
      del.className = 'link-delete';
      del.textContent = '✕';
      del.title = 'Remove';
      del.onclick = (e) => { e.preventDefault(); deleteLink(i); };

      a.appendChild(img);
      a.appendChild(name);
      a.appendChild(del);
      grid.appendChild(a);
    });
  }

  function addLink() {
    const nameEl = document.getElementById('link-name');
    const urlEl  = document.getElementById('link-url');
    let name = nameEl.value.trim();
    let url  = urlEl.value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
    if (!name) {
      try { name = new URL(url).hostname.replace('www.',''); } catch { name = url; }
    }
    links.push({ name, url });
    saveLinks();
    renderLinks();
    nameEl.value = '';
    urlEl.value  = '';
    nameEl.focus();
  }

  function deleteLink(i) {
    links.splice(i, 1);
    saveLinks();
    renderLinks();
  }

  document.getElementById('link-url').addEventListener('keydown', e => {
    if (e.key === 'Enter') addLink();
  });

  renderLinks();