const storageKey = "runtime-rodeo-state-v1";
const roundSeconds = 60;
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
const audioEngine = {
  context: null,
  master: null
};

const icons = {
  rocket: svg("M5 15c2-6 6-10 14-12-2 8-6 12-12 14l-2 4-2-4-4-2 4-2Zm9-6 1 1M7 17l-4 4M12 19l-1 3"),
  shield: svg("M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Z"),
  flame: svg("M12 22c4 0 7-3 7-7 0-4-3-7-5-11-1 3-4 5-6 7-2 2-3 4-3 6 0 3 3 5 7 5Z"),
  gauge: svg("M4 14a8 8 0 1 1 16 0M12 14l4-4M7 17h10"),
  alert: svg("M12 3 2 21h20L12 3Zm0 6v5m0 3h.01"),
  play: svg("M8 5v14l11-7L8 5Z"),
  pause: svg("M8 5v14M16 5v14"),
  wrench: svg("M15 6a5 5 0 0 0-6 6L3 18l3 3 6-6a5 5 0 0 0 6-6l-3 3-3-3 3-3Z"),
  trophy: svg("M8 4h8v4a4 4 0 0 1-8 0V4Zm0 2H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 16v4m-4 0h8"),
  hammer: svg("M14 5 5 14l3 3 9-9m-8 8-5 5M13 4l7 7"),
  reset: svg("M3 12a9 9 0 1 0 3-7M3 4v6h6"),
  volume: svg("M4 10v4h4l5 4V6L8 10H4Zm12-1a4 4 0 0 1 0 6"),
  zap: svg("M13 2 4 14h7l-1 8 9-12h-7l1-8Z"),
  git: svg("M16 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 0v3a2 2 0 1 0 2 2M8 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 4v8"),
  db: svg("M4 6c0-2 4-3 8-3s8 1 8 3-4 3-8 3-8-1-8-3Zm0 0v12c0 2 4 3 8 3s8-1 8-3V6M4 12c0 2 4 3 8 3s8-1 8-3"),
  lock: svg("M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5V11Z"),
  bot: svg("M12 6V3m-6 8h12v8H6v-8Zm-2 3h2m12 0h2M9 15h.01M15 15h.01"),
  flask: svg("M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 16h8"),
  cloud: svg("M7 18h10a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0 1 10Z")
};

const defaultTeams = [
  { id: 1, name: "Stack Smashers", motto: "We read docs sometimes", score: 0, heat: 8, accent: "cyan" },
  { id: 2, name: "Null Pointers", motto: "It is probably DNS", score: 0, heat: 7, accent: "yellow" },
  { id: 3, name: "YAML Yellers", motto: "Add more indentation", score: 0, heat: 5, accent: "coral" },
  { id: 4, name: "Cache Me Outside", motto: "Invalidate and chill", score: 0, heat: 4, accent: "green" }
];

const incidents = [
  incident("The agent fixed CSS by deleting billing", "vibe-bot-9000", "catastrophic", "A cleanup prompt asked for less visual clutter. Revenue is now very minimal.", ["$ git commit -m \"cleanup\"", "$ deploy prod", "[ok] unused styles removed", "[warn] /app/billing removed", "[rip] finance started typing"], [["Rollback", "git", 2], ["Blame cache", "db", 7], ["Ship louder", "cloud", 9], ["Write evals", "flask", 4]]),
  incident("The MCP server got write access to the snack budget", "tools.allow_all", "expensive", "Every tool call is valid JSON. None of the receipts are emotionally valid.", ["$ mcp call purchase.snacks", "[ok] schema valid", "[ok] budget valid", "[fail] judgment not found", "[note] procurement joined the bridge"], [["Revoke token", "lock", 2], ["Add approval", "bot", 4], ["Buy GPUs", "cloud", 10], ["Rename line item", "db", 8]]),
  incident("The vector database remembers your internship code", "rag-pipeline", "haunted", "Search relevance improved 400%. Unfortunately, so did personal accountability.", ["$ embed ./legacy", "[ok] chunked 18,204 files", "[warn] TODO from 2019 retrieved", "[warn] manager has follow-up", "[ok] semantic dread indexed"], [["Re-chunk shame", "db", 5], ["Tune top-k", "flask", 4], ["Purge memory", "lock", 6], ["Call it context", "bot", 7]]),
  incident("CI passed because the tests ran in interpretive dance mode", "pipeline.yml", "expressive", "The build is green, the coverage is jazz, and staging is doing floor work.", ["$ npm test", "[skip] unit tests felt negative", "[ok] vibes acceptable", "[ok] cache restored from last Thursday", "[fail] physics"], [["Clear cache", "cloud", 3], ["Add one test", "flask", 2], ["Merge anyway", "git", 9], ["Blame timezone", "db", 8]]),
  incident("The eval suite only checks if the answer sounds confident", "evals-final-v4", "charismatic", "Accuracy is down, executive summaries are up, and every bug has great posture.", ["$ run evals", "[ok] confidence: 99%", "[warn] correctness: vibes", "[ok] markdown table produced", "[fail] table contains feelings"], [["Add goldens", "flask", 2], ["Lower voice", "bot", 4], ["Ship memo", "cloud", 7], ["Rotate prompt", "git", 6]]),
  incident("Someone fixed latency by deleting observability", "otel-lite", "invisible", "P95 looks incredible now that nobody can see it.", ["$ terraform apply", "[ok] dashboards removed", "[ok] alerts silenced", "[ok] latency unknowable", "[warn] customers still perceiving time"], [["Restore traces", "cloud", 3], ["Sample harder", "flask", 5], ["Trust vibes", "bot", 10], ["Archive chat", "lock", 8]]),
  incident("The migration script created a premium column in every table", "db-migrate", "enterprise", "The schema is monetized. The users are not.", ["$ migrate up", "[ok] users.premium added", "[ok] logs.premium added", "[ok] migrations.premium added", "[fail] invoice feelings"], [["Rollback", "git", 2], ["Patch SQL", "db", 4], ["Rename to tier", "bot", 6], ["Upsell indexes", "cloud", 9]]),
  incident("Secrets scanner found the CEO Wi-Fi password in a demo", "pre-commit", "spicy", "It was named FINAL_REAL_DO_NOT_SHARE and somehow still committed.", ["$ git push", "[blocked] secret detected", "[hint] rotate immediately", "[warn] demo recording exists", "[ok] panic initialized"], [["Rotate secrets", "lock", 1], ["Force push", "git", 10], ["Open incident", "cloud", 3], ["Call it honeytoken", "bot", 7]]),
  incident("The serverless function is cold because it saw the roadmap", "edge-runtime", "seasonal", "Startup time is now measured in standups.", ["$ curl /api/ready", "[wait] importing half the internet", "[wait] warming hope", "[ok] response: eventually", "[warn] user aged visibly"], [["Bundle audit", "flask", 3], ["Keep warm", "cloud", 4], ["More YAML", "git", 7], ["Add spinner", "bot", 9]]),
  incident("The prompt injection says it is the product manager now", "user-input", "ambitious", "It changed priorities, renamed the sprint, and requested budget for a second quarter.", ["$ sanitize input", "[warn] input sanitized sanitizer", "[ok] roadmap rewritten", "[warn] all tasks now urgent", "[fail] meeting spawned"], [["Escape text", "lock", 2], ["Tool firewall", "bot", 3], ["Promote it", "cloud", 8], ["A/B test panic", "flask", 6]]),
  incident("The design system shipped twelve shades of slightly guilty blue", "tokens.json", "brand-safe", "Everything is accessible except the reason this happened.", ["$ build tokens", "[ok] blue-500 created", "[ok] blue-501 created", "[ok] blue-501b created", "[warn] designer breathing slowly"], [["Prune tokens", "git", 3], ["Name them all", "bot", 6], ["Open board", "cloud", 5], ["Ship beige", "flask", 9]]),
  incident("The changelog says minor fixes and the diff is a lifestyle", "release-notes", "mysterious", "One bullet point. 4,912 lines. Zero eye contact.", ["$ git diff --stat", "[ok] 87 files changed", "[ok] minor fixes", "[warn] auth rewritten", "[fail] changelog emotionally unavailable"], [["Split PR", "git", 2], ["Squint", "bot", 8], ["Feature flag", "cloud", 4], ["Add tests later", "flask", 9]])
];

const complications = [
  "Legal joined the thread and typed only 'hmm'.",
  "The staging database is now emotionally attached to production.",
  "Every alert is firing, but only in lowercase.",
  "The model insists the incident is a feature preview.",
  "The YAML parser discovered sarcasm.",
  "The release captain renamed the branch to surely-this-time.",
  "The dashboard refreshed into a motivational quote.",
  "The rollback plan depends on a laptop at 3% battery.",
  "A dependency update brought seventeen new opinions.",
  "The incident doc has more owners than paragraphs."
];

const introFeed = [
  { id: 1, tag: "deploy", text: "production deployed by confidence" },
  { id: 2, tag: "mcp", text: "filesystem.write claims it is helping" },
  { id: 3, tag: "agent", text: "autofix branch is looking directly at billing" },
  { id: 4, tag: "ci", text: "flaky test passed after compliment" }
];

let state = loadState() ?? {
  teams: structuredClone(defaultTeams),
  round: 1,
  incidentIndex: 0,
  chaos: 47,
  uptime: 76,
  pressure: 62,
  timer: roundSeconds,
  isRunning: false,
  feed: introFeed,
  selectedTeamId: 1,
  selectedTool: null,
  complication: null,
  panicMode: false,
  muted: false,
  showRules: false
};

let intervalId = null;
const root = document.querySelector("#root");

render();
syncTimer();

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  if (action === "next") nextRound();
  if (action === "timer") toggleTimer();
  if (action === "rules") {
    playEffect("menu");
    update({ showRules: true });
  }
  if (action === "close-rules") {
    playEffect("close");
    update({ showRules: false });
  }
  if (action === "score") awardTeam(state.selectedTeamId);
  if (action === "sabotage") sabotage();
  if (action === "panic") togglePanic();
  if (action === "reset") resetGame();
  if (action === "mute") toggleSound();
  if (action === "team") update({ selectedTeamId: Number(button.dataset.teamId) });
  if (action === "tool") useTool(incidents[state.incidentIndex].tools[Number(button.dataset.toolIndex)]);
});

document.addEventListener("input", (event) => {
  const input = event.target;
  if (!input.matches("[data-team-name]")) return;
  const teamId = Number(input.dataset.teamName);
  state.teams = state.teams.map((team) => (team.id === teamId ? { ...team, name: input.value } : team));
  saveState();
});

document.addEventListener("keydown", (event) => {
  if (event.target instanceof HTMLInputElement) return;
  const key = event.key.toLowerCase();
  if (key === "n") nextRound();
  if (key === " ") {
    event.preventDefault();
    toggleTimer();
  }
  if (key === "x") sabotage();
  if (key === "p") togglePanic();
  if (key === "r") {
    playEffect(state.showRules ? "close" : "menu");
    update({ showRules: !state.showRules });
  }
  if (["1", "2", "3", "4"].includes(key)) awardTeam(Number(key));
});

function incident(title, source, severity, body, logs, tools) {
  return {
    title,
    source,
    severity,
    body,
    logs,
    tools: tools.map(([label, icon, risk]) => ({ label, icon, risk }))
  };
}

function svg(paths) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths
    .split("|")
    .map((path) => `<path d="${path}"></path>`)
    .join("")}</svg>`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState() {
  const { isRunning, showRules, ...saved } = state;
  localStorage.setItem(storageKey, JSON.stringify(saved));
}

function update(patch) {
  state = { ...state, ...patch };
  saveState();
  render();
  syncTimer();
}

function syncTimer() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
  if (!state.isRunning) return;
  intervalId = window.setInterval(() => {
    if (state.timer <= 1) {
      addFeed("timer", "round ended; ship a take before confidence expires", false);
      playEffect("timeout");
      update({ timer: 0, isRunning: false, chaos: clamp(state.chaos + 6, 0, 100) });
      return;
    }
    update({ timer: state.timer - 1 });
  }, 1000);
}

function nextRound() {
  playEffect("next");
  let nextIndex = Math.floor(Math.random() * incidents.length);
  if (nextIndex === state.incidentIndex) nextIndex = (nextIndex + 1) % incidents.length;
  state.round += 1;
  state.incidentIndex = nextIndex;
  state.timer = roundSeconds;
  state.isRunning = true;
  state.selectedTool = null;
  state.complication = null;
  state.chaos = clamp(state.chaos + (state.panicMode ? 7 : 2), 0, 100);
  state.pressure = clamp(state.pressure + 5, 0, 100);
  addFeed("round", `round ${state.round} loaded; explain the disaster confidently`);
  update({});
}

function toggleTimer() {
  playEffect(state.isRunning ? "pause" : "start");
  update({ isRunning: !state.isRunning });
}

function useTool(tool) {
  playEffect(tool.risk > 7 ? "riskyTool" : "tool");
  const swing = Math.round((Math.random() * 16 - tool.risk) * (state.panicMode ? 1.4 : 1));
  addFeed("tool", `${tool.label.toLowerCase()} changed uptime by ${swing > 0 ? "+" : ""}${swing}%`, false);
  update({
    selectedTool: tool.label,
    chaos: clamp(state.chaos + tool.risk - 5, 0, 100),
    uptime: clamp(state.uptime + swing, 0, 100),
    pressure: clamp(state.pressure + tool.risk - 4, 0, 100)
  });
}

function awardTeam(teamId) {
  playEffect("score");
  const bonus = Math.max(100, 800 + (state.round % 5) * 75 + Math.round((100 - state.chaos) * 4));
  const winner = state.teams.find((team) => team.id === teamId);
  state.teams = state.teams.map((team) =>
    team.id === teamId
      ? { ...team, score: team.score + bonus, heat: clamp(team.heat + 2, 0, 12) }
      : { ...team, heat: clamp(team.heat - 1, 0, 12) }
  );
  addFeed("score", `${winner?.name ?? "team"} earned ${bonus} points for survivable nonsense`);
  update({});
}

function sabotage() {
  playEffect("sabotage");
  const complication = randomItem(complications);
  addFeed("sabotage", complication, false);
  update({
    complication,
    chaos: clamp(state.chaos + 12, 0, 100),
    pressure: clamp(state.pressure + 9, 0, 100)
  });
}

function togglePanic() {
  playEffect(state.panicMode ? "cooldown" : "panic");
  const next = !state.panicMode;
  addFeed("panic", next ? "panic mode armed; all takes are now production" : "panic mode cooled down to merely dramatic", false);
  update({ panicMode: next, chaos: clamp(state.chaos + (next ? 10 : -8), 0, 100) });
}

function resetGame() {
  playEffect("reset");
  localStorage.removeItem(storageKey);
  state = {
    teams: structuredClone(defaultTeams),
    round: 1,
    incidentIndex: 0,
    chaos: 47,
    uptime: 76,
    pressure: 62,
    timer: roundSeconds,
    isRunning: false,
    feed: introFeed,
    selectedTeamId: 1,
    selectedTool: null,
    complication: null,
    panicMode: false,
    muted: false,
    showRules: false
  };
  render();
  syncTimer();
}

function toggleSound() {
  if (state.muted) {
    state.muted = false;
    saveState();
    render();
    playEffect("unmute");
    return;
  }
  playEffect("mute");
  update({ muted: true });
}

function getAudioContext() {
  if (!AudioContextClass) return null;
  if (!audioEngine.context) {
    audioEngine.context = new AudioContextClass();
    audioEngine.master = audioEngine.context.createGain();
    audioEngine.master.gain.value = 0.14;
    audioEngine.master.connect(audioEngine.context.destination);
  }
  return audioEngine.context;
}

function playEffect(name) {
  if (state.muted) return;
  const context = getAudioContext();
  if (!context || !audioEngine.master) return;
  context.resume?.().catch(() => {});
  const now = context.currentTime + 0.01;
  const patterns = {
    start: [[392, 0, 0.06, "square"], [588, 0.07, 0.08, "square"]],
    pause: [[260, 0, 0.08, "triangle"], [196, 0.08, 0.1, "triangle"]],
    next: [[330, 0, 0.05, "square"], [495, 0.055, 0.05, "square"], [742, 0.11, 0.09, "square"]],
    score: [[523, 0, 0.06, "triangle"], [659, 0.07, 0.06, "triangle"], [880, 0.14, 0.12, "square"]],
    tool: [[220, 0, 0.045, "sawtooth"], [440, 0.05, 0.06, "square"]],
    riskyTool: [[185, 0, 0.05, "sawtooth"], [277, 0.045, 0.05, "sawtooth"], [139, 0.1, 0.08, "square"]],
    sabotage: [[110, 0, 0.08, "sawtooth"], [92, 0.075, 0.08, "sawtooth"], [73, 0.15, 0.12, "square"]],
    panic: [[880, 0, 0.06, "square"], [660, 0.07, 0.06, "square"], [990, 0.14, 0.08, "square"]],
    cooldown: [[440, 0, 0.08, "triangle"], [330, 0.08, 0.1, "triangle"]],
    timeout: [[196, 0, 0.12, "sawtooth"], [147, 0.14, 0.16, "sawtooth"]],
    reset: [[247, 0, 0.07, "triangle"], [247, 0.085, 0.07, "triangle"]],
    menu: [[660, 0, 0.04, "triangle"]],
    close: [[330, 0, 0.045, "triangle"]],
    unmute: [[523, 0, 0.05, "triangle"], [784, 0.06, 0.08, "triangle"]],
    mute: [[196, 0, 0.08, "triangle"]]
  };
  for (const [frequency, offset, duration, type] of patterns[name] ?? patterns.tool) {
    tone(context, frequency, now + offset, duration, type);
  }
}

function tone(context, frequency, start, duration, type) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency * 0.94), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.58, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain);
  gain.connect(audioEngine.master);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function addFeed(tag, text, shouldRender = true) {
  state.feed = [{ id: Date.now() + Math.random(), tag, text }, ...state.feed].slice(0, 11);
  if (shouldRender) update({});
}

function render() {
  const current = incidents[state.incidentIndex];
  const selectedTeam = state.teams.find((team) => team.id === state.selectedTeamId) ?? state.teams[0];
  const highestScore = Math.max(...state.teams.map((team) => team.score), 1);
  root.innerHTML = `
    <main class="app-shell ${state.panicMode ? "panic" : ""}">
      <img class="room-art" src="assets/game/arcade-command-room.png" alt="" aria-hidden="true" />
      <div class="scanline" aria-hidden="true"></div>
      <header class="topbar">
        <div class="brand">
          <div class="brand-mark">${icons.rocket}</div>
          <div>
            <h1>Runtime Rodeo</h1>
            <p>Survive incidents. Ship maybe.</p>
          </div>
        </div>
        <div class="status-strip" aria-label="Game status">
          <div class="status-chip">Game code: RR-${(1000 + state.round * 37).toString(16).toUpperCase()}</div>
          <div class="status-chip good">Players: ${state.teams.length * 4}</div>
          <div class="status-chip yellow">Round: ${state.round}</div>
          <div class="status-chip cyan">Mode: ${state.panicMode ? "Panic" : "Classic chaos"}</div>
          <button class="icon-button" type="button" data-action="rules" aria-label="Show rules">${icons.shield}</button>
        </div>
      </header>
      <section class="metrics-grid" aria-label="Runtime metrics">
        ${metricCard("Chaos level", `${state.chaos}%`, icons.flame, "coral", state.chaos, "Everything is fine.")}
        <div class="metric-card uptime-card">
          <div class="metric-heading"><span>System uptime</span><strong>${state.uptime}%</strong></div>
          <div class="sparkline" aria-hidden="true">${Array.from({ length: 46 }, (_, index) => `<i style="height:${20 + ((index * 17 + state.uptime) % 42)}%"></i>`).join("")}</div>
          <div class="scale"><span>on fire</span><span>holding on</span><span>stable-ish</span></div>
        </div>
        ${metricCard("Prod pressure", state.pressure > 82 ? "MAX" : `${state.pressure}%`, icons.gauge, "cyan", state.pressure, "Traffic: absurd")}
        <div class="timer-card">
          <span>Time left</span>
          <strong>${formatClock(state.timer)}</strong>
          <button type="button" data-action="timer">${state.isRunning ? icons.pause : icons.play}${state.isRunning ? "Pause" : "Start"}</button>
        </div>
      </section>
      <section class="game-grid">
        <aside class="feed-panel" aria-label="Incident feed">
          <div class="panel-title"><span>#incident-feed</span><b>Live</b></div>
          <div class="feed-list">
            ${state.feed.map((item) => feedItem(item)).join("")}
          </div>
        </aside>
        <section class="incident-card" aria-label="Current incident">
          <div class="incident-meta">
            <span>${icons.alert} Incident #${String(state.round).padStart(2, "0")}</span>
            <span>Source: ${escapeHtml(current.source)}</span>
            <span class="severity">Severity: ${escapeHtml(current.severity)}</span>
          </div>
          <h2>${escapeHtml(current.title)}</h2>
          <p>${escapeHtml(current.body)}</p>
          ${state.complication ? `<div class="complication" role="status">${icons.zap}<span>${escapeHtml(state.complication)}</span></div>` : ""}
          <div class="terminal-window" aria-label="Terminal output">
            ${current.logs.map((line) => `<code>${escapeHtml(line)}</code>`).join("")}
          </div>
          <div class="toolbelt" aria-label="Available tools">
            ${current.tools
              .map(
                (tool, index) => `
                  <button class="tool ${state.selectedTool === tool.label ? "active" : ""}" type="button" data-action="tool" data-tool-index="${index}">
                    ${icons[tool.icon]}
                    <span>${escapeHtml(tool.label)}</span>
                    <small>risk ${tool.risk}</small>
                  </button>`
              )
              .join("")}
          </div>
        </section>
        <aside class="scoreboard" aria-label="Team scoreboard">
          ${state.teams.map((team, index) => teamCard(team, index, highestScore)).join("")}
        </aside>
      </section>
      <section class="control-deck" aria-label="Host controls">
        <div class="host-copy">
          ${icons.wrench}
          <div><strong>Host controls</strong><span>${escapeHtml(selectedTeam.name)} is armed for points.</span></div>
        </div>
        ${controlButton("next", "cyan", icons.rocket, "Next round", "N")}
        ${controlButton("score", "yellow", icons.trophy, "Score", "1-4")}
        ${controlButton("sabotage", "coral", icons.hammer, "Sabotage", "X")}
        ${controlButton("panic", "panic-toggle", icons.alert, state.panicMode ? "Cool down" : "Panic mode", "P")}
        ${controlButton("reset", "ghost", icons.reset, "Reset", "")}
      </section>
      <footer class="shortcut-bar">
        <span>Shortcuts:</span>
        <kbd>Space</kbd> timer
        <kbd>N</kbd> next
        <kbd>1</kbd>-<kbd>4</kbd> score
        <kbd>X</kbd> sabotage
        <kbd>R</kbd> rules
        <button type="button" data-action="mute">${icons.volume}${state.muted ? "Muted" : "Sound on"}</button>
      </footer>
      ${state.showRules ? rulesModal() : ""}
    </main>`;
}

function metricCard(label, value, icon, tone, bars, caption) {
  return `<div class="metric-card ${tone}">
    <div class="metric-label">${icon}<span>${escapeHtml(label)}</span></div>
    <strong>${escapeHtml(value)}</strong>
    <div class="bar-stack" aria-hidden="true">
      ${Array.from({ length: 18 }, (_, index) => `<i class="${index < Math.round((bars / 100) * 18) ? "filled" : ""}"></i>`).join("")}
    </div>
    <small>${escapeHtml(caption)}</small>
  </div>`;
}

function teamCard(team, index, highestScore) {
  return `<button class="team-card ${team.accent} ${team.id === state.selectedTeamId ? "selected" : ""}" type="button" data-action="team" data-team-id="${team.id}">
    <span class="rank">${String(index + 1).padStart(2, "0")}</span>
    <div class="team-info">
      <input aria-label="Team ${index + 1} name" data-team-name="${team.id}" value="${escapeAttribute(team.name)}" />
      <small>${escapeHtml(team.motto)}</small>
      <div class="heat-meter" aria-label="${escapeAttribute(team.name)} heat">
        ${Array.from({ length: 12 }, (_, heatIndex) => `<i class="${heatIndex < team.heat ? "on" : ""}"></i>`).join("")}
      </div>
    </div>
    <div class="score">
      <small>score</small>
      <strong>${team.score.toLocaleString()}</strong>
      <span style="width:${Math.max(12, (team.score / highestScore) * 100)}%"></span>
    </div>
  </button>`;
}

function feedItem(item) {
  const time = item.id > 1000 ? new Date(item.id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "00:00";
  return `<div class="feed-item"><span>${time}</span><b>[${escapeHtml(item.tag)}]</b><p>${escapeHtml(item.text)}</p></div>`;
}

function controlButton(action, tone, icon, label, key) {
  return `<button class="control ${tone}" type="button" data-action="${action}">
    ${icon}<span>${escapeHtml(label)}</span>${key ? `<kbd>${escapeHtml(key)}</kbd>` : "<i></i>"}
  </button>`;
}

function rulesModal() {
  return `<div class="modal-backdrop" role="presentation" data-action="close-rules">
    <section class="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-title">
      <h2 id="rules-title">How to play</h2>
      <ol>
        <li>Reveal an incident and start the timer.</li>
        <li>Teams pitch the most survivable, funniest hotfix.</li>
        <li>Use a tool card when the room wants extra chaos.</li>
        <li>Award points to the best explanation, not the most correct one.</li>
        <li>Hit sabotage when everyone looks too comfortable.</li>
      </ol>
      <button type="button" data-action="close-rules">Back to the incident</button>
    </section>
  </div>`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function formatClock(value) {
  const mins = Math.floor(value / 60).toString().padStart(2, "0");
  const secs = (value % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, "&#96;");
}
