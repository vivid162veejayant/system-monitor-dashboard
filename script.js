// ---------------- MODE SYSTEM ----------------
let systemMode = "idle";
let modeTime = 0;

function updateMode() {
  modeTime--;

  if (modeTime <= 0) {
    let modes = ["idle", "normal", "heavy"];
    systemMode = modes[Math.floor(Math.random() * modes.length)];

    modeTime = Math.floor(Math.random() * 10) + 5; // 5–15 sec
  }
}

// ---------------- STATE ----------------
let state = {
  cpu: 30,
  ram: 40,
  disk: 20,
  gpu: 25
};

const ids = ["cpu", "ram", "disk", "gpu"];

// ---------------- CHART ----------------
const ctx = document.getElementById("usageChart").getContext("2d");

let labels = [];
let cpuData = [];
let ramData = [];

const chart = new Chart(ctx, {
  type: "line",
  data: {
    labels: labels,
    datasets: [
      {
        label: "CPU",
        data: cpuData,
        borderColor: "#22c55e",
        fill: false,
      },
      {
        label: "RAM",
        data: ramData,
        borderColor: "#38bdf8",
        fill: false,
      }
    ]
  },
  options: {
    animation: false,
    scales: {
      y: { min: 0, max: 100 }
    }
  }
});

// ---------------- VALUE ENGINE ----------------
function nextValue(current, type) {
  let target;

  // LOWER and more realistic baselines
  if (systemMode === "idle") target = 15;
  else if (systemMode === "normal") target = 35;
  else target = 60; // heavy (reduced from 75)

  // Component tuning
  if (type === "ram") target += 10;   // RAM slightly higher
  if (type === "disk") target -= 5;   // Disk lower

  // MUCH weaker pull (this is key)
  let pull = (target - current) * 0.03;

  // Reduced noise
  let noise = (Math.random() - 0.5) * 4;

  let next = current + pull + noise;

  // Rare spike (controlled)
  if (Math.random() < 0.02) {
    next += Math.random() * 20;
  }

  // Soft cap behavior (prevents sticking high)
  if (next > 80) {
    next -= Math.random() * 8;
  }

  // Clamp
  next = Math.max(0, Math.min(100, next));

  return Math.floor(next);
}

// ---------------- MAIN LOOP ----------------
function updateStats() {

  updateMode(); // ✅ CRITICAL (mode changes happen here)

  // Update state
  ids.forEach(id => {
    state[id] = nextValue(state[id], id);
  });

  // UI update
  ids.forEach(id => {
    let val = state[id];

    document.getElementById(id + "Text").innerText = val + "%";
    document.getElementById(id + "Bar").style.width = val + "%";

    let bar = document.getElementById(id + "Bar");

    // Color logic
    if (val > 80) bar.style.background = "#ef4444";
    else if (val > 50) bar.style.background = "#f59e0b";
    else bar.style.background = "#22c55e";

    // Alert
    if (val > 90) showAlert(id.toUpperCase() + " usage high!");
  });

  // Graph update
  let time = new Date().toLocaleTimeString();

  labels.push(time);
  cpuData.push(state.cpu);
  ramData.push(state.ram);

  if (labels.length > 10) {
    labels.shift();
    cpuData.shift();
    ramData.shift();
  }

  chart.update();

  // Clock
  document.getElementById("time").innerText = time;

  // Optional: show mode (if you added element)
  let modeEl = document.getElementById("mode");
  if (modeEl) modeEl.innerText = systemMode.toUpperCase();
}

// ---------------- ALERT ----------------
function showAlert(msg) {
  let box = document.createElement("div");
  box.className = "alert-box";
  box.innerText = msg;

  document.body.appendChild(box);

  setTimeout(() => box.remove(), 2000);
}

// ---------------- START ----------------
setInterval(updateStats, 1000);