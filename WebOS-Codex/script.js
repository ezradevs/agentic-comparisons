const windows = new Map();
const openState = new Map();
let zIndexSeed = 200;
let cascadeOffset = 0;
const CASCADE_STEP = 38;

const desktop = document.getElementById("desktop");
const startMenu = document.getElementById("startMenu");
const startButton = document.getElementById("startButton");
const taskbarTime = document.getElementById("taskbarTime");
const taskbarDate = document.getElementById("taskbarDate");
const widgetTime = document.getElementById("widgetTime");
const widgetDate = document.getElementById("widgetDate");
const notesArea = document.getElementById("notesArea");
const noteStatus = document.getElementById("noteStatus");
const saveNote = document.getElementById("saveNote");
const browserWindow = document.querySelector("[data-app='browser'] .browser-window");
const browserAddress = document.getElementById("browserAddress");
const browserContent = document.getElementById("browserContent");
const browserGo = document.getElementById("browserGo");
const browserTheme = document.getElementById("browserTheme");
const terminalOutput = document.getElementById("terminalOutput");
const terminalInput = document.getElementById("terminalInput");
const toggleWidgets = document.getElementById("toggleWidgets");
const desktopWidgets = document.getElementById("desktopWidgets");
const startSettings = document.getElementById("startSettings");

const taskbarIcons = Array.from(document.querySelectorAll(".taskbar-icon"));
const desktopIcons = Array.from(document.querySelectorAll(".desktop-icon"));
const startApps = Array.from(document.querySelectorAll(".start-app"));
const windowElements = Array.from(document.querySelectorAll(".window"));

const browserPages = {
  "https://aurora.os/home": `
    <article>
      <h1>Welcome to Aurora OS</h1>
      <p>Your productivity cockpit — explore boards, review design, and harmonize your day across focus-ready tools.</p>
      <section class="browser-cards">
        <div class="browser-card">
          <h2>Focus Flow</h2>
          <p>Craft deep work sessions with ambient timers and gentle nudges to stay in flow.</p>
        </div>
        <div class="browser-card">
          <h2>Spectrum Canvas</h2>
          <p>Curate inspiration, stash assets, and collaborate on visuals in one luminous space.</p>
        </div>
        <div class="browser-card">
          <h2>Launch Console</h2>
          <p>Monitor milestones, spotlight blockers, and celebrate ship-ready wins in real time.</p>
        </div>
      </section>
    </article>
  `,
  "https://aurora.os/tasks": `
    <article>
      <h1>Team Tasks</h1>
      <p>Today's plan automatically clusters around your energy peaks.</p>
      <section class="browser-cards">
        <div class="browser-card">
          <h2>09:00 · Stand-up</h2>
          <p>10 minute alignment with highlights, blockers, and next focus.</p>
        </div>
        <div class="browser-card">
          <h2>10:30 · Deep Work</h2>
          <p>Heads-down design iteration. Ambient mode engaged.</p>
        </div>
        <div class="browser-card">
          <h2>14:00 · Sync</h2>
          <p>Review motion prototypes with product and motion teams.</p>
        </div>
      </section>
    </article>
  `,
  "https://aurora.os/uplift": `
    <article>
      <h1>Mood Uplift</h1>
      <p>A curated stream of soundscapes, lighting presets, and positive cues.</p>
      <section class="browser-cards">
        <div class="browser-card">
          <h2>Chromatic Drift</h2>
          <p>Adaptive gradients that mirror your playlist's energy.</p>
        </div>
        <div class="browser-card">
          <h2>Focus Tones</h2>
          <p>Binaural mixes balanced for calm clarity and momentum.</p>
        </div>
        <div class="browser-card">
          <h2>Micro-celebrations</h2>
          <p>Micro-animations that fire after reaching checkpoints.</p>
        </div>
      </section>
    </article>
  `,
};

const terminalCommands = {
  help: () =>
    `Available commands:\n  help - list commands\n  about - discover Aurora OS\n  time - show current system time\n  clear - wipe the terminal view\n  open <app> - launch an app (notes, browser, music, terminal)`,
  about: () =>
    `Aurora OS // A concept desktop that blends focus, play, and polish. Crafted for this demo.`,
  time: () => new Date().toLocaleString(),
  clear: (container) => {
    container.innerHTML = "";
    return null;
  },
};

function init() {
  windowElements.forEach((win) => {
    const app = win.dataset.app;
    windows.set(app, win);
    openState.set(app, false);
    win.style.zIndex = ++zIndexSeed;
    hookWindowControls(win);
    enableDrag(win);
    win.addEventListener("mousedown", () => {
      if (win.getAttribute("aria-hidden") === "true") return;
      focusWindow(win);
    });
  });

  setInterval(updateClock, 1000);
  updateClock();

  loadNote();
  attachEvents();
  decorateBrowser();
  showToast("Aurora OS ready. Click an icon or tap the pulse button.");
}

function attachEvents() {
  startButton.addEventListener("click", toggleStartMenu);

  document.addEventListener("click", (event) => {
    if (
      !startMenu.classList.contains("hidden") &&
      !startMenu.contains(event.target) &&
      !startButton.contains(event.target)
    ) {
      hideStartMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideStartMenu();
    }
  });

  [...desktopIcons, ...startApps, ...taskbarIcons].forEach((button) => {
    button.addEventListener("click", () => {
      const app = button.dataset.app;

      if (button.classList.contains("start-app")) {
        hideStartMenu();
      }

      if (!windows.has(app)) {
        showToast(`${capitalize(app)} is coming soon.`);
        return;
      }

      const win = windows.get(app);
      const isHidden = win.getAttribute("aria-hidden") === "true";

      if (isHidden) {
        openWindow(app);
      } else {
        minimizeWindow(win);
      }
    });
  });

  saveNote?.addEventListener("click", persistNote);

  notesArea?.addEventListener("input", () => {
    noteStatus.textContent = "Unsaved changes";
  });

  browserGo?.addEventListener("click", () => {
    navigateBrowser(browserAddress.value);
  });

  browserAddress?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      navigateBrowser(browserAddress.value);
    }
  });

  document
    .querySelectorAll(".browser-btn[data-url]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        const url = button.dataset.url;
        browserAddress.value = url;
        navigateBrowser(url);
      })
    );

  browserTheme?.addEventListener("click", () => {
    browserWindow.classList.toggle("light-mode");
    browserTheme.textContent = browserWindow.classList.contains("light-mode")
      ? "☀"
      : "☾";
  });

  terminalInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      processTerminalCommand(event.currentTarget.value.trim());
      event.currentTarget.value = "";
    }
  });

  toggleWidgets?.addEventListener("click", () => {
    desktopWidgets.classList.toggle("hidden");
  });

  startSettings?.addEventListener("click", () => {
    showToast("Settings hub will arrive in the next build.");
  });
}

function hookWindowControls(win) {
  const closeBtn = win.querySelector(".window-close");
  const minimizeBtn = win.querySelector(".window-minimize");

  closeBtn?.addEventListener("click", () => hideWindow(win));
  minimizeBtn?.addEventListener("click", () => minimizeWindow(win));
}

function openWindow(app) {
  const win = windows.get(app);
  if (!win) return;

  const wasHidden = win.getAttribute("aria-hidden") === "true";

  hideStartMenu();

  win.setAttribute("aria-hidden", "false");
  win.dataset.minimized = "false";
  openState.set(app, true);

  if (wasHidden && !win.dataset.positioned) {
    const offset = cascadeOffset % 120;
    win.style.top = `calc(18vh + ${offset}px)`;
    win.style.left = `calc(18vw + ${offset}px)`;
    cascadeOffset += CASCADE_STEP;
    win.dataset.positioned = "true";
  }

  focusWindow(win);
  updateTaskbarIcon(app, true);
}

function hideWindow(win) {
  win.setAttribute("aria-hidden", "true");
  win.classList.remove("active");
  openState.set(win.dataset.app, false);
  updateTaskbarIcon(win.dataset.app, false);
}

function minimizeWindow(win) {
  win.dataset.minimized = "true";
  hideWindow(win);
}

function focusWindow(win) {
  windowElements.forEach((w) => w.classList.remove("active"));
  win.classList.add("active");
  win.style.zIndex = ++zIndexSeed;
  updateTaskbarIcon(win.dataset.app, true);
}

function enableDrag(win) {
  const header = win.querySelector(".window-header");
  if (!header) return;

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let pointerId = null;

  const onPointerMove = (event) => {
    if (!isDragging) return;
    const x = event.clientX - offsetX;
    const y = event.clientY - offsetY;
    const maxX = window.innerWidth - win.offsetWidth / 2;
    const maxY = window.innerHeight - 80;
    const clampedX = Math.min(Math.max(x, -win.offsetWidth / 2), maxX);
    const clampedY = Math.min(Math.max(y, 12), maxY);

    win.style.left = `${clampedX}px`;
    win.style.top = `${clampedY}px`;
  };

  const onPointerUp = () => {
    isDragging = false;
    if (pointerId !== null) {
      header.releasePointerCapture?.(pointerId);
      pointerId = null;
    }
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  header.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    if (win.getAttribute("aria-hidden") === "true") return;

    focusWindow(win);
    isDragging = true;
    pointerId = event.pointerId;
    const rect = win.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    header.setPointerCapture?.(pointerId);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  });
}

function updateTaskbarIcon(app, isActive) {
  const icon = taskbarIcons.find((btn) => btn.dataset.app === app);
  if (!icon) return;
  icon.classList.toggle("active", isActive);
}

function toggleStartMenu() {
  startMenu.classList.toggle("hidden");
  const expanded = !startMenu.classList.contains("hidden");
  startMenu.setAttribute("aria-hidden", (!expanded).toString());
}

function hideStartMenu() {
  startMenu.classList.add("hidden");
  startMenu.setAttribute("aria-hidden", "true");
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
  const fullDate = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  taskbarTime.textContent = time;
  taskbarDate.textContent = date;
  widgetTime.textContent = time;
  widgetDate.textContent = fullDate;
}

function loadNote() {
  if (!notesArea || !noteStatus) return;
  try {
    const stored = localStorage.getItem("aurora-note");
    if (stored) {
      notesArea.value = stored;
      noteStatus.textContent = "Saved";
    }
  } catch (error) {
    console.warn("Unable to load note", error);
  }
}

function persistNote() {
  if (!notesArea || !noteStatus) return;
  try {
    localStorage.setItem("aurora-note", notesArea.value);
    const savedAt = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    noteStatus.textContent = `Saved • ${savedAt}`;
    showToast("Notes snapshot saved locally.");
  } catch (error) {
    console.warn("Unable to save note", error);
    showToast("Saving failed. Storage may be disabled.");
  }
}

function navigateBrowser(url, options = {}) {
  const { silent = false } = options;
  const key = url.trim().toLowerCase();
  const content = browserPages[key];

  if (content) {
    browserContent.innerHTML = content;
    if (!silent) {
      showToast(`Loaded: ${key}`);
    }
  } else {
    browserContent.innerHTML = `
      <article>
        <h1>Address Not Found</h1>
        <p>We couldn't locate <strong>${escapeHtml(url)}</strong>. Try one of these destinations:</p>
        <ul>
          <li>https://aurora.os/home</li>
          <li>https://aurora.os/tasks</li>
          <li>https://aurora.os/uplift</li>
        </ul>
      </article>
    `;
  }
}

function decorateBrowser() {
  navigateBrowser(browserAddress.value, { silent: true });
}

function processTerminalCommand(raw) {
  if (!raw) return;
  appendTerminal(`aurora@os:~$ ${raw}`);
  const [cmd, ...rest] = raw.split(" ");
  const lower = cmd.toLowerCase();

  if (!terminalCommands[lower]) {
    if (lower === "open" && rest.length) {
      handleOpenCommand(rest.join(" "));
    } else {
      appendTerminal(`Command not recognized. Type \`help\` for options.`);
    }
    return;
  }

  if (lower === "clear") {
    terminalCommands.clear(terminalOutput);
    return;
  }

  const result = terminalCommands[lower]();
  if (result) appendTerminal(result);
}

function handleOpenCommand(appName) {
  const app = appName.trim().toLowerCase();
  if (!windows.has(app)) {
    appendTerminal(`App \"${app}\" unavailable.`);
    return;
  }
  openWindow(app);
  appendTerminal(`Launching ${app}...`);
}

function appendTerminal(message) {
  const line = document.createElement("pre");
  line.textContent = message;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTo({ top: terminalOutput.scrollHeight, behavior: "smooth" });
}

function showToast(message) {
  const container = getToastContainer();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("visible"));
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function getToastContainer() {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  return container;
}

function escapeHtml(input) {
  return input.replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function capitalize(input) {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

window.addEventListener("load", init);

